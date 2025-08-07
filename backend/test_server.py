#!/usr/bin/env python3
"""
Servidor de prueba simple para verificar MongoDB
"""
from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uvicorn

# Cargar variables de entorno
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Test Server")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'optica_villalba')

print(f"Connecting to MongoDB: {mongo_url}")
print(f"Database: {db_name}")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

@app.get("/")
async def root():
    return {"message": "Test server is running!"}

@app.get("/test-mongo")
async def test_mongo():
    try:
        # Test MongoDB connection
        await db.command("ping")
        return {"message": "MongoDB connection successful!", "database": db_name}
    except Exception as e:
        return {"error": f"MongoDB connection failed: {str(e)}"}

@app.get("/test-users")
async def test_users():
    try:
        # Test getting users
        users = await db.admin_users.find().to_list(10)
        return {"users": [{"username": user.get("username"), "email": user.get("email")} for user in users]}
    except Exception as e:
        return {"error": f"Failed to get users: {str(e)}"}

if __name__ == "__main__":
    print("Starting test server...")
    uvicorn.run("test_server:app", host="0.0.0.0", port=8002, reload=False) 