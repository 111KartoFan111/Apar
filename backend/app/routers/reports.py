from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.csv_utils import csv_response
from app.database import get_db

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/templates", response_model=list[schemas.ReportTemplateOut])
def list_templates(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.ReportTemplate).all()


@router.post("/templates", response_model=schemas.ReportTemplateOut)
def create_template(template_in: schemas.ReportTemplateCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    tpl = models.ReportTemplate(**template_in.dict())
    db.add(tpl)
    db.commit()
    db.refresh(tpl)
    return tpl


def _run_template(db: Session, template: dict) -> schemas.ReportRunResult:
    tpl_type = template.get("type", "fuel_cost")
    if tpl_type == "fuel_cost":
        rows = (
            db.query(
                models.Vehicle.plate_number,
                func.sum(models.FuelEntry.price).label("total_cost"),
                func.sum(models.FuelEntry.liters).label("liters"),
            )
            .join(models.FuelEntry, models.FuelEntry.vehicle_id == models.Vehicle.id)
            .group_by(models.Vehicle.plate_number)
            .all()
        )
        headers = ["vehicle", "total_cost", "liters"]
        data_rows = [[r[0], float(r[1] or 0), float(r[2] or 0)] for r in rows]
    else:
        rows = db.query(models.Vehicle).all()
        headers = ["vehicle", "mileage", "status"]
        data_rows = [[v.plate_number, v.mileage, v.status] for v in rows]
    csv = csv_response(headers, data_rows)
    return schemas.ReportRunResult(headers=headers, rows=data_rows, csv=csv)


@router.post("/run", response_model=schemas.ReportRunResult)
def run_report(request: schemas.ReportRunRequest, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return _run_template(db, request.template)
