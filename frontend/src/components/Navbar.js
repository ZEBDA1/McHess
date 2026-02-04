import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingBag, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/ThemeContext';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <span className="text-xl font-bold text-white">M</span>
            </div>
            <span className="text-xl md:text-2xl font-bold">
              Mc<span className="text-primary">Hess</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#packs" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Nos Packs
            </a>
            <a href="#benefits" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Avantages
            </a>
            <Link to="/mes-commandes" className="text-foreground hover:text-primary transition-colors duration-200 font-medium">
              Mes Commandes
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <a
                href="#packs"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Nos Packs
              </a>
              <a
                href="#benefits"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Avantages
              </a>
              <Link
                to="/mes-commandes"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Mes Commandes
              </Link>
              <Link
                to="/admin"
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;