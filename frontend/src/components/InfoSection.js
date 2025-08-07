import React from "react";
import { Clock, MapPin, Phone, Shield, Eye, Award, Zap } from "lucide-react";
import { mockCompanyInfo } from "../data/mockData";

const InfoSection = () => {
  const features = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Examen Visual Gratuito",
      description: "Evaluación completa de tu salud visual con tecnología de última generación"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Garantía Extendida",
      description: "Protección completa en todos nuestros productos con garantía de 2 años"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Marcas Premium",
      description: "Las mejores marcas internacionales con certificación de calidad"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Servicio Express",
      description: "Entrega rápida y servicio técnico especializado en 24-48 horas"
    }
  ];

  return (
    <section className="bg-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Company Mission */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-red-600/10 px-6 py-3 rounded-full border border-blue-600/20 mb-8">
            <Eye className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Nuestra Misión</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              Calidad Visual
            </span>
            <br />
            <span className="text-white">Premium</span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            {mockCompanyInfo.commitment}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:bg-slate-800/80 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/10 hover:scale-105"
            >
              <div className="text-blue-400 mb-6 group-hover:text-red-400 transition-colors duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-3xl border border-slate-600 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contact Details */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-8">
                Visitá Nuestro Local
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600/20 p-3 rounded-full border border-blue-600/30">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Ubicación</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {mockCompanyInfo.address}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-red-600/20 p-3 rounded-full border border-red-600/30">
                    <Clock className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Horarios</h4>
                    <p className="text-slate-300 leading-relaxed">
                      {mockCompanyInfo.hours.weekdays}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-600/20 p-3 rounded-full border border-blue-600/30">
                    <Phone className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Contacto</h4>
                    <a 
                      href={`tel:${mockCompanyInfo.phone}`}
                      className="text-slate-300 hover:text-blue-400 transition-colors leading-relaxed"
                    >
                      {mockCompanyInfo.phone}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <a
                  href={mockCompanyInfo.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-lg hover:shadow-red-600/25 transform hover:scale-105"
                >
                  <Phone className="w-5 h-5" />
                  <span>Chateá con Nosotros</span>
                </a>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl border border-slate-500 flex items-center justify-center shadow-2xl">
                <div className="text-center text-slate-400">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                  <p className="text-lg font-medium">Mapa Interactivo</p>
                  <p className="text-sm text-slate-500">Google Maps Integration</p>
                </div>
              </div>
              
              {/* Floating location card */}
              <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium text-sm">Palermo, CABA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;