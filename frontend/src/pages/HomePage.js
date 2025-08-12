import React from "react";
import Header from "../components/Header";
import HeroCarousel from "../components/HeroCarousel";
import InfoSection from "../components/InfoSection";
import BrandMarquee from "../components/BrandMarquee";
import Footer from "../components/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <main>
        <HeroCarousel />
        <InfoSection />
        <BrandMarquee />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;