import csv
import io
from typing import Tuple, List, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException, status


def parse_csv_upload(file: UploadFile) -> csv.DictReader:
    content = file.file.read().decode("utf-8")
    return csv.DictReader(io.StringIO(content))


def validate_rows(reader: csv.DictReader, required_fields: List[str]) -> Tuple[List[Tuple[int, Dict[str, Any]]], List[str]]:
    data: List[Tuple[int, Dict[str, Any]]] = []
    errors: List[str] = []
    for idx, row in enumerate(reader, start=2):  # header is row 1
        missing = [field for field in required_fields if not row.get(field)]
        if missing:
            errors.append(f"Row {idx}: missing fields {', '.join(missing)}")
            continue
        data.append((idx, row))
    return data, errors


def csv_response(headers: List[str], rows: List[List[Any]]) -> str:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(headers)
    for row in rows:
        writer.writerow(row)
    return buffer.getvalue()
