import React from "react";
import { Clock, MapPin, Phone, Shield, Eye, Award, Zap, HammerIcon } from "lucide-react";
import { mockCompanyInfo } from "../data/mockData";

const InfoSection = () => {
  const features = [
    {
      icon: <Eye className="w-8 h-8" />,
      title: "Lentes Premium",
      description: "Ofrecemos lentes de máxima calidad, con tecnología avanzada y materiales resistentes para tu mejor visión."
    },
    {
      icon: <HammerIcon className="w-8 h-8" />,
      title: "Reparaciones",
      description: "Realizamos reparaciones de armazones para que tus anteojos estén siempre en óptimas condiciones."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Marcas Premium",
      description: "Las mejores marcas internacionales."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Servicio Express",
      description: "Entrega rápida y servicio técnico especializado"
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
            </div>

            {/* Map Placeholder */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl border border-slate-500 flex items-center justify-center shadow-2xl overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.8853951358897!2d-58.411799800000004!3d-34.5817663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb57eae295b49%3A0xbf48b6333dbf13da!2sVillalba%20%C3%93ptica!5e0!3m2!1ses-419!2sar!4v1754621232807!5m2!1ses-419!2sar"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '450px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full rounded-2xl transition-all duration-500"
                  title="Ubicación Óptica Villalba"
                ></iframe>
              </div>
              
              {/* Floating location card */}
              <div className="absolute top-4 right-4 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600">
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
}

// WhatsApp Floating Bubble (outside the component)
export const WhatsAppBubble = () => (
  <a
    id="whatsapp-bubble"
    href="https://wa.me/541164156306"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed z-50 bottom-4 right-4 group"
    aria-label="Chatear por WhatsApp"
  >
    <img
      src="/assets/images/whatsapp-logo.png"
      alt="WhatsApp"
      className="w-14 h-14 object-contain drop-shadow-lg"
    />
    <span
      className="hidden md:flex absolute right-0 bottom-16 z-50 bg-white dark:bg-gray-800 text-green-600 font-semibold px-4 py-2 rounded-xl shadow-lg border border-green-500 after:content-[''] after:absolute after:bottom-[-10px] after:right-6 after:border-x-8 after:border-x-transparent after:border-t-[10px] after:border-t-white dark:after:border-t-gray-800 after:border-b-0 after:w-0 after:h-0 group-hover:opacity-100 opacity-0 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto select-none text-base whitespace-nowrap"
      style={{ minWidth: '180px' }}
    >
      Chateá con nosotros
    </span>
  </a>
);

export default InfoSection;