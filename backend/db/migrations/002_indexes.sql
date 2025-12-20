CREATE INDEX IF NOT EXISTS idx_fuel_vehicle_date ON fuel_entries (vehicle_id, date);
CREATE INDEX IF NOT EXISTS idx_waybills_vehicle ON waybills (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle ON work_orders (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_part_stocks_part_wh ON part_stocks (part_id, warehouse_id);
