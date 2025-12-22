from datetime import date
from pydantic import BaseModel


class TireCreate(BaseModel):
    serial: str
    brand: str
    tread_depth: float = 8.0
    mileage: float = 0
    status: str = "in_stock"


class TireUpdate(BaseModel):
    serial: str | None = None
    brand: str | None = None
    tread_depth: float | None = None
    mileage: float | None = None
    status: str | None = None


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


class TireServiceCreate(BaseModel):
    tire_id: int
    service_type: str
    service_date: date | None = None
    mileage: float | None = None
    tread_depth: float | None = None
    notes: str | None = None


class TireServiceOut(TireServiceCreate):
    id: int

    class Config:
        orm_mode = True
