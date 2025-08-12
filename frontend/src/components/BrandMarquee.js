import React, { useEffect, useRef } from "react";
import { mockBrands } from "../data/mockData";

function resolveLogoSrc(basePath) {
  if (!basePath) return "";
  if (/\.(jpg|jpeg|png|svg)$/i.test(basePath)) return basePath;
  return `${basePath}.jpg`;
}

function handleImgError(img) {
  const src = img.getAttribute("data-srcbase");
  const tried = img.getAttribute("data-tried")?.split(",") || [];
  const candidates = [".jpeg", ".png", ".svg"];
  const next = candidates.find((ext) => !tried.includes(ext));
  if (next) {
    tried.push(next);
    img.setAttribute("data-tried", tried.join(","));
    img.src = src.replace(/\.[^/.]+$/, next);
  }
}

const BrandMarquee = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const offsetRef = useRef(0);
  const halfWidthRef = useRef(0);
  const runningRef = useRef(true);
  const baseSpeedRef = useRef(0.08);
  const speedMultiplierRef = useRef(1);

  const items = [...mockBrands];

  const measure = () => {
    const track = trackRef.current;
    if (!track) return;
    // El track contiene dos copias consecutivas
    const totalWidth = track.scrollWidth;
    halfWidthRef.current = totalWidth / 2;
  };

  useEffect(() => {
    measure();
    const onResize = () => {
      // reset offset para evitar saltos al redimensionar
      offsetRef.current = 0;
      if (trackRef.current) trackRef.current.style.transform = `translateX(0px)`;
      measure();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const step = (t) => {
      if (!runningRef.current) {
        lastRef.current = t;
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      if (!lastRef.current) lastRef.current = t;
      const dt = t - lastRef.current;
      lastRef.current = t;
      const speedPxPerMs = baseSpeedRef.current * speedMultiplierRef.current; // velocidad dinámica
      offsetRef.current += dt * speedPxPerMs;
      const half = halfWidthRef.current || 1;
      if (offsetRef.current >= half) {
        offsetRef.current -= half; // wrap sin salto
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hasFinePointer = () =>
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  const pause = () => { runningRef.current = false; };
  const resume = () => { runningRef.current = true; };
  const accelerate = () => {
    if (hasFinePointer()) {
      speedMultiplierRef.current = 2.5; // only desktop/mouse
      runningRef.current = true;
    }
  };
  const normalize = () => { speedMultiplierRef.current = 1; runningRef.current = true; };

  return (
    <section id="informacion" className="bg-slate-800 py-16 scroll-mt-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-8 leading-tight">
          <span className="bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
            Marcas que comercializamos
          </span>
        </h2>
        <div
          className="overflow-hidden"
          ref={containerRef}
          onMouseEnter={accelerate}
          onMouseLeave={normalize}
          onMouseDown={pause}
          onMouseUp={resume}
          onTouchStart={pause}
          onTouchEnd={resume}
        >
          <div className="flex gap-6 select-none will-change-transform" ref={trackRef}>
            {[...items, ...items].map((brand, idx) => {
              const isSophiaLoren = brand.name === "Sophia Loren";
              const isPrototype = brand.name === "Prototype";
              return (
                <div
                  key={`${brand.id}-${idx}`}
                  className="min-w-[200px] sm:min-w-[240px] md:min-w-[280px] h-20 md:h-24 lg:h-28 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden p-0"
                >
                  <img
                    src={resolveLogoSrc(brand.logo)}
                    data-srcbase={brand.logo}
                    data-tried=".jpg"
                    alt={brand.name}
                    className={`w-full h-full object-contain ${isSophiaLoren ? 'transform scale-[0.8]' : isPrototype ? 'transform scale-[1.08]' : ''}`}
                    loading="lazy"
                    onError={(e) => handleImgError(e.currentTarget)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandMarquee;


