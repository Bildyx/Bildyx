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


def convert(input_dir: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)

    excel_files = sorted(input_dir.glob("*.xlsx"))
    if not excel_files:
        print(f"No .xlsx files found in {input_dir}")
        return

    for excel_path in excel_files:
        csv_path = output_dir / f"{excel_path.stem}.csv"
        wb = load_workbook(excel_path, read_only=True, data_only=True)
        sheet = wb.active

        with csv_path.open("w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f, delimiter=";")
            for row in sheet.iter_rows(values_only=True):
                writer.writerow(["" if cell is None else cell for cell in row])

        wb.close()
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
    args = parser.parse_args()

    convert(args.input.resolve(), args.output.resolve())


if __name__ == "__main__":
    main()
