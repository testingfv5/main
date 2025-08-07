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
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Óptica Villalba</h1>
              <p className="text-sm text-slate-400">Calidad Visual Premium</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#inicio" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Inicio
            </a>
            <a href="#promociones" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Promociones
            </a>
            <a href="#marcas" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Marcas
            </a>
            <a href="#contacto" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
              Contacto
            </a>
            <a 
              href="https://wa.me/541164156306" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-lg hover:shadow-red-600/25"
            >
              WhatsApp
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-slate-700 pt-4 mt-4">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col space-y-2 text-sm text-slate-300 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Lun-Vie: 10:00-13:30 | 15:30-19:00</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-red-400" />
                  <span>Av. Las Heras 3751, Palermo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-blue-400" />
                  <a href="tel:+541164156306" className="hover:text-blue-400 transition-colors">
                    +54 11 6415-6306
                  </a>
                </div>
              </div>
              <a href="#inicio" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
                Inicio
              </a>
              <a href="#promociones" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
                Promociones
              </a>
              <a href="#marcas" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
                Marcas
              </a>
              <a href="#contacto" className="text-slate-300 hover:text-blue-400 transition-colors font-medium">
                Contacto
              </a>
              <a 
                href="https://wa.me/541164156306" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-lg hover:shadow-red-600/25 text-center"
              >
                WhatsApp
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;