import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

os.environ.setdefault("SEED_DEMO", "false")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

from app.database import Base, get_db  # noqa: E402
import app.main as main  # noqa: E402
from app.auth import get_password_hash  # noqa: E402
from app import models  # noqa: E402

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, future=True
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def client():
    # Disable migrations for tests
    main.apply_migrations = lambda: None  # type: ignore
    Base.metadata.create_all(bind=engine)
    app = main.create_application()
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        # create admin user
        db = TestingSessionLocal()
        if db.query(models.User).count() == 0:
            db.add(
                models.User(
                    username="admin",
                    full_name="Admin",
                    hashed_password=get_password_hash("admin123"),
                )
            )
            db.commit()
        db.close()
        login = c.post(
            "/auth/login",
            data={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        token = login.json()["access_token"]
        c.headers.update({"Authorization": f"Bearer {token}"})
        yield c
