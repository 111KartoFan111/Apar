from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.migrations import apply_migrations
from app import routers
from app.seeds import seed_demo_data

# Ensure models are imported for metadata
from app import models  # noqa: F401


def create_application() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.cors_origins] or ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(routers.auth.router)
    app.include_router(routers.vehicles.router)
    app.include_router(routers.maintenance.router)
    app.include_router(routers.waybills.router)
    app.include_router(routers.inspections.router)
    app.include_router(routers.warehouses.router)
    app.include_router(routers.orders.router)
    app.include_router(routers.fines.router)
    app.include_router(routers.tires.router)
    app.include_router(routers.reports.router)
    app.include_router(routers.ai.router)

    @app.on_event("startup")
    def startup_event():
        apply_migrations()
        if settings.seed_demo:
            db = SessionLocal()
            try:
                seed_demo_data(db)
            finally:
                db.close()

    @app.get("/health")
    def health():
        return {"status": "ok"}

    return app


app = create_application()
