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

Every generated template is locked down against import errors: the header
row and any cell outside the defined columns/row range are protected,
row/column insertion and deletion is blocked, and each column gets a data
validation matching its Prisma type (whole number, decimal, date, or enum
dropdown) with an English error message.

Usage:
    python3 generate_excel_templates.py [--schema PATH] [--output DIR]
    python3 generate_excel_templates.py --protect-existing [--schema PATH] [--output DIR]
"""

import argparse
import re
from datetime import date
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill, Protection
from openpyxl.workbook.protection import WorkbookProtection
from openpyxl.worksheet.datavalidation import DataValidation, DataValidationList
from openpyxl.worksheet.worksheet import Worksheet

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

# Number of data rows (below the header) that stay unlocked/validated so new
# rows can be entered later without re-running the generator. Everything
# below this, and every column beyond the last header, stays locked.
MAX_DATA_ROW = 1000

LISTS_SHEET_NAME = "_lists"

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


def number_format_for(field: dict, enums: dict[str, list[str]]) -> str | None:
    """Excel number_format matching the field's Prisma type, or None for General."""
    base_type = field["base_type"]

    if field["is_list"] or base_type in enums:
        return "@"
    if base_type in ("Int", "BigInt"):
        return "#,##0"
    if base_type in ("Float", "Decimal"):
        return "#,##0.00"
    if base_type == "DateTime":
        return "yyyy-mm-dd"
    if base_type == "Boolean":
        return None
    return "@"


def table_name_for(model_name: str, body: str) -> str:
    map_match = TABLE_MAP_RE.search(body)
    return map_match.group(1) if map_match else camel_to_snake(model_name)


def write_lists_sheet(wb: Workbook, enums_used: dict[str, list[str]]) -> dict[str, str]:
    """
    Writes each enum's values into a hidden helper sheet and returns a map of
    enum name -> range reference, so list validations can point at a range
    instead of an inline comma string. Inline lists are capped at 255
    characters by Excel, which silently drops the dropdown for large enums
    (e.g. Currency); a range reference has no such limit.
    """
    if not enums_used:
        return {}

    lists_ws = wb.create_sheet(LISTS_SHEET_NAME)
    refs = {}
    for col_idx, (enum_name, values) in enumerate(sorted(enums_used.items()), start=1):
        col_letter = lists_ws.cell(row=1, column=col_idx).column_letter
        lists_ws.cell(row=1, column=col_idx, value=enum_name)
        for row_idx, value in enumerate(values, start=2):
            lists_ws.cell(row=row_idx, column=col_idx, value=value)
        last_row = len(values) + 1
        refs[enum_name] = f"{LISTS_SHEET_NAME}!${col_letter}$2:${col_letter}${last_row}"

    lists_ws.sheet_state = "veryHidden"
    return refs


def data_validation_for(field: dict, enums: dict, list_refs: dict[str, str]) -> DataValidation | None:
    """Data validation enforcing the field's Prisma type, with an English error message."""
    base_type = field["base_type"]
    allow_blank = not field["required"]

    if base_type in enums and not field["is_list"]:
        return DataValidation(
            type="list",
            formula1=list_refs[base_type],
            allow_blank=allow_blank,
            showErrorMessage=True,
            errorTitle="Invalid value",
            error="Please select a value from the dropdown list.",
        )
    if field["is_list"]:
        return None
    if base_type in ("Int", "BigInt"):
        return DataValidation(
            type="whole",
            operator="between",
            formula1=-2147483648,
            formula2=2147483647,
            allow_blank=allow_blank,
            showErrorMessage=True,
            errorTitle="Invalid number",
            error="Please enter a whole number.",
        )
    if base_type in ("Float", "Decimal"):
        return DataValidation(
            type="decimal",
            operator="between",
            formula1=-999999999999.0,
            formula2=999999999999.0,
            allow_blank=allow_blank,
            showErrorMessage=True,
            errorTitle="Invalid number",
            error="Please enter a numeric value.",
        )
    if base_type == "DateTime":
        return DataValidation(
            type="date",
            operator="between",
            formula1=date(1900, 1, 1),
            formula2=date(2999, 12, 31),
            allow_blank=allow_blank,
            showErrorMessage=True,
            errorTitle="Invalid date",
            error="Please enter a valid date (YYYY-MM-DD).",
        )
    if base_type == "Boolean":
        return DataValidation(
            type="list",
            formula1='"TRUE,FALSE"',
            allow_blank=allow_blank,
            showErrorMessage=True,
            errorTitle="Invalid value",
            error="Please select TRUE or FALSE.",
        )
    return None


def lock_down_sheet(
    ws: Worksheet, fields: list[dict], enums: dict, list_refs: dict[str, str]
) -> None:
    """
    Locks every cell outside the defined columns/rows, adds a type-matching
    data validation to each data column, and enables sheet protection.
    Cells are locked by default in Excel, so only the intended data-entry
    range needs to be explicitly unlocked; everything else (header row,
    columns past the last field, rows past MAX_DATA_ROW) is protected for
    free once sheet protection is enabled.
    """
    for col_idx, field in enumerate(fields, start=1):
        column_letter = ws.cell(row=1, column=col_idx).column_letter

        for row in range(2, MAX_DATA_ROW + 1):
            ws.cell(row=row, column=col_idx).protection = Protection(locked=False)

        dv = data_validation_for(field, enums, list_refs)
        if dv:
            ws.add_data_validation(dv)
            dv.add(f"{column_letter}2:{column_letter}{MAX_DATA_ROW}")

    ws.protection.sheet = True


def write_workbook(
    table_name: str, fields: list[dict], enums: dict, output_dir: Path
) -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = table_name[:31]

    header_font = Font(bold=True)
    required_fill = PatternFill("solid", fgColor="FFF2CC")

    enums_used = {
        field["base_type"]: enums[field["base_type"]]
        for field in fields
        if field["base_type"] in enums and not field["is_list"]
    }
    list_refs = write_lists_sheet(wb, enums_used)

    for col_idx, field in enumerate(fields, start=1):
        header_cell = ws.cell(row=1, column=col_idx, value=field["column"])
        header_cell.font = header_font
        if field["required"]:
            header_cell.fill = required_fill

        column_letter = ws.cell(row=1, column=col_idx).column_letter
        ws.column_dimensions[column_letter].width = max(18, len(field["column"]) + 4)

        number_format = number_format_for(field, enums)
        if number_format:
            ws.column_dimensions[column_letter].number_format = number_format

    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{ws.cell(row=1, column=len(fields)).column_letter}1"

    lock_down_sheet(ws, fields, enums, list_refs)
    wb.security.lockStructure = True

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{table_name}.xlsx"
    wb.save(output_path)
    return output_path


def protect_existing_workbook(
    path: Path, fields: list[dict], enums: dict
) -> None:
    """Adds locking/validation to an already-filled template without touching any cell value."""
    wb = load_workbook(path)
    ws = wb.active

    headers = {
        cell.value: idx
        for idx, cell in enumerate(next(ws.iter_rows(min_row=1, max_row=1)), start=1)
    }
    matched_fields = [f for f in fields if f["column"] in headers]
    missing = [f["column"] for f in fields if f["column"] not in headers]
    if missing:
        print(f"  Warning: columns not found in {path.name}, skipping: {missing}")

    # Re-derive each field's actual column index from the file's own header
    # row rather than assuming it matches schema order.
    ordered_fields = sorted(matched_fields, key=lambda f: headers[f["column"]])

    # Drop any pre-existing validations so re-running this doesn't stack
    # duplicate/overlapping rules on top of the ones added below.
    ws.data_validations = DataValidationList()

    enums_used = {
        field["base_type"]: enums[field["base_type"]]
        for field in ordered_fields
        if field["base_type"] in enums and not field["is_list"]
    }
    if LISTS_SHEET_NAME in wb.sheetnames:
        del wb[LISTS_SHEET_NAME]
    list_refs = write_lists_sheet(wb, enums_used)

    for field in ordered_fields:
        col_idx = headers[field["column"]]
        column_letter = ws.cell(row=1, column=col_idx).column_letter

        for row in range(2, MAX_DATA_ROW + 1):
            ws.cell(row=row, column=col_idx).protection = Protection(locked=False)

        dv = data_validation_for(field, enums, list_refs)
        if dv:
            ws.add_data_validation(dv)
            dv.add(f"{column_letter}2:{column_letter}{MAX_DATA_ROW}")

    ws.protection.sheet = True
    if wb.security is None:
        wb.security = WorkbookProtection()
    wb.security.lockStructure = True
    wb.save(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--schema", type=Path, default=DEFAULT_SCHEMA)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing .xlsx files instead of skipping them",
    )
    parser.add_argument(
        "--protect-existing",
        action="store_true",
        help=(
            "Instead of generating new templates, lock down the existing "
            ".xlsx files in --output in place (data is preserved, only "
            "protection/validation is added or refreshed)"
        ),
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
        fields = parse_model_fields(body, model_names)
        if not fields:
            print(f"Skipping {model_name}: no fillable fields found")
            continue

        if args.protect_existing:
            if not output_path.exists():
                print(f"Skipping {model_name}: {output_path} does not exist")
                continue
            protect_existing_workbook(output_path, fields, enums)
            print(f"{model_name} -> {output_path} (protected)")
            continue

        if output_path.exists() and not args.force:
            print(
                f"Skipping {model_name}: {output_path} already exists (use --force to overwrite)"
            )
            continue

        write_workbook(table_name, fields, enums, args.output)
        print(f"{model_name} -> {output_path} ({len(fields)} columns)")


if __name__ == "__main__":
    main()
