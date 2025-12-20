from pydantic import BaseModel


class InspectionTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    schemas: dict


class InspectionTemplateOut(InspectionTemplateCreate):
    id: int

    class Config:
        orm_mode = True


class InspectionResultCreate(BaseModel):
    vehicle_id: int
    template_id: int
    payload: dict
    attachment: str | None = None
