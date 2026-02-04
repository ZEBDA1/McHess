import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-white">M</span>
              </div>
              <span className="text-xl font-bold">
                Mc<span className="text-primary">Hess</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              La plateforme de confiance pour acheter vos points de fidélité rapidement et en toute sécurité.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Liens Rapides</h3>
            <ul className="space-y-2">
              <li>
                <a href="#packs" className="text-muted-foreground hover:text-primary transition-colors">
                  Nos Packs
                </a>
              </li>
              <li>
                <Link to="/mes-commandes" className="text-muted-foreground hover:text-primary transition-colors">
                  Mes Commandes
                </Link>
              </li>
              <li>
                <a href="#benefits" className="text-muted-foreground hover:text-primary transition-colors">
                  Avantages
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>support@mchess.fr</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>+33 1 23 45 67 89</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} McHess. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;