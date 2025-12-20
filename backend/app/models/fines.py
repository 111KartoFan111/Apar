from sqlalchemy import Column, Integer, ForeignKey, String, Float, Date, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Fine(Base):
    __tablename__ = "fines"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), default="traffic")
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="unpaid")
    payment_details = Column(String(255), nullable=True)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicle = relationship("Vehicle")
