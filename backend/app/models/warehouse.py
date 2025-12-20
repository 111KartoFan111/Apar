from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), default="stationary")  # stationary | mobile
    location = Column(String(255), nullable=True)

    stocks = relationship("PartStock", back_populates="warehouse", cascade="all, delete-orphan")


class Part(Base):
    __tablename__ = "parts"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    unit = Column(String(50), default="pcs")
    cost = Column(Float, default=0)

    stocks = relationship("PartStock", back_populates="part", cascade="all, delete-orphan")


class PartStock(Base):
    __tablename__ = "part_stocks"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, default=0)

    warehouse = relationship("Warehouse", back_populates="stocks")
    part = relationship("Part", back_populates="stocks")


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="CASCADE"), nullable=False)
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)
    movement_type = Column(String(50), nullable=False)  # in | out | transfer
    reference = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
