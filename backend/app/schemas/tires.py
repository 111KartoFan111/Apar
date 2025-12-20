from datetime import date
from pydantic import BaseModel


class TireCreate(BaseModel):
    serial: str
    brand: str
    tread_depth: float = 8.0
    mileage: float = 0
    status: str = "in_stock"


class TireOut(TireCreate):
    id: int

    class Config:
        orm_mode = True


class TireAssignmentCreate(BaseModel):
    tire_id: int
    vehicle_id: int
    position: str | None = None
    assigned_date: date | None = None
    removed_date: date | None = None
    notes: str | None = None


class TireAssignmentOut(TireAssignmentCreate):
    id: int

    class Config:
        orm_mode = True
