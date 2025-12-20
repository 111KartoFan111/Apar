-- Core tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    year INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    mileage DOUBLE PRECISION DEFAULT 0,
    fuel_type VARCHAR(50) DEFAULT 'petrol',
    avg_consumption DOUBLE PRECISION DEFAULT 0,
    notes VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS vehicle_statuses (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    comment VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_costs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    description VARCHAR(255),
    date DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS fuel_entries (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    liters DOUBLE PRECISION NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    odometer DOUBLE PRECISION NOT NULL,
    station VARCHAR(100),
    anomaly_flag BOOLEAN DEFAULT FALSE,
    notes VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    due_date DATE,
    due_mileage DOUBLE PRECISION,
    description VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(50) DEFAULT 'normal'
);

CREATE TABLE IF NOT EXISTS work_orders (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'planned',
    description VARCHAR(255) NOT NULL,
    cost DOUBLE PRECISION DEFAULT 0,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS waybills (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    driver VARCHAR(100) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    route_text VARCHAR(500) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    start_odometer DOUBLE PRECISION NOT NULL,
    end_odometer DOUBLE PRECISION,
    notes VARCHAR(500),
    route_summary VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS inspection_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    schema JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS inspection_results (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES inspection_templates(id) ON DELETE CASCADE,
    payload JSON NOT NULL,
    attachment VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'stationary',
    location VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS parts (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(50) DEFAULT 'pcs',
    cost DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE IF NOT EXISTS work_order_parts (
    id SERIAL PRIMARY KEY,
    work_order_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    cost DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE IF NOT EXISTS part_stocks (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
    quantity DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
    quantity DOUBLE PRECISION NOT NULL,
    movement_type VARCHAR(50) NOT NULL,
    reference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS part_orders (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'draft',
    supplier VARCHAR(100),
    total_cost DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS part_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES part_orders(id) ON DELETE CASCADE,
    part_id INTEGER REFERENCES parts(id) ON DELETE SET NULL,
    quantity INTEGER DEFAULT 1,
    cost DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    category VARCHAR(50) DEFAULT 'traffic',
    amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid',
    payment_details VARCHAR(255),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tires (
    id SERIAL PRIMARY KEY,
    serial VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    tread_depth DOUBLE PRECISION DEFAULT 8.0,
    mileage DOUBLE PRECISION DEFAULT 0,
    status VARCHAR(50) DEFAULT 'in_stock'
);

CREATE TABLE IF NOT EXISTS tire_assignments (
    id SERIAL PRIMARY KEY,
    tire_id INTEGER REFERENCES tires(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    position VARCHAR(50),
    assigned_date DATE,
    removed_date DATE,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    template JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
