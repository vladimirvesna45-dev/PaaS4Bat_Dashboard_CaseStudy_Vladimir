import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import predict

app = FastAPI(
    title="PaaS4Bat Mock API",
    description="Mock prediction service for the PaaS4Bat dashboard case study",
    version="1.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:8080").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict.router)
