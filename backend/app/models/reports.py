from sqlalchemy import Column, Integer, String, JSON, DateTime, func
from app.database import Base


class ReportTemplate(Base):
    __tablename__ = "report_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    template = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
