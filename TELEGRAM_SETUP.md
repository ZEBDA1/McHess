# Configuration Telegram Bot pour McHess

## Token Bot Actuel
TELEGRAM_BOT_TOKEN=8516166880:AAGlpynk5uHEXbCNEukGK8VwG67WCS1J4ao

## Pour obtenir votre CHAT_ID:

1. Envoyez un message à votre bot sur Telegram
2. Visitez : https://api.telegram.org/bot8516166880:AAGlpynk5uHEXbCNEukGK8VwG67WCS1J4ao/getUpdates
3. Cherchez "chat":{"id": dans la réponse JSON
4. Copiez le Chat ID (peut être positif ou négatif)
5. Mettez à jour TELEGRAM_CHAT_ID dans server.py ligne 29
6. Décommentez les lignes 81-89 dans send_telegram_notification()
7. Redémarrez le backend : sudo supervisorctl restart backend

## Notifications disponibles:
- 🚀 Démarrage du système
- 🛒 Nouvelle commande
- ✅ Commande livrée
- ⏳ Changements de statut