/*
 * Business settings. Edit this file to rebrand the template for a new client:
 * every WhatsApp button, address and opening-hours label reads from here.
 */
window.SITE = {
  name: "Ganton",
  tagline: "Barber & Wear",

  // International format, digits only: 55 + DDD + number.
  whatsapp: "5569999087663",

  address: "Av. Grove, 1992 — Centro",
  mapsQuery: "Av. Grove, 1992",
  instagram: "@ganton.barberwear",

  // 0 = Sunday … 6 = Saturday. Closed days are omitted.
  hours: {
    2: ["09:00", "20:00"],
    3: ["09:00", "20:00"],
    4: ["09:00", "20:00"],
    5: ["09:00", "20:00"],
    6: ["08:00", "18:00"],
  },
  hoursLabel: "Ter a Sex 9h–20h · Sáb 8h–18h",

  rating: "4,9",
  reviewsCount: 312,

  // Cheat code accepted in the bag (and typed anywhere on the keyboard).
  cheat: { code: "HESOYAM", discount: 0.1 },

  credit: { name: "Trirreme", url: "https://website-trirreme.vercel.app" },
};
