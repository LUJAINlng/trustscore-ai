from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.events import router as events_router
from app.database import Base, engine

# إنشاء الجداول
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TrustScore AI",
    version="1.0.0",
)

# السماح للواجهة الأمامية بالاتصال بالـ API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(events_router)


@app.get("/")
def root():
    return {
        "project": "TrustScore AI",
        "version": "1.0.0",
        "status": "Running",
        "author": "Lujain",
    }