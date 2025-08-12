import React from "react";
import { MapPin, Phone, Clock, Mail, Instagram, Facebook, Star } from "lucide-react";
import { mockCompanyInfo } from "../data/mockData";

const Footer = () => {
  return (
    <footer id="contacto" className="bg-slate-950 border-t border-slate-800">
      {/* Attribution for third-party brands */}
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-slate-400 text-xs md:text-sm">
            Las marcas y logotipos mostrados son propiedad de sus respectivos titulares. Se utilizan únicamente para identificar productos disponibles.
          </p>
        </div>
      </div>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">V</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{mockCompanyInfo.name}</h3>
                <p className="text-slate-400">{mockCompanyInfo.tagline}</p>
              </div>
            </div>
            
            <p className="text-slate-300 leading-relaxed mb-6 max-w-md">
              {mockCompanyInfo.description}
            </p>
            
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/optica_villalba" target="_blank"
                className="bg-slate-800 p-3 rounded-full hover:bg-blue-600 transition-colors duration-300 border border-slate-700 hover:border-blue-600"
              >
                <Instagram className="w-5 h-5 text-slate-300 hover:text-white" />
              </a>
              <a
                href="https://www.facebook.com/opticavillalba/?_rdc=1&_rdr" target="_blank"
                className="bg-slate-800 p-3 rounded-full hover:bg-blue-600 transition-colors duration-300 border border-slate-700 hover:border-blue-600"
              >
                <Facebook className="w-5 h-5 text-slate-300 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-blue-400" />
              <span>Contacto</span>
            </h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <a href="https://maps.app.goo.gl/3rtohkU4B3ZmDEvH6" target="_blank" className="text-slate-300 text-sm leading-relaxed">
                    {mockCompanyInfo.address}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <a 
                    href={`tel:${mockCompanyInfo.phone}`}
                    className="text-slate-300 hover:text-blue-400 transition-colors text-sm"
                  >
                    {mockCompanyInfo.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {mockCompanyInfo.hours.weekdays}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6 flex items-center space-x-2">
              <Star className="w-5 h-5 text-red-400" />
              <span>Servicios</span>
            </h4>
            
            <ul className="space-y-3">
              {mockCompanyInfo.services.map((service, index) => (
                <li key={index}>
                  <a
                    className="text-slate-300 hover:text-blue-400 transition-colors text-sm flex items-center space-x-2 group"
                  >
                    <div className="w-1.5 h-1.5 bg-slate-600 rounded-full group-hover:bg-blue-400 transition-colors"></div>
                    <span>{service}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* WhatsApp CTA Section */}
      <div className="border-t border-slate-800 bg-slate-900/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-semibold text-white mb-2">
                ¿Necesitás asesoramiento?
              </h4>
              <p className="text-slate-300">
                Nuestros especialistas te ayudan a elegir el producto perfecto para vos.
              </p>
            </div>
            <a
              href={mockCompanyInfo.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-lg hover:shadow-red-600/25 transform hover:scale-105 flex items-center space-x-3"
            >
              <Phone className="w-5 h-5" />
              <span>Consultá por WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800 bg-slate-950">
        <div className="container mx-auto px-4 py-6">
          <div className="relative flex flex-col items-center justify-center gap-4 text-sm text-slate-400 group">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full -mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-700 text-white text-sm font-bold px-4 py-2 rounded-md shadow-md">
              <a href="https://www.linkedin.com/in/fausto-villalba/" target="_blank" rel="noopener noreferrer">Desarrollado por Fausto Villalba</a>
            </div>
            <p className="text-center">
              © 2025 {mockCompanyInfo.name}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;