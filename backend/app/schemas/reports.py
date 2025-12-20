from pydantic import BaseModel


class ReportTemplateCreate(BaseModel):
    name: str
    description: str | None = None
    template: dict


class ReportTemplateOut(ReportTemplateCreate):
    id: int

    class Config:
        orm_mode = True


class ReportRunRequest(BaseModel):
    template: dict


class ReportRunResult(BaseModel):
    headers: list[str]
    rows: list[list[str | int | float]]
    csv: str
