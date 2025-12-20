from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models
from app.ai import ai_service
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/report-builder")
def ai_report_builder(payload: dict, _: models.User = Depends(get_current_user)):
    prompt = payload.get("prompt", "")
    constraints = payload.get("constraints")
    template = ai_service.build_report_template(prompt, constraints)
    return {"template": template}


@router.post("/waybill-normalize")
def ai_waybill(payload: dict, _: models.User = Depends(get_current_user)):
    purpose = payload.get("purpose", "")
    route_text = payload.get("routeText", "")
    return ai_service.waybill_normalize(purpose, route_text)


@router.post("/maintenance-advice")
def ai_maintenance(payload: dict, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    vehicle_summary = payload.get("vehicleSummary", "")
    return ai_service.maintenance_advice(vehicle_summary)
