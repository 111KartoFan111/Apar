from datetime import datetime
from pydantic import BaseModel


class WaybillCreate(BaseModel):
    vehicle_id: int
    driver: str
    purpose: str
    route_text: str
    start_time: datetime
    end_time: datetime | None = None
    start_odometer: float
    end_odometer: float | None = None
    notes: str | None = None
    route_summary: str | None = None


class WaybillOut(WaybillCreate):
    id: int

    class Config:
        orm_mode = True
