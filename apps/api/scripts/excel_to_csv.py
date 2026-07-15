#!/usr/bin/env python3
"""
Converts every .xlsx file in apps/api/data/excel into a .csv file in
apps/api/data (one CSV per workbook, using its active sheet).

Usage:
    python3 excel_to_csv.py [--input DIR] [--output DIR]
"""

import argparse
import csv
from pathlib import Path

from openpyxl import load_workbook

SCRIPT_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = SCRIPT_DIR.parent / "data" / "excel_templates"
DEFAULT_OUTPUT = SCRIPT_DIR.parent / "data"


def existing_data_row_count(csv_path: Path) -> int:
    if not csv_path.exists():
        return 0
    with csv_path.open("r", newline="", encoding="utf-8") as f:
        # -1 for the header row; a file with only a header (or empty) counts as 0.
        return max(sum(1 for _ in csv.reader(f, delimiter=";")) - 1, 0)


def convert(input_dir: Path, output_dir: Path, force: bool = False) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    excel_files = sorted(input_dir.glob("*.xlsx"))
    if not excel_files:
        print(f"No .xlsx files found in {input_dir}")
        return

    for excel_path in excel_files:
        csv_path = output_dir / f"{excel_path.stem}.csv"
        wb = load_workbook(excel_path, read_only=True, data_only=True)
        sheet = wb.active

        new_rows = []
        for row in sheet.iter_rows(values_only=True):
            if all(cell is None for cell in row):
                continue
            new_rows.append(["" if cell is None else cell for cell in row])
        wb.close()

        # Guard against silently wiping real business data: if the template
        # currently has fewer data rows than the CSV it's about to overwrite
        # (e.g. someone regenerated an empty/near-empty .xlsx template),
        # skip it instead of shrinking the file - this is exactly how
        # organizations.csv lost its 4 real rows in commit 87cb6cf.
        new_row_count = max(len(new_rows) - 1, 0)
        old_row_count = existing_data_row_count(csv_path)
        if not force and old_row_count > 0 and new_row_count < old_row_count:
            print(
                f"SKIP {excel_path.name}: would shrink {csv_path.name} from "
                f"{old_row_count} to {new_row_count} data rows - pass --force to overwrite anyway."
            )
            continue

        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, delimiter=";")
            writer.writerows(new_rows)

        print(f"{excel_path.name} -> {csv_path.relative_to(output_dir.parent)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--input",
        type=Path,
        default=DEFAULT_INPUT,
        help="Directory containing .xlsx files",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Directory to write .csv files to",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite a CSV even if it would shrink the number of data rows",
    )
    args = parser.parse_args()

    convert(args.input.resolve(), args.output.resolve(), force=args.force)


if __name__ == "__main__":
    main()
