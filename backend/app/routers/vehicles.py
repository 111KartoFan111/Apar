from datetime import date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.csv_utils import parse_csv_upload, validate_rows, csv_response
from app.database import get_db

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("", response_model=list[schemas.VehicleOut])
def list_vehicles(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Vehicle).all()


@router.post("", response_model=schemas.VehicleOut)
def create_vehicle(vehicle_in: schemas.VehicleCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    existing = db.query(models.Vehicle).filter(models.Vehicle.plate_number == vehicle_in.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle already exists")
    vehicle = models.Vehicle(**vehicle_in.dict())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.get("/fuel", response_model=list[schemas.FuelEntryOut])
def list_fuel(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.FuelEntry).order_by(models.FuelEntry.date.desc()).all()


@router.get("/export", response_class=PlainTextResponse)
def export_vehicles(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicles = db.query(models.Vehicle).all()
    headers = ["plate_number", "model", "manufacturer", "year", "status", "mileage", "fuel_type", "avg_consumption", "notes"]
    rows = [[
        v.plate_number, v.model, v.manufacturer or "", v.year or "", v.status, v.mileage, v.fuel_type, v.avg_consumption, v.notes or ""
    ] for v in vehicles]
    return csv_response(headers, rows)


@router.get("/fuel/export", response_class=PlainTextResponse)
def export_fuel(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    fuel_entries = db.query(models.FuelEntry).all()
    headers = ["vehicle_id", "date", "liters", "price", "odometer", "station", "notes"]
    rows = [[
        f.vehicle_id, f.date.isoformat(), f.liters, f.price, f.odometer, f.station or "", f.notes or ""
    ] for f in fuel_entries]
    return csv_response(headers, rows)


@router.post("/import")
def import_vehicles(file: UploadFile = File(...), db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    reader = parse_csv_upload(file)
    data, errors = validate_rows(reader, ["plate_number", "model"])
    imported = 0
    for idx, row in data:
        if db.query(models.Vehicle).filter(models.Vehicle.plate_number == row["plate_number"]).first():
            continue
        vehicle = models.Vehicle(
            plate_number=row["plate_number"],
            model=row["model"],
            manufacturer=row.get("manufacturer"),
            year=int(row["year"]) if row.get("year") else None,
            status=row.get("status") or "active",
            mileage=float(row.get("mileage") or 0),
            fuel_type=row.get("fuel_type") or "petrol",
            avg_consumption=float(row.get("avg_consumption") or 0),
            notes=row.get("notes"),
        )
        db.add(vehicle)
        imported += 1
    db.commit()
    return {"imported": imported, "errors": errors}


@router.post("/fuel/import")
def import_fuel(file: UploadFile = File(...), db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    reader = parse_csv_upload(file)
    data, errors = validate_rows(reader, ["vehicle_id", "date", "liters", "price", "odometer"])
    imported = 0
    for idx, row in data:
        try:
            vehicle_id = int(row["vehicle_id"])
            entry = models.FuelEntry(
                vehicle_id=vehicle_id,
                date=date.fromisoformat(row["date"]),
                liters=float(row["liters"]),
                price=float(row["price"]),
                odometer=float(row["odometer"]),
                station=row.get("station"),
                notes=row.get("notes"),
                anomaly_flag=_flag_anomaly(float(row["liters"]), float(row["odometer"]), None),
            )
            db.add(entry)
            imported += 1
        except Exception as exc:  # noqa: BLE001
            errors.append(f"Row {idx}: {exc}")
    db.commit()
    return {"imported": imported, "errors": errors}


@router.get("/{vehicle_id}", response_model=schemas.VehicleOut)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle = db.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=schemas.VehicleOut)
def update_vehicle(vehicle_id: int, vehicle_in: schemas.VehicleUpdate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle = db.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    for field, value in vehicle_in.dict(exclude_none=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}")
def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle = db.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
    return {"ok": True}


@router.post("/{vehicle_id}/status")
def add_status(vehicle_id: int, payload: dict, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle = db.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    status_value = payload.get("status")
    comment = payload.get("comment")
    status_row = models.VehicleStatus(vehicle_id=vehicle_id, status=status_value, comment=comment)
    db.add(status_row)
    vehicle.status = status_value
    db.commit()
    return {"ok": True}


@router.get("/{vehicle_id}/costs")
def vehicle_costs(vehicle_id: int, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.VehicleCost).filter(models.VehicleCost.vehicle_id == vehicle_id).all()


def _flag_anomaly(liters: float, odometer: float, last_odometer: float | None) -> bool:
    if liters > 200:
        return True
    if last_odometer and odometer < last_odometer:
        return True
    return False


@router.post("/{vehicle_id}/fuel", response_model=schemas.FuelEntryOut)
def add_fuel(vehicle_id: int, fuel_in: schemas.FuelEntryCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle = db.get(models.Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    last = (
        db.query(models.FuelEntry)
        .filter(models.FuelEntry.vehicle_id == vehicle_id)
        .order_by(models.FuelEntry.date.desc())
        .first()
    )
    anomaly = _flag_anomaly(fuel_in.liters, fuel_in.odometer, last.odometer if last else None)
    entry = models.FuelEntry(**fuel_in.dict(), anomaly_flag=anomaly)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
