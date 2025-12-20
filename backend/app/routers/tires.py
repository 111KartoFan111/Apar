from fastapi import APIRouter, Depends
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


@router.post("/assign", response_model=schemas.TireAssignmentOut)
def assign_tire(assignment_in: schemas.TireAssignmentCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    assignment = models.TireAssignment(**assignment_in.dict())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.get("/assignments", response_model=list[schemas.TireAssignmentOut])
def list_assignments(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.TireAssignment).all()


@router.get("/alerts")
def tire_alerts(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Tire).filter(models.Tire.tread_depth < 3).all()
