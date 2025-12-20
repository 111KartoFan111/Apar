from pathlib import Path
from sqlalchemy import text

from app.database import engine, Base


MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "db" / "migrations"


def _ensure_table():
    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) UNIQUE NOT NULL,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                """
            )
        )


def apply_migrations():
    if engine.url.get_backend_name() == "sqlite":
        Base.metadata.create_all(bind=engine)
        return
    _ensure_table()
    with engine.begin() as conn:
        applied = {row[0] for row in conn.execute(text("SELECT name FROM schema_migrations"))}

    migration_files = sorted(Path(MIGRATIONS_DIR).glob("*.sql"))
    for file_path in migration_files:
        name = file_path.name
        if name in applied:
            continue
        sql = file_path.read_text()
        # Execute using raw connection to allow multiple statements
        raw = engine.raw_connection()
        try:
            cursor = raw.cursor()
            cursor.execute(sql)
            raw.commit()
        finally:
            raw.close()
        with engine.begin() as conn:
            conn.execute(
                text("INSERT INTO schema_migrations (name) VALUES (:name)"),
                {"name": name},
            )
