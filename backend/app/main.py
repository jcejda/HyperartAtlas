from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import Base, engine
from app.api import auth, users, thomassons, photos, admin

# Create all tables (for local dev with SQLite; use Alembic migrations in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HyperartAtlas API",
    description="API for cataloging Hyperart Thomassons around the world",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local uploads directory for serving uploaded files
uploads_path = Path(settings.UPLOAD_DIR)
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(thomassons.router)
app.include_router(photos.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "HyperartAtlas API", "docs": "/docs"}


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
