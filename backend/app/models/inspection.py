from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class InspectionTemplate(Base):
    __tablename__ = "inspection_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    schema = Column(JSON, nullable=False)

    results = relationship("InspectionResult", back_populates="template", cascade="all, delete-orphan")


class InspectionResult(Base):
    __tablename__ = "inspection_results"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    template_id = Column(Integer, ForeignKey("inspection_templates.id", ondelete="CASCADE"), nullable=False)
    payload = Column(JSON, nullable=False)
    attachment = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    template = relationship("InspectionTemplate", back_populates="results")
