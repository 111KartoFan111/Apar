CREATE TABLE IF NOT EXISTS tire_services (
    id SERIAL PRIMARY KEY,
    tire_id INTEGER NOT NULL REFERENCES tires(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL,
    service_date DATE,
    mileage DOUBLE PRECISION,
    tread_depth DOUBLE PRECISION,
    notes VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_tire_services_tire_id ON tire_services (tire_id);
CREATE INDEX IF NOT EXISTS ix_tire_services_created_at ON tire_services (created_at);
