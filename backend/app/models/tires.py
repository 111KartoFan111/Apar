from sqlalchemy import Column, Integer, Float, String, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Tire(Base):
    __tablename__ = "tires"

    id = Column(Integer, primary_key=True, index=True)
    serial = Column(String(100), unique=True, nullable=False)
    brand = Column(String(100), nullable=False)
    tread_depth = Column(Float, default=8.0)
    mileage = Column(Float, default=0)
    status = Column(String(50), default="in_stock")

    assignments = relationship("TireAssignment", back_populates="tire", cascade="all, delete-orphan")


class TireAssignment(Base):
    __tablename__ = "tire_assignments"

    id = Column(Integer, primary_key=True, index=True)
    tire_id = Column(Integer, ForeignKey("tires.id", ondelete="CASCADE"))
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"))
    position = Column(String(50), nullable=True)
    assigned_date = Column(Date, nullable=True)
    removed_date = Column(Date, nullable=True)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    tire = relationship("Tire", back_populates="assignments")
