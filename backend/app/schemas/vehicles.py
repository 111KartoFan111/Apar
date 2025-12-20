from datetime import date
from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    plate_number: str
    model: str
    manufacturer: str | None = None
    year: int | None = None
    status: str = "active"
    mileage: float = 0
    fuel_type: str = "petrol"
    avg_consumption: float = 0
    notes: str | None = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    model: str | None = None
    manufacturer: str | None = None
    year: int | None = None
    status: str | None = None
    mileage: float | None = None
    fuel_type: str | None = None
    avg_consumption: float | None = None
    notes: str | None = None


class VehicleOut(VehicleBase):
    id: int

    class Config:
        orm_mode = True


class FuelEntryCreate(BaseModel):
    vehicle_id: int
    date: date
    liters: float
    price: float
    odometer: float
    station: str | None = None
    notes: str | None = None


class FuelEntryOut(FuelEntryCreate):
    id: int
    anomaly_flag: bool

    class Config:
        orm_mode = True
