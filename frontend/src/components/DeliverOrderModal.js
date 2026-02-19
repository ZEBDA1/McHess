import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Package, Send } from 'lucide-react';

export const DeliverOrderModal = ({ isOpen, onClose, order, onDeliver }) => {
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deliveryInfo.trim()) {
      toast.error('Veuillez entrer les informations de livraison');
      return;
    }

    setLoading(true);
    try {
      await onDeliver(order._id, deliveryInfo);
      setDeliveryInfo('');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la livraison');
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            Livrer la commande
          </DialogTitle>
          <DialogDescription>
            Commande #{order._id.slice(-8).toUpperCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-muted/50 rounded-xl space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Client</span>
            <span className="font-medium">{order.customer_email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Pack</span>
            <span className="font-medium">{order.pack_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Montant</span>
            <span className="font-bold text-primary">{order.amount}€</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryInfo">
              Informations de livraison *
            </Label>
            <Textarea
              id="deliveryInfo"
              placeholder="Entrez les identifiants, codes ou informations à envoyer au client...&#10;&#10;Exemple:&#10;Identifiant: user123&#10;Mot de passe: pass456&#10;Points: 50"
              value={deliveryInfo}
              onChange={(e) => setDeliveryInfo(e.target.value)}
              rows={6}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Ces informations seront sauvegardées et le client recevra une notification
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-success text-success-foreground hover:bg-success/90"
              disabled={loading}
            >
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Livraison...' : 'Livrer la commande'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeliverOrderModal;
