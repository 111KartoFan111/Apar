from pydantic import BaseModel


class WarehouseCreate(BaseModel):
    name: str
    type: str = "stationary"
    location: str | None = None


class WarehouseOut(WarehouseCreate):
    id: int

    class Config:
        orm_mode = True


class PartCreate(BaseModel):
    sku: str
    name: str
    unit: str = "pcs"
    cost: float = 0


class PartOut(PartCreate):
    id: int

    class Config:
        orm_mode = True


class PartStockOut(BaseModel):
    id: int
    warehouse_id: int
    part_id: int
    quantity: float

    class Config:
        orm_mode = True


class StockMovementOut(BaseModel):
    id: int
    warehouse_id: int
    part_id: int
    quantity: float
    movement_type: str
    reference: str | None = None

    class Config:
        orm_mode = True


class PartImportResult(BaseModel):
    imported: int
    errors: list[str] = []
