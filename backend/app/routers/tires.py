from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/tires", tags=["tires"])


@router.get("", response_model=list[schemas.TireOut])
def list_tires(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Tire).all()


@router.post("", response_model=schemas.TireOut)
def create_tire(tire_in: schemas.TireCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    tire = models.Tire(**tire_in.dict())
    db.add(tire)
    db.commit()
    db.refresh(tire)
    return tire


@router.patch("/{tire_id}", response_model=schemas.TireOut)
def update_tire(
    tire_id: int,
    tire_in: schemas.TireUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    tire = db.get(models.Tire, tire_id)
    if not tire:
        raise HTTPException(status_code=404, detail="Tire not found")
    data = tire_in.dict(exclude_none=True)
    if "serial" in data:
        existing = db.query(models.Tire).filter(models.Tire.serial == data["serial"]).first()
        if existing and existing.id != tire_id:
            raise HTTPException(status_code=400, detail="Serial already exists")
    for field, value in data.items():
        setattr(tire, field, value)
    db.commit()
    db.refresh(tire)
    return tire


@router.post("/assign", response_model=schemas.TireAssignmentOut)
def assign_tire(assignment_in: schemas.TireAssignmentCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    assignment = models.TireAssignment(**assignment_in.dict())
    db.add(assignment)
    tire = db.get(models.Tire, assignment_in.tire_id)
    if tire:
        tire.status = "installed"
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/assignments", response_model=list[schemas.TireAssignmentOut])
def list_assignments(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.TireAssignment).all()


@router.get("/services", response_model=list[schemas.TireServiceOut])
def list_services(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.TireService).order_by(models.TireService.created_at.desc()).all()


@router.post("/services", response_model=schemas.TireServiceOut)
def create_service(service_in: schemas.TireServiceCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    tire = db.get(models.Tire, service_in.tire_id)
    if not tire:
        raise HTTPException(status_code=404, detail="Tire not found")
    service = models.TireService(**service_in.dict())
    db.add(service)
    if service_in.tread_depth is not None:
        tire.tread_depth = service_in.tread_depth
    if service_in.mileage is not None:
        tire.mileage = service_in.mileage
    if service_in.service_type in {"replace", "retire"}:
        tire.status = "retired"
    db.commit()
    db.refresh(service)
    return service


@router.get("/alerts")
def tire_alerts(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Tire).filter(models.Tire.tread_depth < 3).all()
