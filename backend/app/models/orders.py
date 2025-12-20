from sqlalchemy import Column, Integer, ForeignKey, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class PartOrder(Base):
    __tablename__ = "part_orders"

    id = Column(Integer, primary_key=True, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="draft")
    supplier = Column(String(100), nullable=True)
    total_cost = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("PartOrderItem", back_populates="order", cascade="all, delete-orphan")


class PartOrderItem(Base):
    __tablename__ = "part_order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("part_orders.id", ondelete="CASCADE"))
    part_id = Column(Integer, ForeignKey("parts.id", ondelete="SET NULL"), nullable=True)
    quantity = Column(Integer, default=1)
    cost = Column(Float, default=0)

    order = relationship("PartOrder", back_populates="items")
