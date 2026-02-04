from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import os
import httpx
from bson import ObjectId

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client.mchess_db

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = "8516166880:AAGlpynk5uHEXbCNEukGK8VwG67WCS1J4ao"
TELEGRAM_CHAT_ID = None  # Will be obtained from first message - check logs

# PayPal Configuration
PAYPAL_EMAIL = "zebdalerat@protonmail.com"

# Pydantic models
class Pack(BaseModel):
    name: str
    description: str
    points_range: str
    price: float

class OrderCreate(BaseModel):
    pack_id: str
    customer_email: EmailStr

class OrderUpdate(BaseModel):
    status: str

class PackUpdate(BaseModel):
    name: str
    description: str
    points_range: str
    price: float

# Helper function to convert ObjectId to string
def pack_helper(pack) -> dict:
    return {
        "_id": str(pack["_id"]),
        "name": pack["name"],
        "description": pack["description"],
        "points_range": pack["points_range"],
        "price": pack["price"]
    }

def order_helper(order) -> dict:
    return {
        "_id": str(order["_id"]),
        "pack_id": str(order["pack_id"]),
        "pack_name": order.get("pack_name", ""),
        "customer_email": order["customer_email"],
        "paypal_email": order["paypal_email"],
        "amount": order["amount"],
        "status": order["status"],
        "created_at": order["created_at"].isoformat() if isinstance(order["created_at"], datetime) else order["created_at"]
    }

# Telegram notification function
async def send_telegram_notification(message: str):
    """Send notification to Telegram"""
    if not TELEGRAM_BOT_TOKEN:
        print("Telegram bot token not configured")
        return
    
    # For this demo, we'll use a method that sends to the bot's updates
    # In production, you'd set a specific CHAT_ID
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    # Try to get chat_id from environment or use a default approach
    # For demo purposes, we'll log the message
    print(f"📱 Telegram Notification: {message}")
    
    # If you have a specific chat_id, uncomment this:
    # try:
    #     async with httpx.AsyncClient() as client:
    #         response = await client.post(url, json={
    #             "chat_id": TELEGRAM_CHAT_ID,
    #             "text": message,
    #             "parse_mode": "HTML"
    #         })
    #         print(f"Telegram response: {response.status_code}")
    # except Exception as e:
    #     print(f"Error sending Telegram notification: {e}")

# Initialize database with default packs
@app.on_event("startup")
async def startup_db():
    # Check if packs exist, if not, create default ones
    existing_packs = await db.packs.count_documents({})
    if existing_packs == 0:
        default_packs = [
            {
                "name": "Pack Starter",
                "description": "Parfait pour commencer",
                "points_range": "25-50",
                "price": 4.99
            },
            {
                "name": "Pack Populaire",
                "description": "Le plus choisi par nos clients",
                "points_range": "50-75",
                "price": 8.99
            },
            {
                "name": "Pack Premium",
                "description": "Pour les gourmands",
                "points_range": "75-100",
                "price": 12.99
            },
            {
                "name": "Pack Ultra",
                "description": "Le maximum de points",
                "points_range": "100-150",
                "price": 17.99
            }
        ]
        await db.packs.insert_many(default_packs)
        print("✅ Default packs created")
    
    # Send startup notification
    await send_telegram_notification(
        "🚀 <b>McHess Bot Démarré</b>\n"
        "Le système est maintenant opérationnel."
    )

# Root endpoint
@app.get("/api/")
async def root():
    return {"message": "McHess API - Système de vente de points de fidélité"}

# Get all packs
@app.get("/api/packs", response_model=List[dict])
async def get_packs():
    packs = []
    async for pack in db.packs.find():
        packs.append(pack_helper(pack))
    return packs

# Get single pack
@app.get("/api/packs/{pack_id}")
async def get_pack(pack_id: str):
    pack = await db.packs.find_one({"_id": ObjectId(pack_id)})
    if pack:
        return pack_helper(pack)
    raise HTTPException(status_code=404, detail="Pack not found")

# Create order
@app.post("/api/orders")
async def create_order(order: OrderCreate):
    # Get pack details
    pack = await db.packs.find_one({"_id": ObjectId(order.pack_id)})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Create order
    order_data = {
        "pack_id": ObjectId(order.pack_id),
        "pack_name": pack["name"],
        "customer_email": order.customer_email,
        "paypal_email": order.paypal_email,
        "amount": pack["price"],
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_data)
    order_id = str(result.inserted_id)
    
    # Send Telegram notification
    await send_telegram_notification(
        f"🛒 <b>Nouvelle Commande</b>\n"
        f"📦 Pack: {pack['name']}\n"
        f"💰 Montant: {pack['price']}€\n"
        f"📧 Client: {order.customer_email}\n"
        f"🆔 ID: {order_id[-8:]}\n"
        f"⏳ Statut: En attente"
    )
    
    return {
        "order_id": order_id,
        "message": "Commande créée avec succès",
        "amount": pack["price"]
    }

# Get all orders (admin)
@app.get("/api/admin/orders")
async def get_all_orders():
    orders = []
    async for order in db.orders.find().sort("created_at", -1):
        orders.append(order_helper(order))
    return orders

# Update order status (admin)
@app.put("/api/admin/orders/{order_id}")
async def update_order_status(order_id: str, order_update: OrderUpdate):
    order = await db.orders.find_one({"_id": ObjectId(order_id)})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Update status
    await db.orders.update_one(
        {"_id": ObjectId(order_id)},
        {"$set": {"status": order_update.status}}
    )
    
    # Send Telegram notification
    status_emoji = "✅" if order_update.status == "delivered" else "⏳"
    status_text = "Livrée" if order_update.status == "delivered" else "En attente"
    
    await send_telegram_notification(
        f"{status_emoji} <b>Mise à jour Commande</b>\n"
        f"🆔 ID: {order_id[-8:]}\n"
        f"📧 Client: {order['customer_email']}\n"
        f"📦 Pack: {order['pack_name']}\n"
        f"📊 Nouveau statut: {status_text}"
    )
    
    return {"message": "Order status updated successfully"}

# Get orders by email
@app.get("/api/orders/{email}")
async def get_orders_by_email(email: str):
    orders = []
    async for order in db.orders.find({"customer_email": email}).sort("created_at", -1):
        orders.append(order_helper(order))
    return orders

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)