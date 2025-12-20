from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class FuelEntry(Base):
    __tablename__ = "fuel_entries"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    liters = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    odometer = Column(Float, nullable=False)
    station = Column(String(100), nullable=True)
    anomaly_flag = Column(Boolean, default=False)
    notes = Column(String(255), nullable=True)

    vehicle = relationship("Vehicle")
