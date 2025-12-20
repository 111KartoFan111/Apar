from datetime import date
from pydantic import BaseModel


class FineCreate(BaseModel):
    vehicle_id: int
    category: str = "traffic"
    amount: float
    status: str = "unpaid"
    payment_details: str | None = None
    date: date


class FineOut(FineCreate):
    id: int

    class Config:
        orm_mode = True
