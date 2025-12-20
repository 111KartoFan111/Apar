from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=list[schemas.PartOrderOut])
def list_orders(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.PartOrder).all()


@router.post("", response_model=schemas.PartOrderOut)
def create_order(order_in: schemas.PartOrderCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    order = models.PartOrder(**order_in.dict())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.put("/{order_id}", response_model=schemas.PartOrderOut)
def update_order(order_id: int, order_in: schemas.PartOrderCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    order = db.get(models.PartOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    for field, value in order_in.dict(exclude_none=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order
