from motor.motor_asyncio import AsyncIOMotorClient

# MongoDB setup
MONGO_URI = "mongodb://localhost:27017/FRA_DB"
client = AsyncIOMotorClient(MONGO_URI)
db = client["FRA_DB"]