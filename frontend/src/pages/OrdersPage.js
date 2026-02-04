import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    // Get orders from localStorage (mock)
    const storedOrders = JSON.parse(localStorage.getItem('myOrders') || '[]');
    const userOrders = storedOrders.filter(order => order.email === email);
    setOrders(userOrders);
    setSearched(true);
  };

  const getStatusBadge = (status) => {
    if (status === 'delivered') {
      return (
        <Badge className="bg-success text-success-foreground">
          <CheckCircle className="w-3 h-3 mr-1" />
          Livrée
        </Badge>
      );
    }
    return (
      <Badge className="bg-warning text-warning-foreground">
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Mes <span className="text-gradient-primary">Commandes</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Suivez l'état de vos commandes en temps réel
              </p>
            </div>

            {/* Search Box */}
            <Card className="mb-8 border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Rechercher mes commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    type="email"
                    placeholder="Entrez votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSearch}
                    className="bg-primary text-primary-foreground hover:bg-[hsl(var(--primary-hover))]"
                  >
                    Rechercher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            {searched && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <Card className="border-2">
                    <CardContent className="py-12 text-center">
                      <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Aucune commande trouvée</h3>
                      <p className="text-muted-foreground">
                        Aucune commande n'a été trouvée pour cet email
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order, index) => (
                    <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">{order.pack}</h3>
                              {getStatusBadge(order.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Commande #{order.orderId}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{order.amount}€</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}