from pydantic import BaseModel


class PartOrderCreate(BaseModel):
    warehouse_id: int | None = None
    status: str = "draft"
    supplier: str | None = None
    total_cost: float = 0


class PartOrderOut(PartOrderCreate):
    id: int

    class Config:
        orm_mode = True
