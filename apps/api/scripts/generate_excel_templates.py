#!/usr/bin/env python3
"""
Generates one Excel import template per targeted Prisma model.

Reads apps/api/prisma/schema.prisma, keeps only the "reference data" models
(industries, countries, cities, jobs, organizations, skills, certifications,
universities, study fields, military capabilities, degrees) and writes an
.xlsx file per model with the model's attributes as column headers, ready to
be filled in and imported into the database. Relation fields (back-references
to other models) and auto-managed columns (id, created_at, updated_at,
deleted_at) are skipped since they aren't meant to be filled in manually.

Usage:
    python3 generate_excel_templates.py [--schema PATH] [--output DIR]
"""

import argparse
import re
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_SCHEMA = SCRIPT_DIR.parent / "prisma" / "schema.prisma"
DEFAULT_OUTPUT = SCRIPT_DIR.parent / "data" / "excel_templates"

TARGET_MODELS = [
    "Industry",
    "Country",
    "City",
    "Job",
    "Organization",
    "Skill",
    "Certification",
    "University",
    "StudyFields",
    "MilitaryCapabilities",
    "Degree",
    "Subject",
]

# Auto-managed columns: never filled in manually.
EXCLUDED_FIELDS = {
    "id",
    "createdAt",
    "created_at",
    "updatedAt",
    "updated_at",
    "deletedAt",
    "deleted_at",
}

MODEL_RE = re.compile(r"model\s+(\w+)\s*\{(.*?)\n\}", re.S)
ENUM_RE = re.compile(r"enum\s+(\w+)\s*\{(.*?)\n\}", re.S)
FIELD_LINE_RE = re.compile(r"^([A-Za-z_]\w*)\s+([A-Za-z_]\w*(?:\[\])?\??)\s*(.*)$")
MAP_ATTR_RE = re.compile(r'@map\("([^"]+)"\)')
TABLE_MAP_RE = re.compile(r'@@map\("([^"]+)"\)')


def camel_to_snake(name: str) -> str:
    s = re.sub(r"(.)([A-Z][a-z]+)", r"\1_\2", name)
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s)
    return s.lower()


def parse_blocks(schema_text: str, pattern: re.Pattern) -> dict[str, str]:
    return {m.group(1): m.group(2) for m in pattern.finditer(schema_text)}


def parse_enum_values(body: str) -> list[str]:
    values = []
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith("//"):
            continue
        values.append(line.split()[0])
    return values


def parse_field_type(raw_type: str) -> tuple[str, bool, bool]:
    """Returns (base_type, is_optional, is_list)."""
    is_optional = raw_type.endswith("?")
    if is_optional:
        raw_type = raw_type[:-1]
    is_list = raw_type.endswith("[]")
    if is_list:
        raw_type = raw_type[:-2]
    return raw_type, is_optional, is_list


def parse_model_fields(body: str, model_names: set[str]) -> list[dict]:
    fields = []
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith("//") or line.startswith("@@"):
            continue
        m = FIELD_LINE_RE.match(line)
        if not m:
            continue
        field_name, raw_type, attrs = m.groups()
        base_type, is_optional, is_list = parse_field_type(raw_type)

        # Fields whose type is another model are relations, not real columns.
        if base_type in model_names:
            continue

        map_match = MAP_ATTR_RE.search(attrs)
        column_name = map_match.group(1) if map_match else field_name
        if field_name in EXCLUDED_FIELDS or column_name in EXCLUDED_FIELDS:
            continue

        required = not is_optional and not is_list and "@default(" not in attrs
        is_uuid_fk = "@db.Uuid" in attrs and (
            field_name.endswith("Id") or field_name.endswith("_id")
        )

        fields.append(
            {
                "column": column_name,
                "base_type": base_type,
                "is_list": is_list,
                "required": required,
                "is_uuid_fk": is_uuid_fk,
            }
        )
    return fields


def build_hint(field: dict, enums: dict[str, list[str]]) -> str:
    req = "required" if field["required"] else "optional"
    base_type = field["base_type"]

    if base_type in enums:
        kind = "enum list, comma-separated" if field["is_list"] else "enum"
        return f"{kind} ({req}): {' | '.join(enums[base_type])}"
    if field["is_list"]:
        return f"{base_type} list, comma-separated ({req})"
    if field["is_uuid_fk"]:
        return f"UUID of related record ({req})"
    if base_type == "Json":
        return f"JSON ({req})"
    if base_type in ("Int", "Float", "BigInt", "Decimal"):
        return f"number ({req})"
    if base_type == "Boolean":
        return f"true / false ({req})"
    if base_type == "DateTime":
        return f"date, e.g. 2026-07-07 ({req})"
    return f"text ({req})"


def table_name_for(model_name: str, body: str) -> str:
    map_match = TABLE_MAP_RE.search(body)
    return map_match.group(1) if map_match else camel_to_snake(model_name)


def write_workbook(
    table_name: str, fields: list[dict], enums: dict, output_dir: Path
) -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = table_name[:31]

    header_font = Font(bold=True)
    required_fill = PatternFill("solid", fgColor="FFF2CC")
    hint_font = Font(italic=True, color="808080", size=9)

    for col_idx, field in enumerate(fields, start=1):
        header_cell = ws.cell(row=1, column=col_idx, value=field["column"])
        header_cell.font = header_font
        if field["required"]:
            header_cell.fill = required_fill

        hint_cell = ws.cell(row=2, column=col_idx, value=build_hint(field, enums))
        hint_cell.font = hint_font
        hint_cell.alignment = Alignment(wrap_text=True, vertical="top")

        column_letter = ws.cell(row=1, column=col_idx).column_letter
        ws.column_dimensions[column_letter].width = max(18, len(field["column"]) + 4)

        if field["base_type"] in enums and not field["is_list"]:
            dv = DataValidation(
                type="list",
                formula1='"' + ",".join(enums[field["base_type"]]) + '"',
                allow_blank=not field["required"],
            )
            ws.add_data_validation(dv)
            dv.add(f"{column_letter}3:{column_letter}1000")

    ws.row_dimensions[2].height = 30
    ws.freeze_panes = "A3"
    ws.auto_filter.ref = f"A1:{ws.cell(row=1, column=len(fields)).column_letter}1"

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{table_name}.xlsx"
    wb.save(output_path)
    return output_path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--schema", type=Path, default=DEFAULT_SCHEMA)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing .xlsx files instead of skipping them",
    )
    args = parser.parse_args()

    schema_text = args.schema.read_text()
    model_bodies = parse_blocks(schema_text, MODEL_RE)
    enum_bodies = parse_blocks(schema_text, ENUM_RE)
    model_names = set(model_bodies.keys())
    enums = {name: parse_enum_values(body) for name, body in enum_bodies.items()}

    for model_name in TARGET_MODELS:
        if model_name not in model_bodies:
            print(f"Skipping {model_name}: not found in schema")
            continue

        body = model_bodies[model_name]
        table_name = table_name_for(model_name, body)
        output_path = args.output / f"{table_name}.xlsx"
        if output_path.exists() and not args.force:
            print(
                f"Skipping {model_name}: {output_path} already exists (use --force to overwrite)"
            )
            continue

        fields = parse_model_fields(body, model_names)
        if not fields:
            print(f"Skipping {model_name}: no fillable fields found")
            continue

        write_workbook(table_name, fields, enums, args.output)
        print(f"{model_name} -> {output_path} ({len(fields)} columns)")


if __name__ == "__main__":
    main()
