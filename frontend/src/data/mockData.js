// Mock data for the optical shop

export const mockPromotions = [
  {
    id: 1,
    title: "en Lentes Recetados",
    discount: "50% OFF",
    type: "Promoción Especial",
    description: "Aprovechá nuestra oferta especial en lentes recetados. Incluye consulta gratuita con optometrista y garantía extendida.",
    features: ["Consulta Gratuita", "Garantía 2 años", "Entrega Rápida"],
    validUntil: "2024-02-15"
  },
  {
    id: 2,
    title: "en Gafas de Sol",
    discount: "30% OFF",
    type: "Oferta Diaria",
    description: "Protegé tus ojos con estilo. Gran variedad de marcas premium con filtros UV400 y diseños exclusivos.",
    features: ["UV400", "Marcas Premium", "Diseños Exclusivos"],
    validUntil: "2024-02-10"
  },
  {
    id: 3,
    title: "en Armazones",
    discount: "40% OFF",
    type: "Promoción Mensual",
    description: "Encontrá el armazón perfecto para tu estilo. Amplia selección de materiales y colores con ajuste personalizado.",
    features: ["Ajuste Gratis", "Amplia Selección", "Materiales Premium"],
    validUntil: "2024-02-29"
  }
];

export const mockBrands = [
  {
    id: 1,
    name: "Ray-Ban",
    color: "#DC2626", // Red
    textColor: "#FFFFFF",
    description: "Lentes icónicos desde 1937"
  },
  {
    id: 2,
    name: "Oakley",
    color: "#1F2937", // Dark gray/black
    textColor: "#FFFFFF",
    description: "Tecnología deportiva avanzada"
  },
  {
    id: 3,
    name: "Ay Not Dead",
    color: "#7C3AED", // Purple
    textColor: "#FFFFFF",
    description: "Diseño argentino innovador"
  },
  {
    id: 4,
    name: "Prada",
    color: "#000000", // Black
    textColor: "#FFFFFF",
    description: "Elegancia italiana"
  },
  {
    id: 5,
    name: "Giorgio Armani",
    color: "#1E40AF", // Blue
    textColor: "#FFFFFF",
    description: "Sofisticación atemporal"
  },
  {
    id: 6,
    name: "Dolce & Gabbana",
    color: "#B91C1C", // Dark red
    textColor: "#FFFFFF",
    description: "Lujo italiano"
  },
  {
    id: 7,
    name: "Persol",
    color: "#92400E", // Brown
    textColor: "#FFFFFF",
    description: "Artesanía italiana"
  },
  {
    id: 8,
    name: "Tom Ford",
    color: "#374151", // Dark gray
    textColor: "#FFFFFF",
    description: "Lujo contemporáneo"
  }
];

export const mockCompanyInfo = {
  name: "Óptica Villalba",
  tagline: "Calidad Visual Premium",
  description: "Elevar su estándar de vida, maximizando su calidad visual, proponiéndole siempre los más avanzados productos con la más alta calidad.",
  address: "Av. Las Heras 3751, Palermo, Buenos Aires",
  phone: "+54 11 6415-6306",
  whatsapp: "https://wa.me/541164156306",
  hours: {
    weekdays: "Lunes a Viernes: 10:00hs a 13:30hs y de 15:30hs a 19:00hs",
    weekend: "Sábados: Cerrado - Domingos: Cerrado"
  },
  services: [
    "Lentes Recetados",
    "Gafas de Sol",
    "Lentes de Contacto",
    "Consultas Optométricas",
    "Reparaciones",
    "Ajustes Personalizados"
  ],
  commitment: "Nuestro compromiso: Elevar su estándar de vida, maximizando su calidad visual, proponiéndole siempre los más avanzados productos con la más alta calidad."
};