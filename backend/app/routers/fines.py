from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/fines", tags=["fines"])


@router.get("", response_model=list[schemas.FineOut])
def list_fines(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.Fine).all()


@router.post("", response_model=schemas.FineOut)
def create_fine(fine_in: schemas.FineCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    fine = models.Fine(**fine_in.dict())
    db.add(fine)
    db.commit()
    db.refresh(fine)
    return fine


@router.patch("/{fine_id}", response_model=schemas.FineOut)
def update_fine(
    fine_id: int,
    fine_in: schemas.FineUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    fine = db.get(models.Fine, fine_id)
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")
    for field, value in fine_in.dict(exclude_none=True).items():
        setattr(fine, field, value)
    db.commit()
    db.refresh(fine)
    return fine
