import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Zap } from "lucide-react";
import { mockPromotions } from "../data/mockData";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mockPromotions.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockPromotions.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockPromotions.length) % mockPromotions.length);
  };

  return (
    <section id="promociones" className="relative overflow-hidden bg-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-red-950/20" />
      
      <div className="relative h-[70vh] md:h-[80vh]">
        {mockPromotions.map((promo, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="grid md:grid-cols-2 gap-8 items-center w-full">
                {/* Content */}
                <div className="text-white space-y-6 z-10">
                  <div className="flex items-center space-x-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-medium uppercase tracking-wide">
                      {promo.type}
                    </span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
                      {promo.discount}
                    </span>
                    <br />
                    <span className="text-white">{promo.title}</span>
                  </h2>
                  
                  <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                    {promo.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg hover:shadow-blue-600/25 transform hover:scale-105">
                      Ver Promoción
                    </button>
                    <button className="border-2 border-red-600 text-red-400 px-8 py-4 rounded-full hover:bg-red-600 hover:text-white transition-all duration-300 font-medium">
                      Más Ofertas
                    </button>
                  </div>
                  
                  {promo.features && (
                    <div className="flex flex-wrap gap-4 pt-6">
                      {promo.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-slate-200">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Placeholder for promotion image */}
                <div className="relative hidden md:block">
                  <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <div className="text-center text-slate-400">
                      <div className="w-24 h-24 mx-auto mb-4 bg-slate-600 rounded-full flex items-center justify-center">
                        <span className="text-3xl">📸</span>
                      </div>
                      <p className="text-sm">Imagen de Promoción</p>
                      <p className="text-xs text-slate-500">Placeholder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-slate-700/70 transition-all duration-300 border border-slate-600 group"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-slate-700/70 transition-all duration-300 border border-slate-600 group"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {mockPromotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-gradient-to-r from-blue-500 to-red-500 w-8"
                  : "bg-slate-600 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;