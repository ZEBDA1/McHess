import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Package, Zap, Shield, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PackCard from '../components/PackCard';
import CheckoutModal from '../components/CheckoutModal';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function HomePage() {
  const [packs, setPacks] = useState([]);
  const [selectedPack, setSelectedPack] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await axios.get(`${API}/packs`);
      setPacks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des packs:', error);
      toast.error('Erreur lors du chargement des packs');
      setLoading(false);
    }
  };

  const handleBuyNow = (pack) => {
    setSelectedPack(pack);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6 border border-primary/20">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Livraison sous 15 minutes</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Vos <span className="text-gradient-primary">Points de Fidélité</span>
              <br />en un clic
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Achetez vos points de fidélité rapidement et profitez de vos avantages instantanément. Simple, rapide, sécurisé.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#packs"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg hover:bg-[hsl(var(--primary-hover))] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Commander maintenant
              </a>
              <a
                href="#benefits"
                className="inline-flex items-center justify-center px-8 py-4 bg-card border-2 border-primary text-foreground rounded-xl font-semibold text-lg hover:bg-primary/5 transition-all duration-300"
              >
                En savoir plus
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Livraison Rapide</h3>
              <p className="text-muted-foreground leading-relaxed">
                Recevez vos points en moins de 15 minutes après validation du paiement
              </p>
            </div>
            
            <div className="text-center p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Sécurisé</h3>
              <p className="text-muted-foreground leading-relaxed">
                Paiement sécurisé via PayPal. Vos données sont protégées
              </p>
            </div>
            
            <div className="text-center p-8 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">Service Client</h3>
              <p className="text-muted-foreground leading-relaxed">
                Support disponible pour toute question ou problème
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Packs Section */}
      <section id="packs" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Choisissez votre <span className="text-gradient-primary">Pack</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sélectionnez le pack qui correspond à vos besoins et profitez de vos points instantanément
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-muted/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packs.map((pack) => (
                <PackCard
                  key={pack._id}
                  pack={pack}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Comment ça <span className="text-gradient-primary">marche</span> ?
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Choisissez</h3>
                <p className="text-muted-foreground">
                  Sélectionnez le pack de points qui vous convient
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Payez</h3>
                <p className="text-muted-foreground">
                  Effectuez le paiement sécurisé via PayPal
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Recevez</h3>
                <p className="text-muted-foreground">
                  Vos points sont livrés sous 15 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-gradient-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à commander vos points ?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez des centaines de clients satisfaits et profitez de vos avantages dès maintenant
            </p>
            <a
              href="#packs"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Commander maintenant
            </a>
          </div>
        </div>
      </section>

      <Footer />
      
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        pack={selectedPack}
      />
    </div>
  );
}