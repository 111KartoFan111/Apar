from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(50), unique=True, index=True, nullable=False)
    model = Column(String(100), nullable=False)
    manufacturer = Column(String(100), nullable=True)
    year = Column(Integer, nullable=True)
    status = Column(String(50), default="active", nullable=False)
    mileage = Column(Float, default=0)
    fuel_type = Column(String(50), default="petrol")
    avg_consumption = Column(Float, default=0)
    notes = Column(String(255), nullable=True)

    statuses = relationship("VehicleStatus", back_populates="vehicle", cascade="all, delete-orphan")
    costs = relationship("VehicleCost", back_populates="vehicle", cascade="all, delete-orphan")


class VehicleStatus(Base):
    __tablename__ = "vehicle_statuses"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"))
    status = Column(String(50), nullable=False)
    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle", back_populates="statuses")


class VehicleCost(Base):
    __tablename__ = "vehicle_costs"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"))
    category = Column(String(50), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(Date, nullable=False, server_default=func.current_date())

    vehicle = relationship("Vehicle", back_populates="costs")
