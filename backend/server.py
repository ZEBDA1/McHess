from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import os
import httpx
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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
DB_NAME = os.environ.get('DB_NAME', 'mchess_db')
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID = None  # Will be obtained from first message - check logs

# PayPal Configuration
PAYPAL_EMAIL = os.environ.get('PAYPAL_EMAIL', '')

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
        "amount": order["amount"],
        "status": order["status"],
        "delivery_info": order.get("delivery_info", ""),
        "delivered_at": order.get("delivered_at", ""),
        "created_at": order["created_at"].isoformat() if isinstance(order["created_at"], datetime) else order["created_at"]
    }

# Telegram notification function
async def send_telegram_notification(message: str):
    """Send notification to Telegram"""
    global TELEGRAM_CHAT_ID
    
    if not TELEGRAM_BOT_TOKEN:
        print("Telegram bot token not configured")
        return
    
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    
    # Log the message
    print(f"📱 Telegram Notification: {message}")
    
    # Try to send to Telegram
    try:
        async with httpx.AsyncClient() as client:
            # If no chat_id, try to get it from getUpdates
            if not TELEGRAM_CHAT_ID:
                updates_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
                updates_response = await client.get(updates_url)
                if updates_response.status_code == 200:
                    updates_data = updates_response.json()
                    if updates_data.get('result') and len(updates_data['result']) > 0:
                        # Get the most recent chat_id
                        TELEGRAM_CHAT_ID = updates_data['result'][-1]['message']['chat']['id']
                        print(f"✅ TELEGRAM_CHAT_ID obtained: {TELEGRAM_CHAT_ID}")
            
            # Send message if we have a chat_id
            if TELEGRAM_CHAT_ID:
                response = await client.post(url, json={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "HTML"
                })
                if response.status_code == 200:
                    print(f"✅ Telegram notification sent successfully")
                else:
                    print(f"⚠️ Telegram response: {response.status_code}")
            else:
                print("⚠️ No TELEGRAM_CHAT_ID available. Send a message to your bot first.")
                
    except Exception as e:
        print(f"❌ Error sending Telegram notification: {e}")

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

# Get configuration (public info only)
@app.get("/api/config")
async def get_config():
    return {
        "paypal_email": PAYPAL_EMAIL
    }

# Get all packs
@app.get("/api/packs", response_model=List[dict])
async def get_packs():
    packs = []
    projection = {'_id': 1, 'name': 1, 'description': 1, 'points_range': 1, 'price': 1}
    async for pack in db.packs.find({}, projection):
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
    
    # Check for duplicate order (same email + pack + pending status in last 30 minutes)
    thirty_minutes_ago = datetime.utcnow() - timedelta(minutes=30)
    existing_order = await db.orders.find_one({
        "customer_email": order.customer_email,
        "pack_id": ObjectId(order.pack_id),
        "status": "pending",
        "created_at": {"$gte": thirty_minutes_ago}
    })
    
    if existing_order:
        order_number = str(existing_order["_id"])[-8:].upper()
        raise HTTPException(
            status_code=400, 
            detail=f"Vous avez déjà une commande en attente pour ce pack (N° {order_number}). Veuillez attendre 30 minutes ou annuler l'ancienne commande."
        )
    
    # Create order
    order_data = {
        "pack_id": ObjectId(order.pack_id),
        "pack_name": pack["name"],
        "customer_email": order.customer_email,
        "amount": pack["price"],
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    
    result = await db.orders.insert_one(order_data)
    order_id = str(result.inserted_id)
    order_number = order_id[-8:].upper()
    
    # Send Telegram notification
    await send_telegram_notification(
        f"🛒 <b>Nouvelle Commande</b>\n"
        f"📦 Pack: {pack['name']}\n"
        f"💰 Montant: {pack['price']}€\n"
        f"📧 Client: {order.customer_email}\n"
        f"🆔 N° Commande: {order_number}\n"
        f"💳 À payer sur: {PAYPAL_EMAIL}\n"
        f"⏳ Statut: En attente"
    )
    
    return {
        "order_id": order_id,
        "message": "Commande créée avec succès",
        "amount": pack["price"]
    }

# Get all orders (admin)
@app.get("/api/admin/orders")
async def get_all_orders(skip: int = 0, limit: int = 100):
    orders = []
    projection = {
        '_id': 1, 'pack_id': 1, 'pack_name': 1, 
        'customer_email': 1, 'amount': 1, 'status': 1, 'created_at': 1
    }
    async for order in db.orders.find({}, projection).sort("created_at", -1).skip(skip).limit(limit):
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
    status_emoji = "✅" if order_update.status == "delivered" else "⏳" if order_update.status == "pending" else "❌"
    status_text = "Livrée" if order_update.status == "delivered" else "En attente" if order_update.status == "pending" else "Annulée"
    
    await send_telegram_notification(
        f"{status_emoji} <b>Mise à jour Commande</b>\n"
        f"🆔 N° Commande: {order_id[-8:].upper()}\n"
        f"📧 Client: {order['customer_email']}\n"
        f"📦 Pack: {order['pack_name']}\n"
        f"💰 Montant: {order['amount']}€\n"
        f"📊 Nouveau statut: {status_text}"
    )
    
    return {"message": "Order status updated successfully"}

# Get orders by email
@app.get("/api/orders/{email}")
async def get_orders_by_email(email: str, limit: int = 50):
    orders = []
    projection = {
        '_id': 1, 'pack_id': 1, 'pack_name': 1,
        'customer_email': 1, 'amount': 1, 'status': 1, 'created_at': 1
    }
    async for order in db.orders.find({"customer_email": email}, projection).sort("created_at", -1).limit(limit):
        orders.append(order_helper(order))
    return orders

# Update pack (admin)
@app.put("/api/admin/packs/{pack_id}")
async def update_pack(pack_id: str, pack_update: PackUpdate):
    pack = await db.packs.find_one({"_id": ObjectId(pack_id)})
    if not pack:
        raise HTTPException(status_code=404, detail="Pack not found")
    
    # Update pack
    await db.packs.update_one(
        {"_id": ObjectId(pack_id)},
        {"$set": {
            "name": pack_update.name,
            "description": pack_update.description,
            "points_range": pack_update.points_range,
            "price": pack_update.price
        }}
    )
    
    # Send Telegram notification
    await send_telegram_notification(
        f"✏️ <b>Pack Modifié</b>\n"
        f"📦 Nom: {pack_update.name}\n"
        f"💰 Nouveau prix: {pack_update.price}€\n"
        f"📊 Points: {pack_update.points_range}\n"
        f"📝 Description: {pack_update.description}"
    )
    
    return {"message": "Pack updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)