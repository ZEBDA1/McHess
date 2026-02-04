import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

export const EditPackModal = ({ isOpen, onClose, pack, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    points_range: '',
    price: ''
  });

  useEffect(() => {
    if (pack) {
      setFormData({
        name: pack.name || '',
        description: pack.description || '',
        points_range: pack.points_range || '',
        price: pack.price || ''
      });
    }
  }, [pack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.points_range || !formData.price) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('Le prix doit être un nombre positif');
      return;
    }

    onSave({
      ...pack,
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  if (!pack) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Modifier le pack</DialogTitle>
          <DialogDescription>
            Modifiez les informations du pack {pack.name}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du pack</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Pack Starter"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Parfait pour commencer"
              required
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="points_range">Points (format: 25-50)</Label>
            <Input
              id="points_range"
              value={formData.points_range}
              onChange={(e) => setFormData({ ...formData, points_range: e.target.value })}
              placeholder="25-50"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Prix (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="4.99"
              required
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
            >
              Enregistrer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPackModal;
