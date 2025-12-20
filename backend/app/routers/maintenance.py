from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.get("/schedules", response_model=list[schemas.MaintenanceScheduleOut])
def list_schedules(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.MaintenanceSchedule).all()


@router.post("/schedules", response_model=schemas.MaintenanceScheduleOut)
def create_schedule(schedule_in: schemas.MaintenanceScheduleCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    schedule = models.MaintenanceSchedule(**schedule_in.dict())
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return schedule


@router.get("/alerts")
def maintenance_alerts(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    upcoming_date = date.today() + timedelta(days=14)
    schedules = (
        db.query(models.MaintenanceSchedule)
        .filter(
            (models.MaintenanceSchedule.due_date != None)  # noqa: E711
            & (models.MaintenanceSchedule.due_date <= upcoming_date)
            | (models.MaintenanceSchedule.status != "done")
        )
        .all()
    )
    return schedules


@router.get("/work-orders", response_model=list[schemas.WorkOrderOut])
def list_work_orders(db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    return db.query(models.WorkOrder).all()


@router.post("/work-orders", response_model=schemas.WorkOrderOut)
def create_work_order(order_in: schemas.WorkOrderCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    order = models.WorkOrder(**order_in.dict())
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.put("/work-orders/{order_id}", response_model=schemas.WorkOrderOut)
def update_work_order(order_id: int, order_in: schemas.WorkOrderCreate, db: Session = Depends(get_db), _: models.User = Depends(get_current_user)):
    order = db.get(models.WorkOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found")
    for field, value in order_in.dict(exclude_none=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    return order


@router.post("/work-orders/{order_id}/parts")
def add_work_order_part(
    order_id: int,
    payload: schemas.WorkOrderPartAdd,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    order = db.get(models.WorkOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Work order not found")
    part = db.get(models.Part, payload.part_id)
    if not part:
        raise HTTPException(status_code=404, detail="Part not found")
    usage = models.WorkOrderPart(
        work_order_id=order_id,
        part_id=payload.part_id,
        quantity=payload.quantity,
        cost=payload.cost,
    )
    if payload.warehouse_id:
        stock = (
            db.query(models.PartStock)
            .filter(
                models.PartStock.part_id == payload.part_id,
                models.PartStock.warehouse_id == payload.warehouse_id,
            )
            .first()
        )
        if stock:
            stock.quantity = max(0, stock.quantity - payload.quantity)
    db.add(usage)
    db.commit()
    return {"ok": True}
