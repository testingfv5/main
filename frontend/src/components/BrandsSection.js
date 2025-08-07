import React, { useState } from "react";
import { Star, Plus } from "lucide-react";
import { mockBrands } from "../data/mockData";

const BrandsSection = () => {
  const [hoveredBrand, setHoveredBrand] = useState(null);

  return (
    <section id="marcas" className="bg-slate-800 py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-600/10 to-blue-600/10 px-6 py-3 rounded-full border border-red-600/20 mb-8">
            <Star className="w-5 h-5 text-red-400" />
            <span className="text-red-400 font-medium">Marcas Premium</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Trabajamos con las
            <br />
            <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
              Mejores Marcas
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Ofrecemos una amplia selección de marcas reconocidas mundialmente, 
            garantizando calidad, estilo y durabilidad en cada producto.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-12">
          {mockBrands.map((brand) => (
            <div
              key={brand.id}
              className="group relative overflow-hidden"
              onMouseEnter={() => setHoveredBrand(brand.id)}
              onMouseLeave={() => setHoveredBrand(null)}
            >
              {/* Brand Pill */}
              <div
                className={`
                  relative bg-slate-700 border-2 border-slate-600 rounded-full p-6 md:p-8 
                  transition-all duration-500 ease-out cursor-pointer
                  hover:scale-105 hover:shadow-2xl
                  ${hoveredBrand === brand.id ? 'blur-sm' : ''}
                `}
                style={{
                  backgroundColor: hoveredBrand === brand.id ? brand.color : '',
                  borderColor: hoveredBrand === brand.id ? brand.color : ''
                }}
              >
                <div className="text-center">
                  <h3 
                    className={`
                      font-bold text-lg md:text-xl transition-all duration-300
                      ${hoveredBrand === brand.id ? 'text-white scale-110' : 'text-slate-200 group-hover:text-white'}
                    `}
                    style={{
                      color: hoveredBrand === brand.id ? brand.textColor : ''
                    }}
                  >
                    {brand.name}
                  </h3>
                </div>
                
                {/* Hover overlay with blur effect */}
                <div
                  className={`
                    absolute inset-0 rounded-full backdrop-blur-md transition-all duration-500
                    flex items-center justify-center
                    ${hoveredBrand === brand.id ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                  `}
                  style={{
                    backgroundColor: `${brand.color}E6` // Adding E6 for 90% opacity
                  }}
                >
                  <div className="text-center">
                    <h3 
                      className="font-bold text-lg md:text-xl mb-2 transform scale-110"
                      style={{ color: brand.textColor }}
                    >
                      {brand.name}
                    </h3>
                    <p 
                      className="text-sm opacity-90"
                      style={{ color: brand.textColor }}
                    >
                      {brand.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add More Brands Placeholder */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 bg-slate-700/50 backdrop-blur-sm border-2 border-dashed border-slate-600 rounded-full px-8 py-6 hover:border-blue-500 hover:bg-slate-700/70 transition-all duration-300 cursor-pointer group">
            <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-slate-400 group-hover:text-blue-400 font-medium transition-colors">
              Y muchas marcas más...
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Consultá por disponibilidad de otras marcas en nuestro local
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600 p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿No encontrás la marca que buscás?
            </h3>
            <p className="text-slate-300 mb-8 text-lg leading-relaxed">
              Consultanos por WhatsApp. Trabajamos con más de 50 marcas nacionales e internacionales 
              y podemos conseguir el producto que necesités.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/541164156306"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 font-medium shadow-lg hover:shadow-red-600/25 transform hover:scale-105"
              >
                Consultar por WhatsApp
              </a>
              <button className="border-2 border-blue-600 text-blue-400 px-8 py-4 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 font-medium">
                Ver Catálogo Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;