from sqlalchemy import Column, Integer, ForeignKey, String, Date, DateTime, Float, func
from sqlalchemy.orm import relationship
from app.database import Base


class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedules"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    due_date = Column(Date, nullable=True)
    due_mileage = Column(Float, nullable=True)
    description = Column(String(255), nullable=False)
    status = Column(String(50), default="pending")
    priority = Column(String(50), default="normal")

    vehicle = relationship("Vehicle")
    work_orders = relationship("WorkOrder", back_populates="schedule")


class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    schedule_id = Column(Integer, ForeignKey("maintenance_schedules.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="planned")
    description = Column(String(255), nullable=False)
    cost = Column(Float, default=0)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    schedule = relationship("MaintenanceSchedule", back_populates="work_orders")
    vehicle = relationship("Vehicle")
    parts = relationship("WorkOrderPart", back_populates="work_order", cascade="all, delete-orphan")


class WorkOrderPart(Base):
    __tablename__ = "work_order_parts"

    id = Column(Integer, primary_key=True, index=True)
    work_order_id = Column(Integer, ForeignKey("work_orders.id", ondelete="CASCADE"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1)
    cost = Column(Float, default=0)

    work_order = relationship("WorkOrder", back_populates="parts")
