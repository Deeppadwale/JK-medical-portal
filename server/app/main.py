from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .Models.database import engine, Base
from .Controller import user_controller,memberMaster_controller,reportMaster_Controller,memberReport_controller
import asyncio
import os

app = FastAPI()

# Create upload directory
 
app.include_router(user_controller.router)
app.include_router(memberMaster_controller.router)
app.include_router(reportMaster_Controller.router)
app.include_router(memberReport_controller.router)



# CORS settings

app.add_middleware(    
    CORSMiddleware,  
    allow_origins=["http://localhost:5173"],
    # allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
# app.include_router(auth_controller.router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def read_root():
    return {"message": "Welcome to FastAPI with Async MSSQL"}

@app.get("/ping")
async def ping():
    print("PING RECEIVED")
    return {"status": "alive"}


