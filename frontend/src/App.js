import React, { useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";

function App() {
  useEffect(() => {
    // Function to remove emergent badges
    const removeEmergentBadges = () => {
      // Remove by ID
      const badgeById = document.getElementById('emergent-badge');
      if (badgeById) {
        badgeById.remove();
      }
      
      // Remove any elements containing "emergent" text
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        if (element.textContent && element.textContent.toLowerCase().includes('emergent')) {
          if (element.style.position === 'fixed' || 
              element.style.position === 'absolute' ||
              element.classList.contains('badge') ||
              element.id === 'emergent-badge') {
            element.remove();
          }
        }
      });
      
      // Remove any links with emergent in href
      const links = document.querySelectorAll('a[href*="emergent"]');
      links.forEach(link => link.remove());
    };

    // Run immediately
    removeEmergentBadges();
    
    // Run periodically
    const interval = setInterval(removeEmergentBadges, 1000);
    
    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
      {/* WhatsApp Floating Bubble */}
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
    </div>
  );
}

export default App;