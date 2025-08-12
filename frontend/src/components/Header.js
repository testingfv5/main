import React, { useState } from "react";
import { Phone, MapPin, Clock, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const scrollToTop = (e) => {
    e.preventDefault();
    // Intento 1: ancla del hero
    const target = document.getElementById('top');
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Intento 2: usar el elemento de scroll del documento
      const el = document.scrollingElement || document.documentElement || document.body;
      try {
        el.scrollTo({ top: 0, behavior: 'smooth' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (_) {
        window.scrollTo(0, 0);
      }
    }
    // Ajuste final para asegurar top exacto
    setTimeout(() => {
      (document.scrollingElement || document.documentElement || document.body).scrollTo({ top: 0, behavior: 'auto' });
    }, 700);
  };

  const scrollToInfo = (e) => {
    e.preventDefault();
    const footer = document.getElementById('info');
    if (footer && typeof footer.scrollIntoView === 'function') {
      footer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback to hash navigation
      window.location.hash = '#info';
    }
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar with contact info */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm border-b border-slate-700">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Lun-Vie: 10:00-13:30 | 15:30-19:00</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <MapPin className="w-4 h-4 text-red-400" />
              <span>Av. Las Heras 3751, Palermo</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <a href="tel:+541164156306" className="text-slate-300 hover:text-blue-400 transition-colors">
              +54 11 6415-6306
            </a>
          </div>
        </div>

        {/* Main navigation */}
        <div className="relative flex items-center justify-between py-4">
          <div className="flex items-center space-x-2 flex-1">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <img
                src="/assets/images/logo-white.png"
                alt="Óptica Villalba"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-white">Óptica Villalba</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#top" onClick={scrollToTop} className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Promociones
            </a>
            <a href="#info" onClick={scrollToInfo} className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Información
            </a>
          </nav>

          {/* Mobile title centered, no burger */}
          <div className="md:hidden absolute left-0 right-0 pointer-events-none">
            <h1 className="text-center text-lg font-bold text-white">Óptica Villalba</h1>
          </div>
        </div>

        {/* Mobile Navigation removed as burger is disabled */}
      </div>
    </header>
  );
};

export default Header;