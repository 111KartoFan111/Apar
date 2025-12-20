import os
import shutil
import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", "/app/uploads"))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

router = APIRouter(prefix="/inspections", tags=["inspections"])


@router.get("/templates", response_model=list[schemas.InspectionTemplateOut])
def list_templates(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.InspectionTemplate).all()


@router.post("/templates", response_model=schemas.InspectionTemplateOut)
def create_template(template_in: schemas.InspectionTemplateCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    template = models.InspectionTemplate(**template_in.dict())
    db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.post("/results")
def create_result(
    vehicle_id: int = Form(...),
    template_id: int = Form(...),
    payload: str = Form("{}"),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    template = db.get(models.InspectionTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    payload_data = json.loads(payload) if isinstance(payload, str) else payload
    attachment_path = None
    if file:
        attachment_path = UPLOAD_DIR / file.filename
        with attachment_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    result = models.InspectionResult(
        vehicle_id=vehicle_id,
        template_id=template_id,
        payload=payload_data,
        attachment=str(attachment_path) if attachment_path else None,
    )
    db.add(result)
    db.commit()
    return {"ok": True}
