from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from app.routes import claims, dss

# Load environment variables
load_dotenv()

app = FastAPI(title="FRA DSS Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FRA DSS backend is live!"}

app.include_router(claims.router)
app.include_router(dss.router, prefix="/dss", tags=["Decision Support System"])