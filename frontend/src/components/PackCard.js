import React from 'react';
import { ShoppingCart, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Badge } from './ui/badge';

export const PackCard = ({ pack, onBuyNow }) => {
  const isPopular = pack.points_range === '50-75';
  
  return (
    <Card className="pack-card relative overflow-hidden border-2 hover:border-primary/50 group">
      {isPopular && (
        <div className="absolute top-0 right-0 left-0">
          <div className="bg-gradient-primary text-white px-4 py-2 text-center font-bold text-sm shadow-lg">
            <Zap className="w-4 h-4 inline mr-1" />
            LE PLUS POPULAIRE
          </div>
        </div>
      )}
      
      <CardHeader className="text-center pb-4" style={{ marginTop: isPopular ? '3rem' : '0' }}>
        <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <span className="text-3xl font-bold text-white">{pack.points_range.split('-')[0]}</span>
        </div>
        <h3 className="text-2xl font-bold mb-2">{pack.name}</h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-primary">{pack.price}€</span>
        </div>
      </CardHeader>
      
      <CardContent className="text-center pb-4">
        <p className="text-muted-foreground mb-4 leading-relaxed">
          {pack.description}
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
          <span className="text-sm font-semibold text-foreground">{pack.points_range} points</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 mt-auto">
        <Button
          onClick={() => onBuyNow(pack)}
          className="w-full bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))] shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Commander
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PackCard;