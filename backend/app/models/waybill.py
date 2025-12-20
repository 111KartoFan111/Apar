from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, Float, func
from sqlalchemy.orm import relationship
from app.database import Base


class Waybill(Base):
    __tablename__ = "waybills"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    driver = Column(String(100), nullable=False)
    purpose = Column(String(255), nullable=False)
    route_text = Column(String(500), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    start_odometer = Column(Float, nullable=False)
    end_odometer = Column(Float, nullable=True)
    notes = Column(String(500), nullable=True)
    route_summary = Column(String(255), nullable=True)

    vehicle = relationship("Vehicle")
