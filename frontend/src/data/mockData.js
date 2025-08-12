// Mock data for the optical shop

export const mockPromotions = [
  {
    id: 1,
    title: "Anteojos de Sol",
    discount: "15% OFF",
    type: "Promoción",
    description: "Pagando en efectivo.",
    features: ["Anteojos de sol", "15% OFF", "Pago en efectivo"],
    validUntil: "2025-12-31",
    image: "/assets/images/promo1-desktop.jpg"
  },
  {
    id: 2,
    title: "Promo Multifocales",
    discount: "2x1",
    type: "Promoción",
    description: "Comprando un par de multifocales ZEISS o VARILUX, te llevás el segundo par de regalo. Además, 3 y 6 cuotas sin interés con Visa y Mastercard.",
    features: ["ZEISS o VARILUX", "Segundo par de regalo", "3 y 6 cuotas sin interés", "Visa / Mastercard"],
    validUntil: "2025-12-31",
    image: "/assets/images/promo2-desktop.jpg"
  }
];

export const mockBrands = [
  { id: 1, name: "Rayban", logo: "/assets/brands/rayban.png" },
  { id: 2, name: "Oakley", logo: "/assets/brands/oakley.png" },
  { id: 3, name: "Vogue", logo: "/assets/brands/vogue.png" },
  { id: 4, name: "Roots", logo: "/assets/brands/roots.png" },
  { id: 5, name: "Cima", logo: "/assets/brands/cima.png" },
  { id: 6, name: "Armani Exchange", logo: "/assets/brands/armani-exchange.png" },
  { id: 7, name: "Prüne", logo: "/assets/brands/prune.png" },
  { id: 8, name: "Mistral", logo: "/assets/brands/mistral.png" },
  { id: 9, name: "Optitech", logo: "/assets/brands/optitech.png" },
  { id: 10, name: "UnionPacific", logo: "/assets/brands/up.png" },
  { id: 11, name: "Jean Monnier", logo: "/assets/brands/jean-monnier.png" },
  { id: 12, name: "Paul Riviere", logo: "/assets/brands/paul-riviere.png" },
  { id: 13, name: "Orbital", logo: "/assets/brands/orbital.png" },
  { id: 14, name: "Daniel Cassin", logo: "/assets/brands/daniel-cassin.png" },
  { id: 15, name: "Reef", logo: "/assets/brands/reef.png" },
  { id: 16, name: "Nakyma", logo: "/assets/brands/nakyma.png" },
  { id: 17, name: "Moorea", logo: "/assets/brands/moorea.png" },
  { id: 18, name: "Ay Not Dead", logo: "/assets/brands/ay-not-dead.png" },
  { id: 19, name: "Stetson", logo: "/assets/brands/stetson.png" },
  { id: 20, name: "Tiffany", logo: "/assets/brands/tiffany.png" },
  { id: 21, name: "Prototype", logo: "/assets/brands/prototype.png" },
  { id: 22, name: "Sophia Loren", logo: "/assets/brands/sophia-loren.png" }
];

export const mockCompanyInfo = {
  name: "Óptica Villalba",
  tagline: "Calidad Visual",
  description: "Nuestro compromiso es elevar su estándar de vida, maximizando su calidad visual, proponiéndole siempre los más avanzados productos con la más alta calidad.",
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
    "Reparaciones",
    "Ajustes Personalizados"
  ],
  commitment: "Nuestro compromiso es elevar su estándar de vida, maximizando su calidad visual, proponiéndole siempre los más avanzados productos con la más alta calidad."
};