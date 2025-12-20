from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.csv_utils import parse_csv_upload, validate_rows, csv_response
from app.database import get_db

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.get("", response_model=list[schemas.WarehouseOut])
def list_warehouses(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Warehouse).all()


@router.post("", response_model=schemas.WarehouseOut)
def create_warehouse(warehouse_in: schemas.WarehouseCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    wh = models.Warehouse(**warehouse_in.dict())
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh


@router.get("/parts", response_model=list[schemas.PartOut])
def list_parts(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Part).all()


@router.get("/stocks", response_model=list[schemas.PartStockOut])
def list_stocks(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.PartStock).all()


@router.post("/parts", response_model=schemas.PartOut)
def create_part(part_in: schemas.PartCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    existing = db.query(models.Part).filter(models.Part.sku == part_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    part = models.Part(**part_in.dict())
    db.add(part)
    db.commit()
    db.refresh(part)
    return part


@router.post("/stock")
def move_stock(payload: dict, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    part_id = payload.get("part_id")
    warehouse_id = payload.get("warehouse_id")
    quantity = float(payload.get("quantity", 0))
    movement_type = payload.get("movement_type", "in")
    if not db.get(models.Part, part_id) or not db.get(models.Warehouse, warehouse_id):
        raise HTTPException(status_code=400, detail="Invalid warehouse or part")
    stock = (
        db.query(models.PartStock)
        .filter(models.PartStock.part_id == part_id, models.PartStock.warehouse_id == warehouse_id)
        .first()
    )
    if not stock:
        stock = models.PartStock(part_id=part_id, warehouse_id=warehouse_id, quantity=0)
        db.add(stock)
        db.flush()
    delta = quantity if movement_type != "out" else -quantity
    stock.quantity += delta
    movement = models.StockMovement(
        warehouse_id=warehouse_id,
        part_id=part_id,
        quantity=quantity,
        movement_type=movement_type,
        reference=payload.get("reference"),
    )
    db.add(movement)
    db.commit()
    return {"ok": True}


@router.get("/parts/export", response_class=PlainTextResponse)
def export_parts(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    parts = db.query(models.Part).all()
    headers = ["sku", "name", "unit", "cost"]
    rows = [[p.sku, p.name, p.unit, p.cost] for p in parts]
    return csv_response(headers, rows)


@router.get("/stocks/export", response_class=PlainTextResponse)
def export_stocks(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    stocks = db.query(models.PartStock).all()
    headers = ["warehouse_id", "part_id", "quantity"]
    rows = [[s.warehouse_id, s.part_id, s.quantity] for s in stocks]
    return csv_response(headers, rows)


@router.post("/parts/import", response_model=schemas.PartImportResult)
def import_parts(file: UploadFile = File(...), db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    reader = parse_csv_upload(file)
    data, errors = validate_rows(reader, ["sku", "name"])
    imported = 0
    for idx, row in data:
        if db.query(models.Part).filter(models.Part.sku == row["sku"]).first():
            continue
        try:
            part = models.Part(
                sku=row["sku"],
                name=row["name"],
                unit=row.get("unit") or "pcs",
                cost=float(row.get("cost") or 0),
            )
            db.add(part)
            imported += 1
        except Exception as exc:  # noqa: BLE001
            errors.append(f"Row {idx}: {exc}")
    db.commit()
    return schemas.PartImportResult(imported=imported, errors=errors)
