# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import chat

app = FastAPI()

# ✅ Add this middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 👈 your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 👇 Include your router AFTER the middleware
app.include_router(chat.router, prefix="/api/v1")
