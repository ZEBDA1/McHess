# McHess - Plateforme de Vente de Points de Fidélité 🍔

Une application web moderne de vente de points de fidélité avec un design inspiré du fast-food.

## 🎯 Fonctionnalités

### Frontend (Client)
- **Page d'accueil** avec hero section attractive
- **4 packs de points** avec différents niveaux (25-50, 50-75, 75-100, 100-150 points)
- **Processus de paiement** simplifié via modal
- **Suivi de commandes** par email
- **Design responsive** mobile-first
- **Thème fast-food** avec palette rouge/orange chaleureuse

### Backend (API)
- **API RESTful FastAPI** avec documentation automatique
- **MongoDB** pour la persistance des données
- **Intégration Telegram Bot** pour notifications en temps réel
- **Gestion des commandes** avec statuts
- **Endpoints admin** sécurisés

### Panel Administrateur
- **Tableau de bord** avec statistiques
- **Gestion des commandes** (voir, mettre à jour le statut)
- **Gestion des packs** (visualisation)
- **Authentification** simple (admin/admin123)

## 📦 Packs Disponibles

1. **Pack Starter** - 4.99€ (25-50 points)
2. **Pack Populaire** - 8.99€ (50-75 points) ⚡ Le plus choisi
3. **Pack Premium** - 12.99€ (75-100 points)
4. **Pack Ultra** - 17.99€ (100-150 points)

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 16+
- Python 3.11+
- MongoDB
- Yarn

### Installation

```bash
# Frontend
cd /app/frontend
yarn install

# Backend
cd /app/backend
pip install -r requirements.txt
```

### Configuration

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
TELEGRAM_BOT_TOKEN=votre_token_ici
TELEGRAM_CHAT_ID=votre_chat_id_ici (optionnel)
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Démarrage avec Supervisor

```bash
# Démarrer tous les services
sudo supervisorctl start all

# Vérifier le statut
sudo supervisorctl status

# Redémarrer un service
sudo supervisorctl restart backend
sudo supervisorctl restart frontend
```

### Démarrage Manuel

```bash
# Backend
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd /app/frontend
yarn start
```

## 🔧 Configuration du Bot Telegram

### Étape 1 : Créer un Bot Telegram
1. Ouvrez Telegram et cherchez **@BotFather**
2. Envoyez `/newbot`
3. Suivez les instructions pour nommer votre bot
4. Copiez le **Bot Token** fourni

### Étape 2 : Obtenir le Chat ID

**Option A - Pour un chat personnel:**
1. Envoyez un message à votre bot
2. Visitez : `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. Cherchez `"chat":{"id":` dans la réponse
4. Copiez le Chat ID

**Option B - Pour un groupe:**
1. Ajoutez votre bot au groupe
2. Envoyez un message dans le groupe
3. Visitez la même URL que ci-dessus
4. Le Chat ID commencera par un `-` (ex: -123456789)

### Étape 3 : Configurer le Backend

Modifiez `/app/backend/server.py` ligne 28-29:

```python
TELEGRAM_BOT_TOKEN = "VOTRE_BOT_TOKEN_ICI"
TELEGRAM_CHAT_ID = "VOTRE_CHAT_ID_ICI"
```

Et décommentez les lignes 81-89 dans la fonction `send_telegram_notification`:

```python
try:
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json={
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML"
        })
        print(f"Telegram response: {response.status_code}")
except Exception as e:
    print(f"Error sending Telegram notification: {e}")
```

Redémarrez le backend :
```bash
sudo supervisorctl restart backend
```

### Notifications Telegram Disponibles

- 🚀 **Démarrage du système**
- 🛒 **Nouvelle commande** (avec détails : pack, montant, client, ID)
- ✅ **Commande livrée** (mise à jour du statut)

## 📚 API Endpoints

### Public
- `GET /api/` - Message de bienvenue
- `GET /api/packs` - Liste tous les packs
- `GET /api/packs/{pack_id}` - Détails d'un pack
- `POST /api/orders` - Créer une commande
- `GET /api/orders/{email}` - Commandes par email

### Admin
- `GET /api/admin/orders` - Toutes les commandes
- `PUT /api/admin/orders/{order_id}` - Mettre à jour une commande

### Documentation Interactive
Accédez à la documentation Swagger : `http://localhost:8001/docs`

## 🎨 Design System

### Palette de Couleurs
- **Primary (Rouge)** : `hsl(0 85% 55%)` - Urgence et appétit
- **Secondary (Jaune)** : `hsl(42 95% 55%)` - Énergie et optimisme
- **Accent (Orange)** : `hsl(25 95% 55%)` - Chaleur

### Typographie
- **Titres** : Space Grotesk (700)
- **Corps** : Inter (400, 500, 600)

### Composants
- Shadcn/ui pour les composants de base
- Design tokens HSL pour cohérence
- Animations smooth sur les interactions

## 🔐 Authentification Admin

**Credentials par défaut:**
- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Changez ces credentials en production!

## 📱 Pages

1. **/** - Page d'accueil avec packs
2. **/mes-commandes** - Suivi des commandes
3. **/admin** - Login administrateur
4. **/admin/dashboard** - Panel admin

## 🛠️ Stack Technique

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Shadcn/ui
- Axios
- Sonner (toasts)
- Lucide React (icons)

### Backend
- FastAPI
- Motor (MongoDB async)
- Pydantic
- HTTPX (Telegram API)

### Base de Données
- MongoDB
- Collections: `packs`, `orders`

## 📊 Structure de la Base de Données

### Collection `packs`
```json
{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "points_range": String,
  "price": Float
}
```

### Collection `orders`
```json
{
  "_id": ObjectId,
  "pack_id": ObjectId,
  "pack_name": String,
  "customer_email": String,
  "paypal_email": String,
  "amount": Float,
  "status": String, // "pending" | "delivered"
  "created_at": DateTime
}
```

## 🧪 Tests

Tous les tests ont été validés :
- ✅ Homepage et navigation
- ✅ Affichage des packs
- ✅ Processus de checkout
- ✅ Suivi des commandes
- ✅ Login admin
- ✅ Dashboard admin
- ✅ Mise à jour des statuts
- ✅ Intégration API

## 🚨 Notes Importantes

### Paiement PayPal
Le paiement est actuellement **MOCKÉ** pour la démo. Pour l'intégration réelle :
1. Créez un compte PayPal Business
2. Intégrez PayPal SDK
3. Configurez les webhooks pour les confirmations

### Livraison des Points
La livraison est actuellement manuelle via le panel admin. Pour automatiser :
1. Ajoutez un champ `delivery_info` dans les commandes
2. Créez un système d'envoi automatique d'emails
3. Intégrez avec votre API de points de fidélité

### Sécurité en Production
- Changez les credentials admin
- Ajoutez JWT pour l'authentification API
- Configurez HTTPS
- Ajoutez rate limiting
- Validez les données côté serveur
- Chiffrez les données sensibles

## 📞 Support

Pour toute question ou problème :
- Email: support@mchess.fr
- Telegram: Vérifiez les notifications de votre bot

## 📄 Licence

Ce projet est un prototype/démo. Adaptez-le selon vos besoins.

---

**Développé avec ❤️ pour McHess**