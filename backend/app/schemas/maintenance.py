from datetime import date, datetime
from pydantic import BaseModel


class MaintenanceScheduleCreate(BaseModel):
    vehicle_id: int
    due_date: date | None = None
    due_mileage: float | None = None
    description: str
    status: str = "pending"
    priority: str = "normal"


class MaintenanceScheduleOut(MaintenanceScheduleCreate):
    id: int

    class Config:
        orm_mode = True


class WorkOrderCreate(BaseModel):
    vehicle_id: int
    schedule_id: int | None = None
    status: str = "planned"
    description: str
    cost: float = 0
    started_at: datetime | None = None
    completed_at: datetime | None = None


class WorkOrderOut(WorkOrderCreate):
    id: int

    class Config:
        orm_mode = True


class WorkOrderPartAdd(BaseModel):
    part_id: int
    quantity: int = 1
    cost: float = 0
    warehouse_id: int | None = None
