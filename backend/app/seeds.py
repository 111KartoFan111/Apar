from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash


def seed_demo_data(db: Session):
    if db.query(models.User).count() == 0:
        admin = models.User(
            username="Damir",
            full_name="Daukaraev Damir",
            hashed_password=get_password_hash("damird4321"),
            role="admin",
        )
        db.add(admin)
    if db.query(models.Vehicle).count() == 0:
        vehicle = models.Vehicle(
            plate_number="KZ-001",
            model="Sprinter",
            manufacturer="Mercedes",
            year=2019,
            status="active",
            mileage=120000,
            fuel_type="diesel",
            avg_consumption=10.5,
            notes="City delivery van",
        )
        db.add(vehicle)
        db.flush()
        fuel_entry = models.FuelEntry(
            vehicle_id=vehicle.id,
            date=date.today(),
            liters=60,
            price=120,
            odometer=120000,
            station="Central",
        )
        db.add(fuel_entry)
        schedule = models.MaintenanceSchedule(
            vehicle_id=vehicle.id,
            due_date=date.today() + timedelta(days=30),
            due_mileage=125000,
            description="Oil change",
            status="pending",
        )
        db.add(schedule)
        waybill = models.Waybill(
            vehicle_id=vehicle.id,
            driver="Ali Bolat",
            purpose="Deliver parcels to downtown",
            route_text="Warehouse -> Abay Ave -> Dostyk Ave -> Warehouse",
            start_time=datetime.utcnow() - timedelta(hours=2),
            end_time=datetime.utcnow() - timedelta(hours=1),
            start_odometer=119900,
            end_odometer=120050,
        )
        db.add(waybill)
    if db.query(models.Warehouse).count() == 0:
        wh = models.Warehouse(name="Main Depot", type="stationary", location="Almaty")
        db.add(wh)
        db.flush()
        part = models.Part(sku="FILTER-01", name="Oil Filter", unit="pcs", cost=25)
        db.add(part)
        db.flush()
        stock = models.PartStock(warehouse_id=wh.id, part_id=part.id, quantity=10)
        db.add(stock)
    if db.query(models.ReportTemplate).count() == 0:
        tpl = models.ReportTemplate(
            name="Fuel Cost per Vehicle",
            description="Average fuel spend per vehicle",
            template={
                "type": "fuel_cost",
                "groupBy": "vehicle",
                "metric": "sum_price",
            },
        )
        db.add(tpl)
    db.commit()
