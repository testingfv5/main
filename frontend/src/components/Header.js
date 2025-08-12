import React, { useState } from "react";
import { Phone, MapPin, Clock, Menu, X } from "lucide-react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
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
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-white">Óptica Villalba</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#promociones" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Promociones
            </a>
            <a href="#marcas" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Marcas
            </a>
            <a href="#contacto" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Contacto
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