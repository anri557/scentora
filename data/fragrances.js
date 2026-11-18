/**
 * Scentora — Curated Fragrance Catalog (Static, No Database Required)
 * Designed to scale effortlessly up to 300+ products.
 * All prices are in Georgian Lari (GEL / ₾).
 */

export const STORE_CONFIG = {
  brandName: "SCENTORA",
  tagline: "Whispering Aromas",
  currencySymbol: "₾",
  currencyCode: "GEL",
  whatsappNumber: "995555000000", // Replace with the business owner's WhatsApp number (country code + digits, no +)
  instagramHandle: "@scentora.perfumes",
  email: "concierge@scentora.ge",
  location: "Tbilisi, Georgia",
  freeShippingThreshold: 250,
};

export const CATEGORIES = ["All", "Male", "Female", "Unisex"];
export const BOTTLE_SIZES = ["All", "3ml", "5ml", "10ml"];

export const FRAGRANCES = [
  {
    id: "scn-001",
    slug: "velvet-santal",
    name: "Velvet Santal",
    subtitle: "Extrait de Parfum",
    category: "Unisex",
    scentFamily: "Woody",
    badge: "Signature",
    description:
      "A meditative blend of creamy Mysore sandalwood, toasted cardamom, and warm skin musk that lingers like a quiet memory.",
    notes: {
      top: ["Cardamom", "White Violet", "Bergamot"],
      heart: ["Mysore Sandalwood", "Iris Butter", "Papyrus"],
      base: ["Ambroxan", "Cedarwood", "Skin Musk"],
    },
    longevity: 5,
    sillage: 4,
    occasion: "Evening & All-Season",
    image: "/products/bottle-amber.jpg",
    variants: [
      { size: "3ml", price: 145 },
      { size: "5ml", price: 215 },
      { size: "10ml", price: 320 },
    ],
  },
  {
    id: "scn-002",
    slug: "blanc-de-neroli",
    name: "Blanc de Néroli",
    subtitle: "Eau de Cologne",
    category: "Male",
    scentFamily: "Fresh",
    badge: "Bestseller",
    description:
      "Sun-drenched Mediterranean bitter orange blossom, crushed petitgrain leaves, and crisp white tea over mineral vetiver.",
    notes: {
      top: ["Calabrian Bergamot", "Petitgrain", "Lemon Zest"],
      heart: ["Tunisian Neroli", "White Tea", "Orange Blossom"],
      base: ["Haitian Vetiver", "White Cedar", "Clean Musk"],
    },
    longevity: 3,
    sillage: 3,
    occasion: "Daytime & Warm Weather",
    image: "/products/bottle-cologne.jpg",
    variants: [
      { size: "3ml", price: 115 },
      { size: "5ml", price: 175 },
      { size: "10ml", price: 265 },
    ],
  },
  {
    id: "scn-003",
    slug: "rose-silencieuse",
    name: "Rose Silencieuse",
    subtitle: "Eau de Parfum",
    category: "Female",
    scentFamily: "Floral",
    badge: "New",
    description:
      "Dew-kissed Damask rose petals wrapped in pink peppercorn, sheer cashmere wood, and a whisper of white peony.",
    notes: {
      top: ["Pink Pepper", "Lychee", "Mandarin"],
      heart: ["Damask Rose", "White Peony", "Magnolia"],
      base: ["Cashmere Wood", "White Amber", "Musk"],
    },
    longevity: 4,
    sillage: 4,
    occasion: "Day to Evening",
    image: "/products/bottle-floral.jpg",
    variants: [
      { size: "3ml", price: 135 },
      { size: "5ml", price: 195 },
      { size: "10ml", price: 295 },
    ],
  },
  {
    id: "scn-004",
    slug: "noir-oud-atelier",
    name: "Noir Oud Atelier",
    subtitle: "Extrait de Parfum",
    category: "Unisex",
    scentFamily: "Oriental",
    badge: "Limited",
    description:
      "Smoky aged agarwood softened by golden saffron, dark labdanum resin, and velvety black vanilla pod.",
    notes: {
      top: ["Saffron", "Black Pepper", "Nutmeg"],
      heart: ["Aged Agarwood", "Turkish Rose", "Incense"],
      base: ["Labdanum", "Black Vanilla", "Guaiac Wood"],
    },
    longevity: 5,
    sillage: 5,
    occasion: "Evening & Special Occasions",
    image: "/products/bottle-smoked.jpg",
    variants: [
      { size: "3ml", price: 170 },
      { size: "5ml", price: 255 },
      { size: "10ml", price: 380 },
    ],
  },
  {
    id: "scn-005",
    slug: "ambre-dore",
    name: "Ambre Doré",
    subtitle: "Eau de Parfum",
    category: "Female",
    scentFamily: "Oriental",
    badge: "Bestseller",
    description:
      "Luminous golden benzoin and warm tonka bean balanced with salted caramel, jasmine sambac, and cedar.",
    notes: {
      top: ["Mandarin Peel", "Cinnamon Bark", "Bergamot"],
      heart: ["Jasmine Sambac", "Benzoin", "Labdanum"],
      base: ["Tonka Bean", "Madagascar Vanilla", "Ambergris"],
    },
    longevity: 5,
    sillage: 4,
    occasion: "Autumn & Winter Evenings",
    image: "/products/bottle-amber.jpg",
    variants: [
      { size: "3ml", price: 140 },
      { size: "5ml", price: 205 },
      { size: "10ml", price: 310 },
    ],
  },
  {
    id: "scn-006",
    slug: "cedre-imperial",
    name: "Cèdre Impérial",
    subtitle: "Eau de Cologne",
    category: "Male",
    scentFamily: "Woody",
    description:
      "Crisp Atlas cedarwood, crushed juniper berry, and cold-pressed grapefruit over a dry mineral oakmoss base.",
    notes: {
      top: ["Pink Grapefruit", "Juniper Berry", "Cypress"],
      heart: ["Atlas Cedar", "Clary Sage", "Black Tea"],
      base: ["Oakmoss", "Vetiver", "Patchouli"],
    },
    longevity: 4,
    sillage: 3,
    occasion: "Office & Daily Signature",
    image: "/products/bottle-cologne.jpg",
    variants: [
      { size: "3ml", price: 120 },
      { size: "5ml", price: 180 },
      { size: "10ml", price: 270 },
    ],
  },
  {
    id: "scn-007",
    slug: "figue-blanche",
    name: "Figue Blanche",
    subtitle: "Eau de Parfum",
    category: "Unisex",
    scentFamily: "Fresh",
    badge: "New",
    description:
      "Green wild fig leaf, milky fig pulp, and sun-warmed almond wood capturing a late summer afternoon.",
    notes: {
      top: ["Green Fig Leaf", "Galbanum", "Bergamot"],
      heart: ["Ripe Fig", "Coconut Milk", "Iris"],
      base: ["Almond Wood", "White Cedar", "Tonka"],
    },
    longevity: 4,
    sillage: 3,
    occasion: "Spring & Summer",
    image: "/products/bottle-floral.jpg",
    variants: [
      { size: "3ml", price: 130 },
      { size: "5ml", price: 190 },
      { size: "10ml", price: 285 },
    ],
  },
  {
    id: "scn-008",
    slug: "cuir-fumee",
    name: "Cuir Fumée",
    subtitle: "Extrait de Parfum",
    category: "Male",
    scentFamily: "Woody",
    badge: "Signature",
    description:
      "Supple Italian suede infused with smoky birch tar, roasted coffee bean, and dark violet leaf.",
    notes: {
      top: ["Violet Leaf", "Juniper", "Cardamom"],
      heart: ["Italian Suede", "Birch Tar", "Roasted Coffee"],
      base: ["Dark Patchouli", "Vetiver", "Amberwood"],
    },
    longevity: 5,
    sillage: 4,
    occasion: "Evening & Formal",
    image: "/products/bottle-smoked.jpg",
    variants: [
      { size: "3ml", price: 155 },
      { size: "5ml", price: 230 },
      { size: "10ml", price: 345 },
    ],
  },
  {
    id: "scn-009",
    slug: "jasmin-de-nuit",
    name: "Jasmin de Nuit",
    subtitle: "Eau de Parfum",
    category: "Female",
    scentFamily: "Floral",
    description:
      "Intoxicating night-blooming jasmine and creamy tuberose grounded by warm sandalwood and white honey.",
    notes: {
      top: ["Neroli", "Pear Blossom", "Mandarin"],
      heart: ["Night Jasmine", "Tuberose", "Ylang-Ylang"],
      base: ["White Honey", "Sandalwood", "Vanilla Musk"],
    },
    longevity: 4,
    sillage: 4,
    occasion: "Romantic & Evening",
    image: "/products/bottle-floral.jpg",
    variants: [
      { size: "3ml", price: 138 },
      { size: "5ml", price: 200 },
      { size: "10ml", price: 300 },
    ],
  },
  {
    id: "scn-010",
    slug: "bergamote-mineral",
    name: "Bergamote Minéral",
    subtitle: "Eau de Cologne",
    category: "Male",
    scentFamily: "Fresh",
    description:
      "Sparkling Calabrian bergamot, sea salt spray, and crisp ginger root drying down to clean driftwood.",
    notes: {
      top: ["Calabrian Bergamot", "Fresh Ginger", "Yuzu"],
      heart: ["Sea Salt", "Rosemary", "Geranium"],
      base: ["Driftwood", "Ambrox", "White Musk"],
    },
    longevity: 3,
    sillage: 3,
    occasion: "Everyday & Active",
    image: "/products/bottle-cologne.jpg",
    variants: [
      { size: "3ml", price: 110 },
      { size: "5ml", price: 165 },
      { size: "10ml", price: 250 },
    ],
  },
  {
    id: "scn-011",
    slug: "vanille-smoke",
    name: "Vanille & Smoke",
    subtitle: "Extrait de Parfum",
    category: "Unisex",
    scentFamily: "Gourmand",
    badge: "Bestseller",
    description:
      "Unsweetened charred bourbon vanilla layered with toasted hazelnut, guaiac smoke, and warm rum absolute.",
    notes: {
      top: ["Rum Absolute", "Pink Pepper", "Bitter Almond"],
      heart: ["Bourbon Vanilla", "Toasted Hazelnut", "Cacao"],
      base: ["Guaiac Wood", "Peru Balsam", "Benzoin"],
    },
    longevity: 5,
    sillage: 4,
    occasion: "Cozy & Evening",
    image: "/products/bottle-amber.jpg",
    variants: [
      { size: "3ml", price: 150 },
      { size: "5ml", price: 220 },
      { size: "10ml", price: 330 },
    ],
  },
  {
    id: "scn-012",
    slug: "iris-cachemire",
    name: "Iris Cachemire",
    subtitle: "Eau de Parfum",
    category: "Female",
    scentFamily: "Floral",
    description:
      "Powdery Florentine iris root, soft heliotrope, and clean almond milk resting on a veil of white suede.",
    notes: {
      top: ["Angelica Seed", "Bergamot", "Aldehydes"],
      heart: ["Florentine Iris", "Heliotrope", "Violet"],
      base: ["White Suede", "Ambrette Seed", "Cashmeran"],
    },
    longevity: 4,
    sillage: 3,
    occasion: "Everyday Luxury",
    image: "/products/bottle-smoked.jpg",
    variants: [
      { size: "3ml", price: 142 },
      { size: "5ml", price: 210 },
      { size: "10ml", price: 315 },
    ],
  },
];
