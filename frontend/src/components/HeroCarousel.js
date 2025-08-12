import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Zap } from "lucide-react";
import { mockPromotions } from "../data/mockData";

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef(null);
  const pausedRef = useRef(false);
  const AUTO_MS = 5000;
  // Swipe state
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchLastXRef = useRef(0);
  const touchLastYRef = useRef(0);
  const touchMovedRef = useRef(false);
  const touchStartTimeRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    if (pausedRef.current) return;
    timerRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % mockPromotions.length);
    }, AUTO_MS);
  };

  useEffect(() => {
    startTimer();
    return () => clearTimer();
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockPromotions.length);
    startTimer();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockPromotions.length) % mockPromotions.length);
    startTimer();
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    startTimer();
  };

  const handleMouseDown = () => {
    pausedRef.current = true;
    clearTimer();
  };

  const handleMouseUp = () => {
    pausedRef.current = false;
    startTimer();
  };

  // Touch handlers for mobile swipe
  const SWIPE_DISTANCE = 50; // px
  const SWIPE_TIME_MS = 600; // max time for a flick

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartXRef.current = t.clientX;
    touchStartYRef.current = t.clientY;
    touchLastXRef.current = t.clientX;
    touchLastYRef.current = t.clientY;
    touchMovedRef.current = false;
    touchStartTimeRef.current = Date.now();
    // Pause while interacting
    pausedRef.current = true;
    clearTimer();
  };

  const handleTouchMove = (e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStartXRef.current;
    const dy = t.clientY - touchStartYRef.current;
    touchLastXRef.current = t.clientX;
    touchLastYRef.current = t.clientY;
    // Consider as swipe gesture once horizontal dominates
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      touchMovedRef.current = true;
    }
  };

  const handleTouchEnd = () => {
    const dx = touchLastXRef.current - touchStartXRef.current;
    const elapsed = Date.now() - touchStartTimeRef.current;
    if (touchMovedRef.current && elapsed <= SWIPE_TIME_MS && Math.abs(dx) > SWIPE_DISTANCE) {
      if (dx < 0) {
        // swipe left -> next
        setCurrentSlide((prev) => (prev + 1) % mockPromotions.length);
      } else {
        // swipe right -> prev
        setCurrentSlide((prev) => (prev - 1 + mockPromotions.length) % mockPromotions.length);
      }
    }
    // Resume auto after interaction
    pausedRef.current = false;
    startTimer();
  };

  return (
    <section
      id="promociones"
      className="relative overflow-hidden bg-slate-900"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
                  <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl border border-slate-600 flex items-center justify-center shadow-2xl">
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
          className="hidden md:flex absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 bg-slate-800/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-slate-700/70 transition-all duration-300 border border-slate-600 group z-20"
        >
          <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
        
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 bg-slate-800/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-slate-700/70 transition-all duration-300 border border-slate-600 group z-20"
        >
          <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
          {mockPromotions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
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