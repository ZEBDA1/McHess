import React, { useState } from 'react';
import axios from 'axios';
import { X, CreditCard, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const CheckoutModal = ({ isOpen, onClose, pack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');

  useEffect(() => {
    // Fetch PayPal email from API
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${API}/config`);
        setPaypalEmail(response.data.paypal_email);
      } catch (error) {
        console.error('Error fetching config:', error);
        setPaypalEmail('zebdalerat@protonmail.com'); // Fallback
      }
    };
    fetchConfig();
  }, []);

  if (!pack) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (orderNumber) {
      // Modal already has instructions, just close
      handleClose();
      return;
    }
    
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API}/orders`, {
        pack_id: pack._id,
        customer_email: email
      });

      const orderId = response.data.order_id.slice(-8).toUpperCase();
      setOrderNumber(orderId);

      // Store order ID in localStorage for order tracking
      const orders = JSON.parse(localStorage.getItem('myOrders') || '[]');
      orders.push({
        orderId: response.data.order_id,
        orderNumber: orderId,
        email: email,
        pack: pack.name,
        amount: pack.price,
        status: 'pending',
        date: new Date().toISOString()
      });
      localStorage.setItem('myOrders', JSON.stringify(orders));
      
      toast.success('Commande créée avec succès !', {
        description: `Numéro de commande : ${orderId}`
      });
      
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      const errorMsg = error.response?.data?.detail || 'Erreur lors de la création de la commande';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setOrderNumber('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Finaliser la commande</DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'acheter le pack <strong>{pack.name}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 bg-muted/50 rounded-xl my-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Pack sélectionné</span>
            <span className="font-semibold">{pack.name}</span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground">Points</span>
            <span className="font-semibold">{pack.points_range}</span>
          </div>
          <div className="border-t border-border my-3"></div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-primary">{pack.price}€</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Votre Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          {orderNumber && (
            <div className="p-4 bg-primary/10 border-2 border-primary rounded-xl space-y-3">
              <h3 className="font-bold text-lg">Instructions de Paiement PayPal</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">Montant:</span>
                  <span className="font-bold text-primary text-lg">{pack.price}€</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">Envoyer à:</span>
                  <span className="font-mono bg-background px-2 py-1 rounded">zebdalerat@protonmail.com</span>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="font-semibold min-w-[100px]">N° Commande:</span>
                  <span className="font-mono bg-background px-2 py-1 rounded font-bold text-primary">
                    {orderNumber}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                <p className="text-xs font-semibold text-warning-foreground">
                  ⚠️ IMPORTANT: Ajoutez le numéro de commande dans la note du paiement PayPal
                </p>
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              {orderNumber ? 'Fermer' : 'Annuler'}
            </Button>
            {!orderNumber && (
              <Button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                disabled={loading}
              >
                {loading ? 'Traitement...' : 'Créer la commande'}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;