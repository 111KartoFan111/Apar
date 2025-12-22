from datetime import date as dt_date
from pydantic import BaseModel


class FineCreate(BaseModel):
    vehicle_id: int
    category: str = "traffic"
    amount: float
    status: str = "unpaid"
    payment_details: str | None = None
    date: dt_date


class FineUpdate(BaseModel):
    category: str | None = None
    amount: float | None = None
    status: str | None = None
    payment_details: str | None = None
    date: dt_date | None = None


class FineOut(FineCreate):
    id: int

    class Config:
        orm_mode = True
