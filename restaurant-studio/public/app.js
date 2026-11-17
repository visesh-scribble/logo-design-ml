/**
 * GourmetStudio Pro - Core Application Engine
 * Generates 7 standard logo types, parses menu files (CSV, XLSX, JSON),
 * and renders reference-accurate digital & print menu boards.
 */

// Global State
const state = {
  brand: {
    name: "Glow with Khushi",
    tagline: "Crispy, Cheesy & Absolutely Delicious!",
    estYear: "EST. 2024",
    cuisine: "veg",
    primaryColor: "#d4af37",
    bgColor: "#111827",
    accentColor: "#ffffff",
    icon: "chefhat"
  },
  logoFilter: "all",
  selectedLogoIndex: 4, // Default to emblem / seal
  menu: {
    template: "infographic", // 'infographic' (Image 1) | 'photorow' (Image 3) | 'chinese' (Image 5) | 'editorial' (Image 2) | 'luxe' | 'chalkboard' | 'tv'
    orientation: "portrait",
    columns: 2,
    currency: "Rs. ",
    priceStyle: "dots",
    photoStyle: "auto",
    showLogo: true,
    showVegBadges: true,
    showDesc: true,
    showDietary: true,
    showFooter: true,
    headerSubtext: "Crispy, Cheesy & Absolutely Delicious! • Perfect for Parties & Cravings",
    categories: []
  }
};

// CULINARY VECTOR ICONS
const ICONS = {
  chefhat: `
    <path fill="currentColor" d="M18.5 4C17.65 4 16.89 4.38 16.36 4.97C15.5 3.19 13.68 2 11.5 2C8.74 2 6.5 4.24 6.5 7C5.07 7.25 4 8.5 4 10C4 11.66 5.34 13 7 13H17C18.66 13 20 11.66 20 10C20 8.54 18.96 7.33 17.57 7.05C18.13 6.18 18.5 5.13 18.5 4ZM6 15H18V19C18 19.55 17.55 20 17 20H7C6.45 20 6 19.55 6 19V15Z"/>`,
  leaf: `
    <path fill="currentColor" d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 6 17.5L5 20C5 20 12 18 16 14C20 10 20 7 20 7C20 7 19.5 7.8 17 8Z"/>`,
  cutlery: `
    <g fill="currentColor">
      <path d="M12 2C11.45 2 11 2.45 11 3V9C11 9.55 11.45 10 12 10C12.55 10 13 9.55 13 9V3C13 2.45 12.55 2 12 2Z"/>
      <path d="M8 2V7C8 8.1 8.9 9 10 9V20C10 20.55 10.45 21 11 21H13C13.55 21 14 20.55 14 20V9C15.1 9 16 8.1 16 7V2H14.5V6.5H13.5V2H12.5V6.5H11.5V2H10.5V6.5H9.5V2H8Z"/>
      <path d="M19 2H18C16.9 2 16 2.9 16 4V11H17.5V20C17.5 20.55 17.95 21 18.5 21C19.05 21 19.5 20.55 19.5 20V4C19.5 2.9 19.28 2 19 2Z"/>
    </g>`,
  cloche: `
    <path fill="currentColor" d="M12 4C12.55 4 13 3.55 13 3C13 2.45 12.55 2 12 2C11.45 2 11 2.45 11 3C11 3.55 11.45 4 12 4ZM12 6C6.48 6 2 10.48 2 16H22C22 10.48 17.52 6 12 6ZM1 18C1 18.55 1.45 19 2 19H22C22.55 19 23 18.55 23 18C23 17.45 22.55 17 22 17H2C1.45 17 1 17.45 1 18ZM5 20H19C19.55 20 20 20.45 20 21C20 21.55 19.55 22 19 22H5C4.45 22 4 21.55 4 21C4 20.45 4.45 20 5 20Z"/>`,
  flame: `
    <path fill="currentColor" d="M12 2C11.5 4 9 7.5 9 10C9 11.3 9.5 12.5 10.3 13.3C10.7 12.3 11.3 11.5 12 11C12.7 11.5 13.3 12.3 13.7 13.3C14.5 12.5 15 11.3 15 10C15 7.5 12.5 4 12 2ZM12 6C13.1 8 16 11 16 14C16 17.3 13.8 20 11 20C8.2 20 6 17.3 6 14C6 11 8.9 8 10 6C9.2 7.7 8 10.1 8 12C8 14.8 9.8 17 12 17C14.2 17 16 14.8 16 12C16 10.1 14.8 7.7 14 6C13.2 7 12.5 8 12 9.5C11.5 8 10.8 7 10 6H12Z"/>`,
  ramen: `
    <path fill="currentColor" d="M20 12C20 16.42 16.42 20 12 20C7.58 20 4 16.42 4 12H20ZM6 21H18V22H6V21ZM22 5L7 8V9.5L22 6.5V5ZM22 8L9 10.5V11.5L22 9V8Z"/>`,
  burger: `
    <path fill="currentColor" d="M12 3C6.48 3 2 6.5 2 10H22C22 6.5 17.52 3 12 3ZM3 12H21V14H3V12ZM4 16C3.45 16 3 16.45 3 17V18C3 19.66 4.34 21 6 21H18C19.66 21 21 19.66 21 18V17C21 16.45 20.55 16 20 16H4Z"/>`,
  wheat: `
    <path fill="currentColor" d="M12 2C12 2 11 5 8 7C11 7 12 9 12 9C12 9 13 7 16 7C13 5 12 2 12 2ZM8 9C5 9 4 12 4 12C4 12 7 13 8 15C9 13 9 10 8 9ZM16 9C15 10 15 13 16 15C17 13 20 12 20 12C20 12 19 9 16 9ZM11 18V22H13V18H11Z"/>`,
  coffee: `
    <path fill="currentColor" d="M4 19H18C18.55 19 19 18.55 19 18V8H2V18C2 18.55 2.45 19 4 19ZM20 8H21C22.1 8 23 8.9 23 10V12C23 13.1 22.1 14 21 14H20V16H21C23.21 16 25 14.21 25 12V10C25 7.79 23.21 6 21 6H20V8ZM1 20H21V22H1V20Z"/>`,
  pizza: `
    <path fill="currentColor" d="M12 2C8.6 2 5.4 3 2.7 4.7C2.2 5 2 5.6 2.2 6.1L11.3 21.5C11.6 22 12.4 22 12.7 21.5L21.8 6.1C22 5.6 21.8 5 21.3 4.7C18.6 3 15.4 2 12 2ZM12 4C14.8 4 17.5 4.8 19.8 6.2L12 19.4L4.2 6.2C6.5 4.8 9.2 4 12 4ZM12 7C10.9 7 10 7.9 10 9C10 10.1 10.9 11 12 11C13.1 11 14 10.1 14 9C14 7.9 13.1 7 12 7Z"/>`
};

// Helper: Extract Initials for Lettermark Monograms
function getInitials(name) {
  if (!name) return "GB";
  const clean = name.replace(/&#\d+;/g, " ").replace(/[^a-zA-Z0-9\s]/g, "").trim();
  const words = clean.split(/\s+/).filter(w => !["and", "with", "the", "of", "in"].includes(w.toLowerCase()));
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
}

// ========================================================
// THE 7 DISTINCT LOGO TYPES (Aligned with Reference Image 4)
// ========================================================
const LOGO_TEMPLATES = [
  // 1. PICTORIAL (Image symbolising the brand: Apple, Lacoste, Shell style)
  {
    type: "pictorial",
    title: "1. Pictorial Logo",
    style: "Image Symbolising the Brand",
    generate: (brand) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Pure Iconic Pictorial Silhouette -->
        <circle cx="250" cy="180" r="100" fill="${brand.primaryColor}" opacity="0.12"/>
        <g transform="translate(250, 180) scale(4.8)" color="${brand.primaryColor}">
          <g transform="translate(-12, -12)">${ICONS[brand.icon] || ICONS.chefhat}</g>
        </g>
        <!-- Clean Iconic Understatement -->
        <text x="250" y="335" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="800" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="3">
          ${brand.name.toUpperCase()}
        </text>
        <line x1="210" y1="360" x2="290" y2="360" stroke="${brand.primaryColor}" stroke-width="2.5" stroke-linecap="round"/>
        <text x="250" y="395" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="600" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="4">
          ${brand.tagline.toUpperCase()}
        </text>
      </svg>`
  },

  // 2. LETTERMARK (Initials forming brand identity: McDonald's, HBO, H&M style)
  {
    type: "lettermark",
    title: "2. Lettermark (Monogram)",
    style: "Initials Forming Brand Identity",
    generate: (brand) => {
      const initials = getInitials(brand.name);
      return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Interlocking Monogram Seal -->
        <rect x="150" y="80" width="200" height="200" rx="36" fill="none" stroke="${brand.primaryColor}" stroke-width="3.5"/>
        <rect x="162" y="92" width="176" height="176" rx="28" fill="${brand.primaryColor}" opacity="0.08"/>
        <!-- Initials -->
        <text x="250" y="215" font-family="'Cinzel', 'Playfair Display', serif" font-size="86" font-weight="900" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="6">
          ${initials}
        </text>
        <!-- Full Brand Name Underneath -->
        <text x="250" y="330" font-family="'Cinzel', serif" font-size="28" font-weight="800" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="4">
          ${brand.name.toUpperCase()}
        </text>
        <text x="250" y="365" font-family="'Montserrat', sans-serif" font-size="12" font-weight="600" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="3">
          ${brand.tagline.toUpperCase()}
        </text>
        <text x="250" y="405" font-family="'Space Grotesk', sans-serif" font-size="11" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="4" opacity="0.7">
          ${brand.estYear}
        </text>
      </svg>`;
    }
  },

  // 3. WORDMARK (Brand name in typography: Disney, DELL, Coca-Cola style)
  {
    type: "wordmark",
    title: "3. Wordmark Logo",
    style: "Brand Name in Distinct Typography",
    generate: (brand) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Elegant Flourish Frame -->
        <g stroke="${brand.primaryColor}" stroke-width="1.5" fill="none" opacity="0.5">
          <path d="M 120 180 Q 250 140 380 180"/>
          <path d="M 120 320 Q 250 360 380 320"/>
        </g>
        <!-- Custom Typographic Title -->
        <text x="250" y="240" font-family="'Great Vibes', cursive" font-size="58" fill="${brand.primaryColor}" text-anchor="middle">
          ${brand.name}
        </text>
        <!-- Elegant underline swash -->
        <path d="M 140 265 Q 250 295 360 265" fill="none" stroke="${brand.primaryColor}" stroke-width="2.5" stroke-linecap="round"/>
        <!-- Subtitle -->
        <text x="250" y="305" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="5">
          ${brand.tagline.toUpperCase()}
        </text>
        <text x="250" y="340" font-family="'Cinzel', serif" font-size="11" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="3" opacity="0.8">
          — ${brand.estYear} —
        </text>
      </svg>`
  },

  // 4. COMBINATION (Text and symbol together: Amazon, Levi's, Puma style)
  {
    type: "combination",
    title: "4. Combination Mark",
    style: "Text and Symbol Together in Harmony",
    generate: (brand) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Balanced Symbol Badge -->
        <g transform="translate(250, 160)">
          <circle cx="0" cy="0" r="65" fill="${brand.primaryColor}"/>
          <g transform="scale(3.2)" color="${brand.bgColor}">
            <g transform="translate(-12, -12)">${ICONS[brand.icon] || ICONS.chefhat}</g>
          </g>
        </g>
        <!-- Bold Brand Wordmark Below -->
        <text x="250" y="295" font-family="'Oswald', 'Montserrat', sans-serif" font-size="38" font-weight="700" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="2">
          ${brand.name.toUpperCase()}
        </text>
        <rect x="160" y="320" width="180" height="26" rx="13" fill="${brand.primaryColor}"/>
        <text x="250" y="337" font-family="'Montserrat', sans-serif" font-size="10" font-weight="800" fill="${brand.bgColor}" text-anchor="middle" letter-spacing="2">
          ${brand.tagline.toUpperCase()}
        </text>
        <text x="250" y="380" font-family="'Space Grotesk', sans-serif" font-size="11" font-weight="600" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="3">
          AUTHENTIC CRAFT • ${brand.estYear}
        </text>
      </svg>`
  },

  // 5. EMBLEMS (Text enclosed in symbol: Warner Bros, Harley, Starbucks style)
  {
    type: "emblem",
    title: "5. Emblem (Enclosed Badge)",
    style: "Text Enclosed Inside Symbol / Crest",
    generate: (brand) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <defs>
          <path id="topSealCurve" d="M 90 250 A 160 160 0 0 1 410 250" fill="none"/>
          <path id="bottomSealCurve" d="M 410 250 A 160 160 0 0 1 90 250" fill="none"/>
        </defs>
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Concentric Circular Rings -->
        <circle cx="250" cy="250" r="215" fill="none" stroke="${brand.primaryColor}" stroke-width="4"/>
        <circle cx="250" cy="250" r="202" fill="none" stroke="${brand.primaryColor}" stroke-width="1.5" stroke-dasharray="5 4"/>
        <circle cx="250" cy="250" r="140" fill="none" stroke="${brand.primaryColor}" stroke-width="2.5"/>
        <circle cx="250" cy="250" r="130" fill="${brand.bgColor}" stroke="${brand.primaryColor}" stroke-width="1"/>
        <!-- Enclosed Curved Text -->
        <text fill="${brand.primaryColor}" font-family="'Montserrat', sans-serif" font-size="14" font-weight="800" letter-spacing="5">
          <textPath href="#topSealCurve" startOffset="50%" text-anchor="middle">
            ★ ${brand.tagline.toUpperCase()} ★
          </textPath>
        </text>
        <text fill="${brand.primaryColor}" font-family="'Montserrat', sans-serif" font-size="13" font-weight="700" letter-spacing="5">
          <textPath href="#bottomSealCurve" startOffset="50%" text-anchor="middle">
            • ${brand.estYear} •
          </textPath>
        </text>
        <!-- Center Emblem Icon -->
        <g transform="translate(250, 195) scale(3.2)" color="${brand.primaryColor}">
          <g transform="translate(-12, -12)">${ICONS[brand.icon] || ICONS.chefhat}</g>
        </g>
        <!-- Horizontal Banner for Restaurant Name -->
        <g transform="translate(250, 280)">
          <path d="M-150 0 L150 0 L140 40 L-140 40 Z" fill="${brand.primaryColor}"/>
          <text x="0" y="27" font-family="'Cinzel', 'Playfair Display', serif" font-size="20" font-weight="900" fill="${brand.bgColor}" text-anchor="middle" letter-spacing="2">
            ${brand.name.toUpperCase()}
          </text>
        </g>
      </svg>`
  },

  // 6. ABSTRACT (Geometric shapes with meaning: Toyota, Chase, Mastercard, Airbnb style)
  {
    type: "abstract",
    title: "6. Abstract Geometric Mark",
    style: "Geometric Shapes with Culinary Meaning",
    generate: (brand) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Modernist Overlapping Geometry (Mastercard/Airbnb inspired culinary rings) -->
        <circle cx="220" cy="170" r="65" fill="${brand.primaryColor}" opacity="0.6"/>
        <circle cx="280" cy="170" r="65" fill="${brand.accentColor}" opacity="0.3"/>
        <circle cx="250" cy="170" r="65" fill="none" stroke="${brand.primaryColor}" stroke-width="3"/>
        <!-- Minimalist Line Elements -->
        <line x1="250" y1="120" x2="250" y2="220" stroke="${brand.bgColor}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="250" cy="170" r="10" fill="${brand.bgColor}"/>
        <!-- Abstract Modern Typography -->
        <text x="250" y="315" font-family="'Space Grotesk', 'Plus Jakarta Sans', sans-serif" font-size="36" font-weight="800" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="3">
          ${brand.name.toUpperCase()}
        </text>
        <line x1="180" y1="335" x2="320" y2="335" stroke="${brand.primaryColor}" stroke-width="2"/>
        <text x="250" y="365" font-family="'Space Grotesk', sans-serif" font-size="12" font-weight="600" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="4">
          ${brand.tagline.toUpperCase()}
        </text>
        <text x="250" y="400" font-family="'Space Grotesk', sans-serif" font-size="10" font-weight="700" fill="${brand.accentColor}" text-anchor="middle" letter-spacing="3" opacity="0.6">
          CONCEPTUAL KITCHEN • ${brand.estYear}
        </text>
      </svg>`
  },

  // 7. MASCOT (Character representing the brand: KFC, Mailchimp, Pringles style)
  {
    type: "mascot",
    title: "7. Mascot / Character",
    style: "Friendly Character Representing the Brand",
    generate: (brand) => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="w-full h-full">
        <rect width="500" height="500" fill="${brand.bgColor}" rx="14"/>
        <!-- Mascot Outer Badge -->
        <circle cx="250" cy="180" r="95" fill="${brand.primaryColor}" opacity="0.15"/>
        <circle cx="250" cy="180" r="90" fill="none" stroke="${brand.primaryColor}" stroke-width="3" stroke-dasharray="6 3"/>
        
        <!-- Friendly Master Chef Character Mascot -->
        <g transform="translate(250, 180)">
          <!-- Chef Hat Toque -->
          <path d="M -30 -35 C -45 -60 -20 -85 0 -80 C 20 -85 45 -60 30 -35 Z" fill="${brand.primaryColor}"/>
          <rect x="-26" y="-35" width="52" height="12" rx="4" fill="${brand.accentColor}"/>
          <!-- Smiling Face Head -->
          <circle cx="0" cy="5" r="32" fill="${brand.primaryColor}" opacity="0.9"/>
          <!-- Eyes winking -->
          <circle cx="-10" cy="0" r="3.5" fill="${brand.bgColor}"/>
          <path d="M 7 -2 Q 12 3 17 -2" stroke="${brand.bgColor}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- Chef Mustache -->
          <path d="M 0 14 C -12 10 -22 18 -26 24 C -16 26 -6 20 0 16 C 6 20 16 26 26 24 C 22 18 12 10 0 14 Z" fill="${brand.bgColor}"/>
          <!-- Red Bow Tie -->
          <polygon points="-12,38 0,34 -12,30" fill="#dc2626"/>
          <polygon points="12,38 0,34 12,30" fill="#dc2626"/>
          <circle cx="0" cy="34" r="3.5" fill="#ffffff"/>
        </g>

        <!-- Brand Name -->
        <text x="250" y="325" font-family="'Playfair Display', serif" font-size="34" font-weight="800" fill="${brand.accentColor}" text-anchor="middle">
          ${brand.name}
        </text>
        <text x="250" y="360" font-family="'Montserrat', sans-serif" font-size="12" font-weight="700" fill="${brand.primaryColor}" text-anchor="middle" letter-spacing="3">
          ${brand.tagline.toUpperCase()}
        </text>
        <text x="250" y="395" font-family="'Caveat', cursive" font-size="18" font-weight="700" fill="${brand.accentColor}" text-anchor="middle" opacity="0.9">
          Made with Love • ${brand.estYear}
        </text>
      </svg>`
  }
];

// ========================================================
// EMBEDDED SAMPLE MENUS (Matching User's Reference Images)
// ========================================================
// Every base template receives XML-safe text, so exported SVG/PNG files stay valid for names like "Fire & Oak"
LOGO_TEMPLATES.forEach(t => {
  const gen = t.generate;
  t.generate = (brand) => gen(Object.assign({}, brand, {
    name: escXml(brand.name || ""), tagline: escXml(brand.tagline || ""), estYear: escXml(brand.estYear || "")
  }));
});

const REFERENCE_SAMPLES = {
  // Reference 1: "8 IRRESISTIBLE VEG STARTERS" (Glow with Khushi style)
  veg_starters: {
    brandName: "Glow with Khushi",
    tagline: "Crispy, Cheesy & Absolutely Delicious!",
    estYear: "Made with Love",
    cuisine: "veg",
    template: "infographic",
    currency: "Rs. ",
    categories: [
      {
        name: "8 IRRESISTIBLE VEG STARTERS",
        subtitle: "Perfect for parties, get-togethers & every craving! ♡",
        items: [
          {
            number: 1,
            name: "Crispy Cheese Corn Balls",
            tagline: "Crunchy outside, cheesy inside! ♡",
            photo: "https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80",
            ingredients: "1 cup boiled corn, 1/2 cup mashed potato, 2 tbsp cornflour, 1/2 cup mozzarella, chili pepper & herbs, breadcrumbs",
            method: "1. Mix corn, potato, cornflour, salt, pepper & herbs. 2. Stuff with cheese & roll into balls. 3. Coat with breadcrumbs. 4. Deep fry until golden & crispy.",
            price: "160",
            dietary: ["Veg", "Chef's Special"]
          },
          {
            number: 2,
            name: "Tandoori Mushroom Tikka",
            tagline: "Smoky, juicy & full of flavor! ♡",
            photo: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&auto=format&fit=crop&q=80",
            ingredients: "200g mushrooms, 1/2 cup hung curd, 1 tbsp ginger-garlic paste, 1 tsp lemon juice, 1 tbsp tandoori masala, salt, capsicum & onion cubes",
            method: "1. Mix all ingredients to make thick marinade. 2. Coat mushrooms & capsicum & onion. Marinate 20 mins. 3. Skewer & grill or air fry until charred.",
            price: "180",
            dietary: ["Veg", "Spicy"]
          },
          {
            number: 3,
            name: "Crispy Honey Chilli Potatoes",
            tagline: "Sweet, spicy & totally addictive! ♡",
            photo: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80",
            ingredients: "3 medium potatoes, 2 tbsp cornflour, oil for frying, 2 tbsp chili sauce, 1 tbsp tomato ketchup, 1 tbsp honey, 1 tsp soy sauce, sesame seeds",
            method: "1. Cut potatoes, coat with cornflour & deep fry until crispy. 2. In a pan, mix all sauces with honey & cook. 3. Add fried potatoes, toss well. 4. Garnish with sesame & spring onion.",
            price: "150",
            dietary: ["Veg", "Chef's Special"]
          },
          {
            number: 4,
            name: "Paneer Malai Tikka",
            tagline: "Creamy, soft & melts in mouth! ♡",
            photo: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80",
            ingredients: "200g paneer cubes, 1/2 cup hung curd, 2 tbsp cream, 1 tsp ginger-garlic paste, 1 tsp lemon juice, salt & pepper, 1/2 tsp chaat masala",
            method: "1. Mix all ingredients to make creamy marinade. 2. Add paneer cubes, marinate 20 mins. 3. Grill or pan-sear until golden & slightly charred.",
            price: "210",
            dietary: ["Veg"]
          },
          {
            number: 5,
            name: "Veg Spring Rolls",
            tagline: "Crispy rolls, full of veggies! ♡",
            photo: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80",
            ingredients: "1 cup cabbage (shredded), 1/2 cup carrot (julienne), 1/2 cup capsicum (julienne), 1 tsp soy sauce, 1 tsp vinegar, salt & pepper, spring roll sheets",
            method: "1. Stir fry veggies with soy sauce, vinegar, salt & pepper. 2. Cool the filling and roll in spring roll sheets. 3. Seal the edges with slurry. 4. Deep fry until golden & crispy.",
            price: "140",
            dietary: ["Veg"]
          },
          {
            number: 6,
            name: "Hara Bhara Kabab",
            tagline: "Healthy, tasty & melt-in-mouth! ♡",
            photo: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&auto=format&fit=crop&q=80",
            ingredients: "1 cup spinach (blanched), 1/2 cup peas, 2 medium potatoes, 1 green chili, 1 tsp ginger, salt, cumin powder, breadcrumbs, oil for shallow frying",
            method: "1. Blend spinach, peas, chili & ginger. 2. Mix with mashed potatoes & spices. Make patties. 3. Coat with breadcrumbs. 4. Shallow fry until golden.",
            price: "160",
            dietary: ["Veg", "Gluten-Free"]
          },
          {
            number: 7,
            name: "Cheese Stuffed Garlic Bread Rolls",
            tagline: "Cheesy, garlicky & super yummy! ♡",
            photo: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80",
            ingredients: "6 bread slices, 1/2 cup mozzarella cheese, 2 tbsp garlic (minced), 2 tbsp butter, mixed herbs, chili flakes, breadcrumbs",
            method: "1. Flatten bread, stuff with cheese & roll tightly. 2. Coat in breadcrumbs. 3. Heat butter, garlic, herbs & chili flakes. 4. Fry rolls until golden & toss in garlic butter.",
            price: "170",
            dietary: ["Veg", "Chef's Special"]
          },
          {
            number: 8,
            name: "Crispy Gobi 65",
            tagline: "Spicy, crispy & full of masala! ♡",
            photo: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80",
            ingredients: "1 small cauliflower (florets), 2 tbsp cornflour, 2 tbsp rice flour, 1 tsp ginger-garlic paste, 1 tsp red chili powder, salt to taste, curry leaves",
            method: "1. Mix all ingredients (except curry leaves). Coat florets. 2. Deep fry until crispy. 3. In a pan, add curry leaves & toss the fried gobi.",
            price: "150",
            dietary: ["Veg", "Spicy"]
          }
        ]
      }
    ]
  },

  // Reference 3: "MAIN COURSE" (Circular Dish Photos & Dotted Leaders)
  indian_main: {
    brandName: "Royal Rasoi & Curries",
    tagline: "Pure Authentic Indian Flavours",
    estYear: "EST. 2012",
    cuisine: "indian",
    template: "photorow",
    currency: "Rs. ",
    categories: [
      {
        name: "MAIN COURSE",
        items: [
          { name: "DAL TADKA", photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80", price: "59", dietary: ["Veg"] },
          { name: "DAL FRY", photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80", price: "59", dietary: ["Veg"] },
          { name: "DAL MAKHAN", photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80", price: "69", dietary: ["Veg"] },
          { name: "DAL PANCHRATNA", photo: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&auto=format&fit=crop&q=80", price: "59", dietary: ["Veg"] },
          { name: "MIXED VEG", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "85", dietary: ["Veg"] },
          { name: "ALOO GOBI ADRAKI", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "79", dietary: ["Veg"] },
          { name: "ALOO MUTTER", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "59", dietary: ["Veg"] },
          { name: "BHINDI DO PYAZA", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "69", dietary: ["Veg"] },
          { name: "VEG THALI", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "69", dietary: ["Veg"] },
          { name: "KADHAI PANEER", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "115", dietary: ["Veg", "Chef's Special"] },
          { name: "PANEER DO PYAZA", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "115", dietary: ["Veg"] },
          { name: "PANEER BUTTER MASALA", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "115", dietary: ["Veg", "Chef's Special"] },
          { name: "PALAK PANEER", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "120", dietary: ["Veg"] },
          { name: "PANEER BHURJI", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "115", dietary: ["Veg"] },
          { name: "PANEER LABABDAR", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "120", dietary: ["Veg"] },
          { name: "MUSHROOM MASALA", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "125", dietary: ["Veg"] },
          { name: "MUSHROOM MUTTER MASALA", photo: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&auto=format&fit=crop&q=80", price: "99", dietary: ["Veg"] },
          { name: "VEG KOFTA CURRY", photo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&auto=format&fit=crop&q=80", price: "59", dietary: ["Veg"] },
          { name: "JEERA ALOO", photo: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80", price: "59", dietary: ["Veg"] },
          { name: "ROTI", photo: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&auto=format&fit=crop&q=80", price: "7", dietary: ["Veg"] },
          { name: "TAWA ROTI PLAIN", photo: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&auto=format&fit=crop&q=80", price: "7", dietary: ["Veg"] },
          { name: "TAWA ROTI BUTTER", photo: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&auto=format&fit=crop&q=80", price: "10", dietary: ["Veg"] },
          { name: "LATCHHA PARATHA TAWA", photo: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=300&auto=format&fit=crop&q=80", price: "15", dietary: ["Veg"] }
        ]
      }
    ]
  },

  // Reference 5: "Hongkong Chinese Food Menu" (Takeaway Trifold)
  hongkong_chinese: {
    brandName: "Hongkong Chinese",
    tagline: "Authentic Szechuan & Wok Specialties",
    estYear: "EST. 2018",
    cuisine: "chinese",
    template: "chinese",
    currency: "/-",
    categories: [
      {
        name: "Starters Dishes",
        items: [
          { name: "Veg. Kothe (Per Doz)", price: "100", dietary: ["Veg"] },
          { name: "Fried Wonton (Per Doz)", price: "100", dietary: ["Veg"] },
          { name: "Chilli Paneer", price: "100", dietary: ["Veg"] },
          { name: "Chilli Mushroom", price: "100", dietary: ["Veg"] },
          { name: "Veg Manchurian", price: "100", dietary: ["Veg"] },
          { name: "Ch. Fried Wonton", price: "100", dietary: ["Non-Veg"] },
          { name: "Ch. Spring Roll", price: "100", dietary: ["Non-Veg"] },
          { name: "Chicken Lollipop (7 pcs)", price: "100", dietary: ["Non-Veg"] },
          { name: "Fried Spring Chicken", price: "100", dietary: ["Non-Veg"] }
        ]
      },
      {
        name: "Soups",
        items: [
          { name: "Veg. Hot/Sour Soup", price: "100", dietary: ["Veg"] },
          { name: "Veg. Corn Soup", price: "100", dietary: ["Veg"] },
          { name: "Plain Corn Soup", price: "100", dietary: ["Veg"] },
          { name: "Veg Wonton Soup", price: "100", dietary: ["Veg"] },
          { name: "Veg. S.K. Soup", price: "100", dietary: ["Veg"] },
          { name: "Veg. Manchow Soup", price: "100", dietary: ["Veg"] },
          { name: "Ch. Hot/Sour Soup", price: "100", dietary: ["Non-Veg"] },
          { name: "Ch. Corn Soup", price: "100", dietary: ["Non-Veg"] },
          { name: "Egg Corn Soup", price: "100", dietary: ["Non-Veg"] },
          { name: "Chicken Clear Soup", price: "100", dietary: ["Non-Veg"] }
        ]
      },
      {
        name: "Noodles / Chowmein",
        items: [
          { name: "Mixed Noodle", price: "100", dietary: ["Non-Veg"] },
          { name: "Chicken Noodle", price: "100", dietary: ["Non-Veg"] },
          { name: "Mixed Chow Mein", price: "100", dietary: ["Non-Veg"] },
          { name: "Chicken Chow Mein", price: "100", dietary: ["Non-Veg"] },
          { name: "Egg Chow Mein", price: "100", dietary: ["Non-Veg"] },
          { name: "Prawn Chow Mein", price: "100", dietary: ["Non-Veg"] },
          { name: "Vegetable Chow Mein", price: "100", dietary: ["Veg"] },
          { name: "Ch. Hakka Noodles", price: "100", dietary: ["Non-Veg"] },
          { name: "Veg. Hakka Noodles", price: "100", dietary: ["Veg"] }
        ]
      },
      {
        name: "Fried Rice",
        items: [
          { name: "Mixed Fried Rice", price: "100", dietary: ["Non-Veg"] },
          { name: "Chicken Fried Rice", price: "100", dietary: ["Non-Veg"] },
          { name: "Egg Fried Rice", price: "100", dietary: ["Non-Veg"] },
          { name: "Vegetable Fried Rice", price: "100", dietary: ["Veg"] },
          { name: "Chicken Veg. Steamed Rice", price: "100", dietary: ["Non-Veg"] },
          { name: "Steamed Rice", price: "100", dietary: ["Veg"] },
          { name: "Sp. Triple Chicken Rice", price: "100", dietary: ["Non-Veg"] },
          { name: "Szechuan Veg. Rice", price: "100", dietary: ["Veg"] },
          { name: "Prawn Fried Rice", price: "100", dietary: ["Non-Veg"] }
        ]
      },
      {
        name: "Vegetable Dishes",
        items: [
          { name: "Vegetable Chow Mein", price: "100", dietary: ["Veg"] },
          { name: "Vegetable Fried Rice", price: "100", dietary: ["Veg"] },
          { name: "Vegetable Sweet & Sour", price: "100", dietary: ["Veg"] },
          { name: "Mixed Vegetable", price: "100", dietary: ["Veg"] },
          { name: "Vegetable Manchurian", price: "100", dietary: ["Veg"] },
          { name: "Chilli Paneer", price: "100", dietary: ["Veg"] },
          { name: "Chilli Paneer with Mushroom", price: "100", dietary: ["Veg"] },
          { name: "Chilli Mushroom", price: "100", dietary: ["Veg"] },
          { name: "Veg. Triple Rice", price: "100", dietary: ["Veg"] }
        ]
      },
      {
        name: "Spring Rolls & Chouspuey",
        items: [
          { name: "Chicken Spring Rolls", price: "100", dietary: ["Non-Veg"] },
          { name: "Egg Spring Rolls", price: "100", dietary: ["Non-Veg"] },
          { name: "Vegetable Spring Rolls", price: "100", dietary: ["Veg"] },
          { name: "Vegetable Chopsuey", price: "100", dietary: ["Veg"] },
          { name: "Chinese Chopsuey", price: "100", dietary: ["Veg"] },
          { name: "American Chopsuey", price: "100", dietary: ["Non-Veg"] },
          { name: "Chicken Chopsuey", price: "100", dietary: ["Non-Veg"] }
        ]
      }
    ]
  },

  // Reference 2: "Minimalist Salads & Burgers" (Editorial Bistro style)
  editorial_bistro: {
    brandName: "L'Aura Botanical Bistro",
    tagline: "Organic Salads, Burgers & Handcrafted Sides",
    estYear: "EST. 2021",
    cuisine: "bistro",
    template: "editorial",
    currency: "$",
    categories: [
      {
        name: "Salads",
        iconBadge: "🥗",
        items: [
          { name: "HOUSE SPECIAL SALAD", description: "with greens, olives, green & red peppers, onions, cucumbers & tomato in orange miso vinaigrette", price: "6.75", dietary: ["Veg", "Gluten-Free"] },
          { name: "CRANBERRY CHICKEN SALAD", description: "with romaine, grilled chicken breast, cranberries & satsuma orange slices in spicy curry dressing", price: "12.50", dietary: ["Non-Veg"] },
          { name: "FUJI APPLE & BUTTERLEAF LETTUCE SALAD", description: "with strawberries, candied pecans & gorgonzola in poppy seed dressing", price: "9.75", dietary: ["Veg", "Gluten-Free"] },
          { name: "SESAME SEARED AHI TUNA SALAD", description: "with field greens, cucumber, carrots, tomatoes & crispy onion rings in miso-wasabi dressing", price: "13.50", dietary: ["Non-Veg", "Chef's Special"] }
        ]
      },
      {
        name: "Burgers & Sandwiches",
        iconBadge: "🍔",
        items: [
          { name: "ORGANIC SIRLOIN BURGER", description: "with sharp cheddar, heirloom tomatoes & caramelized onions", price: "9.50", dietary: ["Non-Veg"] },
          { name: "VEGETARIAN BURGER", description: "house-made veggie burger with heirloom tomatoes, avocado & sprouts on a home-baked roll with aioli", price: "9.00", dietary: ["Veg"] },
          { name: "CURRY TURKEY WRAP", description: "smoked turkey, mozzarella, black olives & curried mayo in a curried spinach wrap", price: "7.75", dietary: ["Non-Veg"] },
          { name: "VEGGIE WRAP", description: "roasted vegetables with curry mayo, crisp lettuce, tomatoes & sprouts in a spinach wrap", price: "7.25", dietary: ["Veg"] }
        ]
      },
      {
        name: "Sides",
        iconBadge: "🍟",
        items: [
          { name: "SWEET POTATO FRIES", price: "4.25", dietary: ["Veg"] },
          { name: "COLLARD GREENS", price: "3.25", dietary: ["Veg"] },
          { name: "CHIPOTLE MASHED POTATOES", price: "4.25", dietary: ["Veg"] },
          { name: "GRILLED ASPARAGUS", price: "4.25", dietary: ["Veg", "Gluten-Free"] },
          { name: "ROASTED SUMMER VEGETABLES", price: "4.50", dietary: ["Veg", "Gluten-Free"] },
          { name: "TWICE BAKED BEANS", price: "1.25", dietary: ["Veg"] }
        ]
      }
    ]
  }
};

// ========================================================
// INITIALIZATION
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  loadSampleMenu("veg_starters"); // demo menu items; brand is left blank for the wizard
  ["inputBrandName", "inputTagline", "inputEstYear"].forEach(id => document.getElementById(id).value = "");
  onBrandInputChange();
  state.brandTouched = false;
  setupDragAndDrop();
  setupShell();
  goTo("name", true);
  document.getElementById("inputBrandName").focus();
});

// THEME: dark by default, sun/moon button in the top bar switches it (remembered on this device)
function toggleTheme() {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("gs-theme", next); } catch (e) {}
  syncThemeButton();
}
function syncThemeButton() {
  const b = document.getElementById("themeToggle");
  if (b) b.setAttribute("aria-label", document.documentElement.getAttribute("data-theme") === "dark" ? "Switch to light theme" : "Switch to dark theme");
}
document.addEventListener("DOMContentLoaded", syncThemeButton);

// TAB NAVIGATION
// ========================================================
// ONE-QUESTION-PER-SCREEN WIZARD
// Flow (no logo):  name > hasLogo > tagline > badge > cuisine > styles > colours > logos > menu > mockups
// Flow (has logo): name > hasLogo > tagline > upload > modify > badge > colours > menu > mockups
// ========================================================
state.hasLogo = null;   // null = not answered yet, true / false
state.myLogo = null;    // uploaded + customised logo settings

const STEP_DEFS = {
  name:     { panel: "q", q: 1, title: "What is your restaurant called?", sub: "This name goes on every logo and menu.", phase: "Brand" },
  haslogo:  { panel: "mylogo", sub2: "ask", title: "Do you already have a logo?", sub: "If you do, upload it and we will use it on your menu and mockups.", phase: "Logo" },
  tagline:  { panel: "q", q: 2, title: "Add a tagline or motto", sub: "A short line under the name. You can skip this.", phase: "Brand", optional: true },
  upload:   { panel: "mylogo", sub2: "upload", title: "Upload your logo", sub: "Choose the image file of your current logo.", phase: "Logo" },
  modify:   { panel: "mylogo", sub2: "modify", title: "Adjust your logo", sub: "Change anything you like. The preview updates as you go.", phase: "Logo" },
  badge:    { panel: "q", q: 3, title: "Add a heritage badge", sub: "For example EST. 2024 or Made with Love. You can skip this.", phase: "Brand", optional: true },
  cuisine:  { panel: "q", q: 4, title: "What kind of food do you serve?", sub: "This sets a starting colour palette and the symbol used in your logos.", phase: "Style" },
  colors:   { panel: "q", q: 5, title: "Pick your brand colours", sub: "Choose a palette or your own colour. Used on your menu and logos.", phase: "Style" },
  symbol:   { panel: "q", q: 6, title: "Pick your symbol", sub: "The picture used in your logos.", phase: "Style" },
  styles:   { panel: "styles", title: "Pick a logo style", sub: "Here are 7 preset styles. Click one, pick your colours, and we will create 5 logos with your name in that style.", phase: "Logo" },
  logos:    { panel: "logos", title: "Choose your logo", sub: "Five variations of the style you picked. Click one to use it and continue.", phase: "Logo" },
  wantmenu: { panel: "menuask", sub2: "want", title: "Do you want a menu board?", sub: "We can design a print or TV menu board with your logo.", phase: "Menu" },
  hasmenu:  { panel: "menuask", sub2: "has", title: "Do you already have a menu?", sub: "If you do, upload it and we will put your dishes on the board.", phase: "Menu" },
  menuupload: { panel: "menuask", sub2: "upload", title: "Upload your menu", sub: "Choose your menu file, or paste the menu as text.", phase: "Menu" },
  menusample: { panel: "menuask", sub2: "sample", title: "Pick a starting menu", sub: "Choose one to start from. You can edit every dish and price on the next screen.", phase: "Menu" },
  menu:     { panel: "menu", title: "Design your menu board", sub: "Pick a theme, layout and colours. Click any dish or price to edit it.", phase: "Menu" },
  mockups:  { panel: "mockups", title: "See it in the real world", sub: "Your logo on a signboard, menu cover, packaging and business card.", phase: "Mockups" }
};

function wizFlow() {
  const f = ["name", "haslogo", "tagline"];
  if (state.hasLogo === true) f.push("upload", "modify", "badge", "colors");
  else f.push("badge", "cuisine", "styles", "colors", "logos");
  f.push("wantmenu");
  if (state.wantMenu === true) {
    f.push("hasmenu");
    if (state.hasMenu === true) f.push("menuupload");
    else if (state.hasMenu === false) f.push("menusample");
    f.push("menu");
  }
  f.push("mockups");
  return f;
}
state.wantMenu = null;     // null = not answered yet
state.hasMenu = null;
state.menuUploaded = false;

function chooseWantMenu(v) {
  state.wantMenu = v;
  goTo(v ? "hasmenu" : "mockups", true);
}
function chooseHasMenu(v) {
  state.hasMenu = v;
  goTo(v ? "menuupload" : "menusample", true);
}
function chooseSampleMenu(key) {
  loadSampleMenu(key);
  goTo("menu", true);
}
// Called whenever a menu file or pasted text has been parsed
function menuLoaded() {
  state.menuUploaded = true;
  refreshMenuUploadBox();
  if (wizKey === "menuupload") { setWizError(""); goTo("menu", true); }
}
function refreshMenuUploadBox() {
  const has = state.menuUploaded;
  document.getElementById("maDropEmpty").classList.toggle("hidden", has);
  document.getElementById("maDropLoaded").classList.toggle("hidden", !has);
  if (has) {
    const cats = state.menu.categories || [];
    const items = cats.reduce((n, c) => n + (c.items || []).length, 0);
    document.getElementById("maLoadedInfo").textContent = items + " dishes in " + cats.length + (cats.length === 1 ? " section" : " sections");
  }
}
let wizKey = "name";

function goTo(key, force) {
  if (!force && key !== "name" && !document.getElementById("inputBrandName").value.trim()) {
    key = "name";
    setWizError("Please enter your restaurant name first.");
  } else {
    setWizError("");
  }
  wizKey = key;
  const def = STEP_DEFS[key];
  const flow = wizFlow();
  const n = flow.indexOf(key) + 1;
  const total = flow.length;

  const isQ = def.panel === "q";
  const show = (id, on) => document.getElementById(id).classList.toggle("hidden", !on);
  show("tab-logos", isQ || def.panel === "logos");
  show("tab-mylogo", def.panel === "mylogo");
  show("tab-styles", def.panel === "styles");
  show("tab-menu", def.panel === "menu");
  show("tab-menuask", def.panel === "menuask");
  show("tab-mockups", def.panel === "mockups");
  show("wiz-step-7", def.panel === "logos");
  for (let i = 1; i <= 6; i++) show("wiz-q-" + i, isQ && def.q === i);
  document.querySelectorAll(".wiz-qwrap").forEach(w => w.classList.toggle("hidden", !isQ));
  const hb = document.getElementById("wizHeaderBtns");
  hb.classList.toggle("hidden", def.panel !== "logos");
  hb.classList.toggle("flex", def.panel === "logos");
  document.getElementById("tab-logos").classList.toggle("wiz-single", isQ);

  if (def.panel === "styles") {
    document.getElementById("styTitle").textContent = def.title;
    document.getElementById("stySubtitle").textContent = def.sub;
    renderStyleCards();
  }
  if (def.panel === "mylogo") {
    document.getElementById("myTitle").textContent = def.title;
    document.getElementById("mySubtitle").textContent = def.sub;
    show("my-ask", def.sub2 === "ask");
    show("my-upload", def.sub2 === "upload");
    show("my-modify", def.sub2 === "modify");
    document.getElementById("askYes").classList.toggle("selected", state.hasLogo === true);
    document.getElementById("askNo").classList.toggle("selected", state.hasLogo === false);
    if (def.sub2 === "upload") refreshUploadBox();
    if (def.sub2 === "modify") { syncMyControls(); renderMyPreview(); }
  } else if (def.panel === "menuask") {
    document.getElementById("maTitle").textContent = def.title;
    document.getElementById("maSubtitle").textContent = def.sub;
    show("ma-want", def.sub2 === "want");
    show("ma-has", def.sub2 === "has");
    show("ma-upload", def.sub2 === "upload");
    show("ma-sample", def.sub2 === "sample");
    document.getElementById("wantYes").classList.toggle("selected", state.wantMenu === true);
    document.getElementById("wantNo").classList.toggle("selected", state.wantMenu === false);
    document.getElementById("hasMenuYes").classList.toggle("selected", state.hasMenu === true);
    document.getElementById("hasMenuNo").classList.toggle("selected", state.hasMenu === false);
    if (def.sub2 === "upload") refreshMenuUploadBox();
  } else {
    document.getElementById("wizTitle").textContent = def.title;
    document.getElementById("wizSubtitle").textContent = def.sub;
  }

  document.getElementById("wizProgLabel").textContent = "Step " + n + " of " + total;
  document.getElementById("wizProgPhase").textContent = def.phase;
  document.getElementById("wizProgSegs").innerHTML = flow.map((_, i) => `<i class="${i < n - 1 ? "done" : i === n - 1 ? "cur" : ""}"></i>`).join("");
  document.querySelectorAll(".eyebrow").forEach(e => { e.textContent = def.phase + "  \u00B7  Step " + n + " of " + total; });
  if (def.panel === "menu") { document.getElementById("menuTitle").textContent = def.title; document.getElementById("menuSub").textContent = def.sub; }
  if (def.panel === "mockups") { document.getElementById("mockTitle").textContent = def.title; document.getElementById("mockSub").textContent = def.sub; }
  const hint = document.getElementById("wizHint");
  if (hint) hint.style.display = (def.panel === "q" && def.q <= 3) ? "" : "none";
  renderLiveBrand();
  document.getElementById("wizBack").style.visibility = n === 1 ? "hidden" : "visible";
  document.getElementById("wizSkip").classList.toggle("hidden", !def.optional);
  document.getElementById("wizStepLabel").textContent = "";
  const next = document.getElementById("wizNext");
  // these steps advance by clicking their big choice buttons
  next.classList.toggle("hidden", ["haslogo", "wantmenu", "hasmenu", "menusample", "logos"].includes(key));
  next.innerHTML =
    key === "mockups" ? "Start over" :
    key === "colors" && state.hasLogo !== true ? "Create my logos &rarr;" :
    key === "modify" ? "Use this logo &rarr;" :
    key === "menu" ? "Next: see it in the real world &rarr;" : "Next &rarr;";

  placeWizardFooter(def);

  if (key === "logos") generateAllLogos();
  if (key === "menu") {
    if (state.brand.tagline) {
      state.menu.headerSubtext = state.brand.tagline;
      document.getElementById("menuHeaderSubtext").value = state.brand.tagline;
    }
    renderMenuBoard();
    syncMenuControls();
  }
  if (key === "mockups") renderMockups();

  if (isQ) {
    const first = document.querySelector("#wiz-q-" + def.q + " input, #wiz-q-" + def.q + " select");
    if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (window.lucide) lucide.createIcons();
}

// On short question screens the Back / Next buttons sit right under the input
// (easy to reach on a phone). On the big work screens they stay in the sticky bottom bar.
function placeWizardFooter(def) {
  const foot = document.getElementById("wizardFooter");
  if (!foot) return;
  let host = null;
  if (def.panel === "q") host = document.querySelector("#tab-logos .q-shell");
  else if (def.panel === "mylogo" && def.sub2 === "upload") host = document.getElementById("my-upload");
  else if (def.panel === "menuask" && def.sub2 === "upload") host = document.getElementById("ma-upload");
  if (host) {
    if (foot.parentElement !== host) host.appendChild(foot);
    foot.classList.add("inline");
  } else {
    const main = document.querySelector(".app-main");
    if (foot.previousElementSibling !== main) main.after(foot);
    foot.classList.remove("inline");
  }
}

function nextStep() {
  const k = wizKey;
  if (k === "name" && !document.getElementById("inputBrandName").value.trim()) {
    setWizError("Please enter your restaurant name first.");
    document.getElementById("inputBrandName").focus();
    return;
  }
  if (k === "upload" && !state.myLogo) {
    setWizError("Upload your logo to continue, or go back and choose No.");
    return;
  }
  if (k === "cuisine" && !state.cuisinePicked) {
    setWizError("Choose a cuisine to continue.");
    return;
  }
  if (k === "cuisine" && document.getElementById("selectCuisine").value === "other" && !state.brand.customCuisine) {
    setWizError("Type your food style to continue.");
    document.getElementById("inputCustomCuisine").focus();
    return;
  }
  if (k === "styles" && !state.selectedStyles.length) {
    setWizError("Pick at least one style to continue.");
    return;
  }
  if (k === "logos" && !(LOGO_TEMPLATES[state.selectedLogoIndex] || {}).chosen) {
    setWizError("Click a logo to choose it.");
    return;
  }
  if (k === "menuupload" && !state.menuUploaded) {
    setWizError("Upload your menu to continue, or go back and choose No.");
    return;
  }
  if (k === "modify") applyCustomLogo();
  const f = wizFlow(), i = f.indexOf(k);
  if (i === f.length - 1) { goTo("name", true); return; }
  goTo(f[i + 1]);
}
function prevStep() {
  const f = wizFlow(), i = f.indexOf(wizKey);
  goTo(f[Math.max(0, i - 1)], true);
}
function skipStep() {
  if (wizKey === "tagline") document.getElementById("inputTagline").value = "";
  if (wizKey === "badge") document.getElementById("inputEstYear").value = "";
  onBrandInputChange();
  nextStep();
}
function setWizError(msg) { const e = document.getElementById("wizError"); if (e) e.textContent = msg; }

// Older buttons call switchTab('logos' | 'menu' | 'mockups')
function switchTab(tabId) {
  if (tabId === "menu" && state.wantMenu !== true) { state.wantMenu = true; if (state.hasMenu === null) state.hasMenu = false; }
  goTo({ logos: "logos", menu: "menu", mockups: "mockups" }[tabId] || "name", true); }

// Enter key submits the current question
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && STEP_DEFS[wizKey].panel === "q" && e.target && e.target.tagName === "INPUT" && e.target.type !== "color") nextStep();
});

// ========================================================
// "DO YOU ALREADY HAVE A LOGO?"  upload + modify
// ========================================================
const MY_LOGO_DEFAULTS = {
  zoom: 100, rotate: 0, x: 0, y: 0, shape: "square",
  bgTransparent: false, bg: "#ffffff", borderW: 0, borderColor: "#1c1917",
  filter: "none", showName: false, showTagline: false, textColor: "#1c1917", removeWhite: false
};

function chooseHasLogo(v) {
  state.hasLogo = v;
  if (!v) removeCustomLogo();
  const f = wizFlow();
  goTo(f[f.indexOf("haslogo") + 1], true);
}

function refreshUploadBox() {
  const has = !!(state.myLogo && state.myLogo.dataUrl);
  document.getElementById("myDropEmpty").classList.toggle("hidden", has);
  document.getElementById("myDropLoaded").classList.toggle("hidden", !has);
  document.getElementById("myUploadMsg").textContent = "";
  if (has) document.getElementById("myThumb").innerHTML =
    `<img src="${state.myLogo.original}" alt="Your logo" style="width:100%;height:100%;object-fit:contain">`;
}

function onMyLogoFile(e) { handleLogoFile(e.target.files && e.target.files[0]); }

function handleLogoFile(file) {
  const msg = document.getElementById("myUploadMsg");
  msg.textContent = "";
  if (!file) return;
  if (!/^image\//.test(file.type)) { msg.textContent = "That file is not an image. Choose a PNG, JPG, SVG or WebP."; return; }
  if (file.size > 10 * 1024 * 1024) { msg.textContent = "That file is larger than 10 MB. Choose a smaller one."; return; }
  const fr = new FileReader();
  fr.onerror = () => { msg.textContent = "Could not read that file. Try another one."; };
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => { msg.textContent = "Could not open that image. Try another file."; };
    img.onload = () => {
      let w = img.naturalWidth || 512, h = img.naturalHeight || 512;
      const sc = Math.min(1, 1024 / Math.max(w, h));
      w = Math.max(1, Math.round(w * sc)); h = Math.max(1, Math.round(h * sc));
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      const png = c.toDataURL("image/png");
      state.myLogo = Object.assign({}, MY_LOGO_DEFAULTS, { original: png, dataUrl: png, w, h });
      setWizError("");
      refreshUploadBox();
    };
    img.src = fr.result;
  };
  fr.readAsDataURL(file);
}

(function setupLogoDrop() {
  document.addEventListener("DOMContentLoaded", () => {
    const d = document.getElementById("myDrop");
    if (!d) return;
    ["dragenter", "dragover"].forEach(ev => d.addEventListener(ev, e => { e.preventDefault(); d.style.borderColor = "#c2410c"; }));
    ["dragleave", "drop"].forEach(ev => d.addEventListener(ev, e => { e.preventDefault(); d.style.borderColor = ""; }));
    d.addEventListener("drop", e => handleLogoFile(e.dataTransfer && e.dataTransfer.files[0]));
  });
})();

// Remove near-white pixels (soft edge) from the original image
function whiteToTransparent(srcUrl, cb) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, c.width, c.height), px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const m = Math.min(px[i], px[i + 1], px[i + 2]);
      if (m >= 245) px[i + 3] = 0;
      else if (m > 205) px[i + 3] = Math.round(px[i + 3] * (245 - m) / 40);
    }
    ctx.putImageData(d, 0, 0);
    cb(c.toDataURL("image/png"));
  };
  img.src = srcUrl;
}

function syncMyControls() {
  const m = state.myLogo; if (!m) return;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.type === "checkbox" ? (el.checked = v) : (el.value = v); };
  set("myZoom", m.zoom); set("myRotate", m.rotate); set("myX", m.x); set("myY", m.y);
  set("myShape", m.shape); set("myBorderW", m.borderW); set("myBorderColor", m.borderColor);
  set("myFilter", m.filter); set("myBgColor", m.bg); set("myBgTransparent", m.bgTransparent);
  set("myRemoveWhite", m.removeWhite); set("myShowName", m.showName); set("myShowTagline", m.showTagline);
  set("myTextColor", m.textColor);
  updateMyOutputs();
}
function updateMyOutputs() {
  const m = state.myLogo; if (!m) return;
  const o = (id, t) => { const el = document.getElementById(id); if (el) el.textContent = t; };
  o("myZoomOut", m.zoom + "%"); o("myRotateOut", m.rotate + "°");
  o("myXOut", m.x); o("myYOut", m.y); o("myBorderWOut", m.borderW + " px");
}

function onMyLogoChange() {
  const m = state.myLogo; if (!m) return;
  const v = id => document.getElementById(id);
  m.zoom = +v("myZoom").value; m.rotate = +v("myRotate").value;
  m.x = +v("myX").value; m.y = +v("myY").value;
  m.shape = v("myShape").value; m.borderW = +v("myBorderW").value; m.borderColor = v("myBorderColor").value;
  m.filter = v("myFilter").value; m.bg = v("myBgColor").value; m.bgTransparent = v("myBgTransparent").checked;
  m.showName = v("myShowName").checked; m.showTagline = v("myShowTagline").checked; m.textColor = v("myTextColor").value;
  const rw = v("myRemoveWhite").checked;
  updateMyOutputs();
  if (rw !== m.removeWhite) {
    m.removeWhite = rw;
    if (rw) whiteToTransparent(m.original, url => { m.dataUrl = url; renderMyPreview(); });
    else { m.dataUrl = m.original; renderMyPreview(); }
    return;
  }
  renderMyPreview();
}

function resetMyLogo() {
  const m = state.myLogo; if (!m) return;
  Object.assign(m, MY_LOGO_DEFAULTS, { dataUrl: m.original });
  syncMyControls();
  renderMyPreview();
}

function renderMyPreview() {
  const el = document.getElementById("myPreview");
  if (el) el.innerHTML = buildCustomLogoSVG(state.brand);
}

function escXml(s) { return String(s).replace(/[&<>"]/g, c => "&#" + c.charCodeAt(0) + ";"); }   // numeric, so .toUpperCase() leaves them valid

function buildCustomLogoSVG(brand) {
  const m = state.myLogo;
  if (!m) return "";
  const hasText = m.showName || m.showTagline;
  const S = hasText ? 280 : 380;
  const cx = 250, cy = hasText ? 180 : 250;
  const x0 = cx - S / 2, y0 = cy - S / 2;
  const rx = m.shape === "circle" ? S / 2 : m.shape === "rounded" ? S * 0.14 : 0;
  const k = Math.min(S / m.w, S / m.h) * (m.zoom / 100);
  const iw = m.w * k, ih = m.h * k;
  const tx = cx + (m.x / 100) * S, ty = cy + (m.y / 100) * S;

  const filters = {
    gray: '<feColorMatrix type="saturate" values="0"/>',
    sepia: '<feColorMatrix type="matrix" values="0.393 0.769 0.189 0 0 0.349 0.686 0.168 0 0 0.272 0.534 0.131 0 0 0 0 0 1 0"/>',
    vivid: '<feColorMatrix type="saturate" values="1.7"/>',
    white: '<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>',
    black: '<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/>'
  };
  const filterDef = filters[m.filter] ? `<filter id="myLogoFx" color-interpolation-filters="sRGB">${filters[m.filter]}</filter>` : "";
  const filterAttr = filters[m.filter] ? ' filter="url(#myLogoFx)"' : "";

  let text = "";
  if (hasText) {
    const name = escXml(brand.name || "");
    const tag = escXml(brand.tagline || "");
    const nSize = Math.max(16, Math.min(32, Math.floor(430 / Math.max(1, name.length * 0.78))));
    const both = m.showName && m.showTagline;
    if (m.showName) text += `<text x="250" y="${both ? 372 : 392}" font-family="'Cinzel','Playfair Display',serif" font-size="${nSize}" font-weight="800" fill="${m.textColor}" text-anchor="middle" letter-spacing="3">${name.toUpperCase()}</text>`;
    if (m.showTagline) text += `<text x="250" y="${both ? 404 : 392}" font-family="'Montserrat',sans-serif" font-size="12" font-weight="600" fill="${m.textColor}" text-anchor="middle" letter-spacing="3" opacity="0.85">${tag.toUpperCase()}</text>`;
  }

  const border = m.borderW > 0
    ? `<rect x="${x0 + m.borderW / 2}" y="${y0 + m.borderW / 2}" width="${S - m.borderW}" height="${S - m.borderW}" rx="${Math.max(0, rx - m.borderW / 2)}" fill="none" stroke="${m.borderColor}" stroke-width="${m.borderW}"/>`
    : "";

  return `
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 500 500" class="w-full h-full">
        <defs>
          <clipPath id="myLogoClip"><rect x="${x0}" y="${y0}" width="${S}" height="${S}" rx="${rx}"/></clipPath>
          ${filterDef}
        </defs>
        ${m.bgTransparent ? "" : `<rect width="500" height="500" fill="${m.bg}" rx="14"/>`}
        <g clip-path="url(#myLogoClip)">
          <g transform="translate(${tx} ${ty}) rotate(${m.rotate})">
            <image href="${m.dataUrl}" xlink:href="${m.dataUrl}" x="${-iw / 2}" y="${-ih / 2}" width="${iw}" height="${ih}" preserveAspectRatio="xMidYMid meet"${filterAttr}/>
          </g>
        </g>
        ${border}
        ${text}
      </svg>`;
}

// Make the customised logo selectable like any other template
function applyCustomLogo() {
  if (!state.myLogo) return;
  let idx = LOGO_TEMPLATES.findIndex(t => t.type === "custom");
  if (idx === -1) {
    LOGO_TEMPLATES.push({ type: "custom", title: "Your Logo", style: "Uploaded & customised", generate: (brand) => buildCustomLogoSVG(brand) });
    idx = LOGO_TEMPLATES.length - 1;
  }
  state.selectedLogoIndex = idx;
  updateActiveBrandDisplay();
}
function removeCustomLogo() {
  const idx = LOGO_TEMPLATES.findIndex(t => t.type === "custom");
  if (idx !== -1) LOGO_TEMPLATES.splice(idx, 1);
  if (state.selectedLogoIndex >= LOGO_TEMPLATES.length || idx !== -1) state.selectedLogoIndex = 4;
}

// LOGO FILTER BY 7 TYPES
function filterLogoStyle(type) {
  state.logoFilter = type;
  const types = ['all', 'pictorial', 'lettermark', 'wordmark', 'combination', 'emblem', 'abstract', 'mascot'];
  types.forEach(t => {
    const btn = document.getElementById(`filterBtn-${t}`);
    if (btn) {
      if (t === type) {
        btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#1c1917] text-white transition shrink-0";
      } else {
        btn.className = "px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-[#f5f4ef] text-[#57534e] border border-[#e7e5e0] transition shrink-0";
      }
    }
  });

  generateAllLogos();
}

// LOGO GENERATION
function onBrandInputChange() {
  if (document.getElementById("inputBrandName").value.trim()) { state.brandTouched = true; setWizError(""); }
  state.brand.name = document.getElementById("inputBrandName").value.trim() || "Restaurant";
  state.brand.tagline = document.getElementById("inputTagline").value.trim() || "Good Food • Good Mood";
  state.brand.estYear = document.getElementById("inputEstYear").value.trim() || "EST. 2024";
  updateActiveBrandDisplay();
  generateAllLogos();
}

function onCuisineSelectChange() {
  const c = document.getElementById("selectCuisine").value;
  state.brand.cuisine = c;

  const presets = {
    veg: { icon: "leaf", color: "#16a34a", bg: "#052e16", accent: "#f0fdf4", tagline: "Crispy, Cheesy & Absolutely Delicious!" },
    indian: { icon: "flame", color: "#f59e0b", bg: "#181414", accent: "#ffffff", tagline: "Pure Authentic Indian Curries" },
    chinese: { icon: "ramen", color: "#dc2626", bg: "#1a0505", accent: "#fef2f2", tagline: "Authentic Szechuan & Wok Specialties" },
    bistro: { icon: "cutlery", color: "#d4af37", bg: "#111827", accent: "#ffffff", tagline: "Artisan Kitchen & Wine Bar" },
    italian: { icon: "wheat", color: "#e11d48", bg: "#181414", accent: "#fef08a", tagline: "Cucina Tradizionale & Pizzeria" },
    finedining: { icon: "cloche", color: "#f59e0b", bg: "#090d16", accent: "#ffffff", tagline: "Contemporary Tasting Experience" },
    cafe: { icon: "coffee", color: "#ea580c", bg: "#1c1917", accent: "#ffedd5", tagline: "Specialty Coffee & Viennoiserie" },
    burger: { icon: "burger", color: "#f59e0b", bg: "#1e1b18", accent: "#ffffff", tagline: "Craft Smash Burgers & Brews" }
  };

  if (presets[c]) {
    const p = presets[c];
    state.brand.icon = p.icon;
    state.brand.primaryColor = p.color;
    state.brand.bgColor = p.bg;
    state.brand.accentColor = p.accent;
    const tagEl = document.getElementById("inputTagline");
    if (!tagEl.value.trim()) {            // never overwrite a tagline the user typed
      state.brand.tagline = p.tagline;
      tagEl.value = p.tagline;
    }
    document.getElementById("selectIcon").value = p.icon;
    document.getElementById("inputCustomColor").value = p.color;
  }

  generateAllLogos();
}

function onIconSelectChange() {
  state.brand.icon = document.getElementById("selectIcon").value;
  generateAllLogos();
}

function setPalette(primary, bg, accent) {
  state.brand.primaryColor = primary;
  state.brand.bgColor = bg;
  state.brand.accentColor = accent;
  document.getElementById("inputCustomColor").value = primary;
  generateAllLogos();
}

function onCustomColorChange(hex) {
  state.brand.primaryColor = hex;
  generateAllLogos();
}

function applyRandomPresets() {
  const sampleNames = ["Glow with Khushi", "Royal Rasoi", "Hongkong Chinese", "L'Aura Bistro", "The Spice Route", "Urban Wok", "Golden Spoon"];
  const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
  document.getElementById("inputBrandName").value = randomName;
  state.brand.name = randomName;

  const cuisineKeys = Object.keys(ICONS);
  const randomIcon = cuisineKeys[Math.floor(Math.random() * cuisineKeys.length)];
  document.getElementById("selectIcon").value = randomIcon;
  state.brand.icon = randomIcon;

  generateAllLogos();
}

// ========================================================
// PREMIUM SHELL HELPERS: live preview, cuisine tiles, palette marker
// ========================================================
const CUISINES = [
  ["veg", "Pure veg & snacks", "leaf"],
  ["indian", "Indian curries & tandoor", "flame"],
  ["chinese", "Chinese & street food", "ramen"],
  ["bistro", "European bistro", "cutlery"],
  ["italian", "Italian & pizzeria", "wheat"],
  ["finedining", "Fine dining & steakhouse", "cloche"],
  ["cafe", "Bakery & coffee", "coffee"],
  ["burger", "Burgers & smokehouse", "burger"],
  ["other", "Other (type your own)", "chefhat"]
];
state.cuisinePicked = false;
state.brand.customCuisine = "";

// Guess a logo symbol from the food style the user typed
function iconForCustomCuisine(text) {
  const t = text.toLowerCase();
  const rules = [
    [/pizza|pasta|italian/, "pizza"],
    [/coffee|cafe|café|tea|chai|juice|shake/, "coffee"],
    [/burger|sandwich|sub|hot ?dog|fries/, "burger"],
    [/sushi|ramen|noodle|thai|japan|korea|asian|chinese|wok|momo|dim sum|vietnam/, "ramen"],
    [/bbq|barbecue|grill|tandoor|kebab|kabab|shawarma|biryani|curry|spic|mexican|taco/, "flame"],
    [/bak|cake|bread|pastr|dessert|sweet|mithai|donut|ice cream/, "wheat"],
    [/veg|salad|organic|healthy|green|farm|plant/, "leaf"],
    [/fine|steak|luxury|tasting/, "cloche"]
  ];
  for (const [re, icon] of rules) if (re.test(t)) return icon;
  return "cutlery";
}
function onCustomCuisineInput(v) {
  state.brand.customCuisine = v.trim();
  if (state.brand.customCuisine) {
    setWizError("");
    state.brand.icon = iconForCustomCuisine(state.brand.customCuisine);
    document.getElementById("selectIcon").value = state.brand.icon;
    generateAllLogos();
  }
}

// Food photo for each cuisine (Unsplash). Also used on the phone menu page header.
const CUISINE_PHOTOS = {
  veg: "photo-1601050690597-df0568f70950", indian: "photo-1585937421612-70a008356fbe", chinese: "photo-1585032226651-759b368d7246",
  bistro: "photo-1512621776951-a57141f2eefd", italian: "photo-1513104890138-7c749659a591", finedining: "photo-1414235077428-338989a2e8c0",
  cafe: "photo-1509042239860-f550ce710b93", burger: "photo-1568901346375-23c9450c58cd", other: "photo-1504674900247-0877df9cc836"
};
const unsplash = (id, w) => `https://images.unsplash.com/${id}?w=${w || 400}&q=70&auto=format&fit=crop`;

// ========================================================
// CARD CAROUSELS
//   coverflow(track)      3D: big centre card, side cards tilt back   -> the 5 logo variations
//   stackCards(track)     a pile you swipe away (phones only)         -> the 7 logo styles
//   centreFocus(track)    big centre card, neighbours peek, auto-plays -> the mockups
// All three: finger swipe / mouse drag, arrow buttons, dots, arrow keys.
// ========================================================

// Drag helper that never breaks normal clicks: it only takes over after a real sideways move,
// and swallows the click that a drag would otherwise fire.
function dragSwipe(el, onMove, onEnd) {
  let x0 = null, y0 = 0, dragging = false, pid = null;
  el.addEventListener("pointerdown", e => { if (e.button) return; x0 = e.clientX; y0 = e.clientY; dragging = false; pid = e.pointerId; });
  el.addEventListener("pointermove", e => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (!dragging) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) { dragging = true; try { el.setPointerCapture(pid); } catch (_) {} }
      else if (Math.abs(dy) > 12) { x0 = null; return; }
      else return;
    }
    onMove(dx);
  });
  const end = e => {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (dragging) { el._dragAt = Date.now(); onEnd(e.type === "pointercancel" ? 0 : dx); }
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  el.addEventListener("click", e => { if (Date.now() - (el._dragAt || 0) < 350) { e.stopPropagation(); e.preventDefault(); } }, true);
}

// Arrow buttons + dots under a carousel. Returns { mark(i), show(on), el }.
function carouselControls(after, n, step, goTo) {
  const el = document.createElement("div");
  el.className = "cc-ctrl";
  el.innerHTML = `<button type="button" class="cc-arrow" aria-label="Previous">&#8249;</button>
    <div class="cc-dots">${Array.from({ length: n }, (_, i) => `<button type="button" aria-label="Show ${i + 1} of ${n}"></button>`).join("")}</div>
    <button type="button" class="cc-arrow" aria-label="Next">&#8250;</button>`;
  after.after(el);
  const [prev, , next] = el.children;
  prev.onclick = () => step(-1);
  next.onclick = () => step(1);
  Array.from(el.querySelectorAll(".cc-dots button")).forEach((d, i) => d.onclick = () => goTo(i));
  return {
    el,
    mark: i => el.querySelectorAll(".cc-dots button").forEach((d, k) => d.setAttribute("aria-current", k === i ? "true" : "false")),
    show: on => el.classList.toggle("hidden", !on)
  };
}
function arrowKeys(el, step) {
  el.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
    if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
  });
}

// ---------- 1. COVERFLOW (logo variations) ----------
function coverflow(track, start) {
  const cards = Array.from(track.children);
  if (!cards.length) return;
  track.classList.add("cf3d");
  let cur = Math.max(0, Math.min(cards.length - 1, start || 0));
  const lay = drag => {
    const small = window.innerWidth < 640;
    const gap = small ? 118 : 190, w = cards[0].offsetWidth;
    track.style.height = (cards[0].offsetHeight + 24) + "px";
    cards.forEach((c, k) => {
      const d = k - cur + (drag || 0) / gap, a = Math.abs(d);
      c.style.transition = drag ? "none" : "";
      c.style.transform = `translateX(calc(-50% + ${d * gap}px)) translateZ(${-a * 150}px) rotateY(${-Math.sign(d) * Math.min(a, 1) * 35}deg)`;
      c.style.zIndex = String(50 - Math.round(a * 10));
      c.style.opacity = a > 2.6 ? "0" : "1";                       // solid cards: no see-through overlaps
      c.style.filter = a < 0.5 ? "none" : `brightness(${1 - Math.min(a, 2) * 0.07}) saturate(${1 - Math.min(a, 2) * 0.2})`;
      c.classList.toggle("cf-front", Math.round(d) === 0);
      c.setAttribute("aria-hidden", Math.round(d) === 0 ? "false" : "true");
    });
    void w;
    ctl.mark(cur);
  };
  const go = i => { cur = Math.max(0, Math.min(cards.length - 1, i)); lay(); };
  const step = d => go(cur + d);
  const ctl = carouselControls(track, cards.length, step, go);
  // Clicking a side card brings it to the front instead of choosing it
  cards.forEach((c, k) => c.addEventListener("click", e => {
    if (k !== cur) { e.stopPropagation(); e.preventDefault(); go(k); }
  }, true));
  dragSwipe(track, dx => lay(dx), dx => {
    if (Math.abs(dx) <= 50) { lay(); return; }
    let k = Math.round(-dx / (window.innerWidth < 640 ? 118 : 190));
    if (!k) k = dx < 0 ? 1 : -1;
    go(cur + k);
  });
  arrowKeys(track, step);
  track._cfLay = () => lay();
  requestAnimationFrame(() => lay());
}
window.addEventListener("resize", () => document.querySelectorAll(".cf3d").forEach(t => t._cfLay && t._cfLay()));

// ---------- 2. STACKED CARDS (logo styles, phones only) ----------
const STACK_MQ = window.matchMedia("(max-width: 760px)");
function stackCards(track) {
  const s = track._stk || (track._stk = { cur: 0 });
  const cards = () => Array.from(track.children);
  const n = () => cards().length;
  const lay = drag => {
    const on = STACK_MQ.matches;
    track.classList.toggle("stk", on);
    s.ctl.show(on);
    if (!on) { track.style.height = ""; cards().forEach(c => { c.style.transform = c.style.opacity = c.style.zIndex = c.style.transition = ""; c.removeAttribute("aria-hidden"); c.tabIndex = 0; }); return; }
    s.cur = ((s.cur % n()) + n()) % n();
    const first = cards()[0];
    track.style.height = (first.offsetHeight + 44) + "px";
    cards().forEach((c, k) => {
      const p = (k - s.cur + n()) % n();        // 0 = top of the pile
      c.style.transition = p === 0 && drag ? "none" : "";
      c.style.transform = p === 0 && drag
        ? `translateX(${drag}px) rotate(${drag / 18}deg)`
        : `translateY(${p * 13}px) scale(${1 - p * 0.055}) rotate(${p ? (p % 2 ? 2.5 : -2.5) : 0}deg)`;
      c.style.zIndex = String(40 - p);
      c.style.opacity = p > 3 ? "0" : "1";
      c.setAttribute("aria-hidden", p ? "true" : "false");
      c.tabIndex = p ? -1 : 0;
    });
    s.ctl.mark(s.cur);
  };
  const go = i => { s.cur = i; lay(); };
  const step = d => {
    if (d > 0 && STACK_MQ.matches) {
      const top = cards()[s.cur];
      top.style.transition = "transform .32s ease-in, opacity .32s ease-in";
      top.style.transform = "translateX(-130%) rotate(-16deg)";
      top.style.opacity = "0";
      setTimeout(() => go(s.cur + 1), 260);
    } else go(s.cur + d);
  };
  if (!s.ctl) {
    s.ctl = carouselControls(track, n(), d => s.step(d), i => s.go(i));
    dragSwipe(track, dx => { if (STACK_MQ.matches) lay(dx); }, dx => { if (!STACK_MQ.matches) return; if (dx < -60) s.step(1); else if (dx > 60) s.step(-1); else lay(); });
    arrowKeys(track, d => s.step(d));
    STACK_MQ.addEventListener("change", () => s.lay());
    window.addEventListener("resize", () => s.lay());
  }
  s.lay = lay; s.go = go; s.step = step;
  requestAnimationFrame(() => lay());
}

// ---------- 3. CENTRE-FOCUS SLIDER (mockups) ----------
function centreFocus(track, autoMs) {
  if (track._cfx) { requestAnimationFrame(track._cfx.lay); return; }
  const view = document.createElement("div");
  view.className = "cfx-view";
  track.before(view);
  view.appendChild(track);
  track.classList.add("cfx-track");
  const cards = Array.from(track.children);
  let cur = 0, hold = 0;
  const lay = drag => {
    const c = cards[cur];
    track.style.transition = drag ? "none" : "";
    track.style.transform = `translateX(${view.clientWidth / 2 - (c.offsetLeft + c.offsetWidth / 2) + (drag || 0)}px)`;
    cards.forEach((k, i) => { k.classList.toggle("cfx-on", i === cur); k.setAttribute("aria-hidden", i === cur ? "false" : "true"); });
    ctl.mark(cur);
  };
  const go = i => { cur = (i + cards.length) % cards.length; lay(); };
  const step = d => { hold = Date.now(); go(cur + d); };
  const ctl = carouselControls(view, cards.length, step, i => { hold = Date.now(); go(i); });
  cards.forEach((c, i) => c.addEventListener("click", e => { if (i !== cur) { e.stopPropagation(); step(i - cur); } }, true));
  dragSwipe(view, dx => { hold = Date.now(); lay(dx); }, dx => { if (dx < -50) step(1); else if (dx > 50) step(-1); else lay(); });
  arrowKeys(view, step);
  view.tabIndex = 0;
  ["pointerenter", "focusin"].forEach(ev => view.addEventListener(ev, () => { hold = Date.now() + 1e9; }));
  ["pointerleave", "focusout"].forEach(ev => view.addEventListener(ev, () => { hold = Date.now(); }));
  window.addEventListener("resize", () => lay());
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (autoMs && !reduce) setInterval(() => {
    if (!view.offsetParent || document.hidden || Date.now() - hold < 6000) return;
    go(cur + 1);
  }, autoMs);
  track._cfx = { lay: () => lay() };
  requestAnimationFrame(() => lay());
}

function buildCuisineGrid() {
  const q4 = document.getElementById("wiz-q-4");
  if (!q4 || document.getElementById("cuisineGrid")) return;
  const grid = document.createElement("div");
  grid.id = "cuisineGrid";
  grid.className = "cuisine-grid";
  grid.setAttribute("role", "radiogroup");
  grid.innerHTML = CUISINES.map(([v, label, icon]) => `
    <button type="button" class="cuisine-tile" role="radio" aria-checked="false" data-cuisine="${v}" onclick="pickCuisine('${v}')">
      <span class="cuisine-photo" style="background-image:url(${unsplash(CUISINE_PHOTOS[v], 400)})">
        <span class="cuisine-ico"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon]}</svg></span>
      </span>
      <span class="cuisine-label">${label}</span>
    </button>`).join("") + `
    <div id="customCuisineWrap" class="hidden" style="grid-column:1/-1">
      <label for="inputCustomCuisine" class="block text-xs font-bold text-[#44403c] mb-1.5">Your food style</label>
      <input type="text" id="inputCustomCuisine" maxlength="60" placeholder="e.g. South Indian tiffin, Korean BBQ, Kerala seafood"
        class="w-full bg-[#fbfaf7] border border-[#d6d3cb] focus:border-[#c2410c] focus:bg-white focus:ring-1 focus:ring-[#c2410c] text-[#1c1917] rounded-xl px-3.5 py-2 text-sm transition"
        oninput="onCustomCuisineInput(this.value)">
    </div>`;
  q4.appendChild(grid);
}
function pickCuisine(v) {
  document.getElementById("selectCuisine").value = v;
  state.cuisinePicked = true;
  onCuisineSelectChange();
  setWizError("");
  markCuisine();
  const wrap = document.getElementById("customCuisineWrap");
  if (wrap) {
    wrap.classList.toggle("hidden", v !== "other");
    if (v === "other") {
      const inp = document.getElementById("inputCustomCuisine");
      inp.focus();
      if (inp.value.trim()) onCustomCuisineInput(inp.value);
    }
  }
}
function markCuisine() {
  document.querySelectorAll("#cuisineGrid .cuisine-tile").forEach(b => {
    const on = state.cuisinePicked && b.dataset.cuisine === document.getElementById("selectCuisine").value;
    b.classList.toggle("sel", on);
    b.setAttribute("aria-checked", on ? "true" : "false");
  });
}
function markPalette() {
  document.querySelectorAll("#wiz-q-5 .flex > button").forEach(b => {
    const m = /setPalette\('(#[0-9a-fA-F]+)'/.exec(b.getAttribute("onclick") || "");
    b.classList.toggle("sel", !!m && m[1].toLowerCase() === String(state.brand.primaryColor).toLowerCase());
  });
}
function renderLiveBrand() {
  // The live preview panel was removed; only keep the selected states of the pickers in sync.
  markPalette();
  markCuisine();
}
function setupShell() {
  buildCuisineGrid();
  const last = document.querySelectorAll(".wiz-qwrap");
  if (last.length && !document.getElementById("wizHint")) {
    const p = document.createElement("p");
    p.id = "wizHint"; p.className = "wiz-hint";
    p.innerHTML = "Press <kbd>Enter</kbd> to continue";
    last[last.length - 1].after(p);
  }
}

// ========================================================
// STYLE PICKER + 5 VARIATIONS PER STYLE
// ========================================================
const BASE_LOGOS = LOGO_TEMPLATES.slice();   // the 7 core styles
state.selectedStyles = [];                   // indexes into BASE_LOGOS
state.variantSeed = 0;
const VARIANTS_PER_STYLE = 5;

const VARIANT_PALETTES = [
  { p: "#d4af37", b: "#111827", a: "#ffffff" },
  { p: "#16a34a", b: "#052e16", a: "#f0fdf4" },
  { p: "#f59e0b", b: "#181414", a: "#ffffff" },
  { p: "#dc2626", b: "#1a0505", a: "#fef2f2" },
  { p: "#c2410c", b: "#1c1917", a: "#fff7ed" },
  { p: "#0e7490", b: "#082f49", a: "#ecfeff" },
  { p: "#be185d", b: "#1f0a14", a: "#fdf2f8" },
  { p: "#a16207", b: "#f5efe6", a: "#3b2a14" }
];
const VARIANT_FONTS = {
  classic:   { display: "'Playfair Display', serif",        sans: "'Montserrat', sans-serif" },
  modern:    { display: "'Space Grotesk', sans-serif",      sans: "'Plus Jakarta Sans', sans-serif" },
  condensed: { display: "'Oswald', sans-serif",             sans: "'Inter', sans-serif" },
  elegant:   { display: "'Cormorant Garamond', serif",      sans: "'Montserrat', sans-serif" }
};
const VARIANT_NAMES = ["Signature", "Light and classic", "Modern", "Bold reverse", "Clean on white"];

function nameHash(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; }

function variantBrand(brand, v, seed) {
  const b = Object.assign({}, brand);
  let fonts = null;
  const keys = Object.keys(ICONS);
  const baseIcon = Math.max(0, keys.indexOf(brand.icon));
  const h = nameHash(brand.name);
  const pickPalette = (off) => {
    for (let t = 0; t < VARIANT_PALETTES.length; t++) {
      const pal = VARIANT_PALETTES[(h + seed * 2 + off + t) % VARIANT_PALETTES.length];
      if (pal.p !== brand.primaryColor) return pal;
    }
    return VARIANT_PALETTES[0];
  };
  const pickIcon = (off) => {
    let i = (baseIcon + off + seed) % keys.length;
    if (keys[i] === brand.icon) i = (i + 1) % keys.length;
    return keys[i];
  };
  // Every variation keeps the colours the user picked; only the type, symbol and layout of colour change.
  void pickPalette;
  if (v === 1) { b.bgColor = "#faf6ee"; b.accentColor = brand.bgColor; fonts = "classic"; b.icon = pickIcon(seed); }
  else if (v === 2) { b.icon = pickIcon(3); fonts = "modern"; }
  else if (v === 3) { b.bgColor = brand.primaryColor; b.primaryColor = brand.bgColor; b.accentColor = brand.bgColor; b.icon = pickIcon(6); fonts = "condensed"; }
  else if (v === 4) { b.bgColor = "#ffffff"; b.accentColor = brand.primaryColor; fonts = "elegant"; }
  if (seed && v === 0) fonts = Object.keys(VARIANT_FONTS)[seed % 4];
  return { brand: b, fonts };
}

function variantSVG(baseIdx, v, seed, brand) {
  const base = BASE_LOGOS[baseIdx];
  const cfg = variantBrand(brand || state.brand, v, seed === undefined ? state.variantSeed : seed);
  let svg = base.generate(cfg.brand);
  if (cfg.fonts) {
    const f = VARIANT_FONTS[cfg.fonts];
    svg = svg.replace(/font-family="([^"]*)"/g, (m, fam) => {
      if (/Great Vibes|Caveat/.test(fam)) return m;                                    // keep scripts
      if (/^'(Cinzel|Playfair Display|Volkhov|Newsreader|Cormorant)/.test(fam)) return `font-family="${f.display}"`;
      if (/^'(Montserrat|Plus Jakarta Sans|Space Grotesk|Inter|Oswald)/.test(fam)) return `font-family="${f.sans}"`;
      return m;
    });
  }
  return svg;
}

// Fixed sample brand for the 7 preset style previews (not the user's name)
const PRESET_BRAND = {
  name: "Sample Bistro",
  tagline: "Fresh & Delicious",
  estYear: "EST. 2024",
  cuisine: "veg",
  primaryColor: "#d4af37",
  bgColor: "#111827",
  accentColor: "#ffffff",
  icon: "chefhat"
};
let PRESET_SVGS = null;
function presetSVG(i) {
  if (!PRESET_SVGS) PRESET_SVGS = BASE_LOGOS.map(t => t.generate(Object.assign({}, PRESET_BRAND)));
  return PRESET_SVGS[i];
}

function renderStyleCards() {
  const grid = document.getElementById("stylesGrid");
  if (!grid) return;
  grid.innerHTML = BASE_LOGOS.map((t, i) => {
    const on = state.selectedStyles.includes(i);
    return `
      <button type="button" onclick="pickStyle(${i})" class="style-card ${on ? "selected" : ""}" aria-pressed="${on}">
        <div class="style-card-art">${presetSVG(i)}</div>
        <div><span class="style-card-title">${t.title.replace(/^\d+\.\s*/, "")}</span><span class="style-card-sub">${t.style}</span></div>
        <span class="style-card-check" aria-hidden="true">${on ? "&#10003;" : ""}</span>
      </button>`;
  }).join("");
  const n = state.selectedStyles.length;
  const c = document.getElementById("styCount");
  if (c) c.textContent = "Click a style to create " + VARIANTS_PER_STYLE + " logos with your name in it.";
  stackCards(grid);
}
// Clicking a preset style generates the logos for that style only
function pickStyle(i) {
  state.selectedStyles = [i];
  setWizError("");
  const f = wizFlow();
  goTo(f[f.indexOf("styles") + 1]);
}
function toggleStyle(i) {
  const k = state.selectedStyles.indexOf(i);
  if (k === -1) state.selectedStyles.push(i); else state.selectedStyles.splice(k, 1);
  state.selectedStyles.sort((a, b) => a - b);
  setWizError("");
  renderStyleCards();
}
function selectAllStyles(on) {
  state.selectedStyles = on ? BASE_LOGOS.map((_, i) => i) : [];
  setWizError("");
  renderStyleCards();
}

function generateAllLogos() {
  const container = document.getElementById("logosContainer");
  if (!container) return;
  container.className = "";
  if (!state.selectedStyles.length) { container.innerHTML = ""; updateActiveBrandDisplay(); return; }

  const cur = LOGO_TEMPLATES[state.selectedLogoIndex];
  const ch = cur && cur.chosen ? cur.chosen : null;

  container.innerHTML = state.selectedStyles.map(b => {
    const base = BASE_LOGOS[b];
    const cards = Array.from({ length: VARIANTS_PER_STYLE }, (_, v) => {
      const sel = ch && ch.b === b && ch.v === v && ch.seed === state.variantSeed;
      return `
        <div class="v-card ${sel ? "selected" : ""}">
          <button type="button" class="v-art" onclick="chooseVariant(${b}, ${v})" aria-label="Choose ${base.title} variation ${v + 1}">${variantSVG(b, v)}</button>
          <div class="v-row"><b>${VARIANT_NAMES[v]}</b></div>
          <div class="v-row">
            <button type="button" class="v-pick" onclick="chooseVariant(${b}, ${v})">${sel ? "Chosen" : "Choose"}</button>
            <div class="v-dl" style="flex:1">
              <button type="button" onclick="downloadVariantSVG(${b}, ${v})" title="Download SVG">SVG</button>
              <button type="button" onclick="downloadVariantPNG(${b}, ${v})" title="Download PNG">PNG</button>
            </div>
          </div>
        </div>`;
    }).join("");
    return `
      <section class="v-section">
        <div class="v-head"><h3>${base.title.replace(/^\d+\.\s*/, "")}</h3><span>${base.style}</span></div>
        <div class="v-grid">${cards}</div>
      </section>`;
  }).join("");
  // Coverflow per style; open on the chosen logo if there is one
  container.querySelectorAll(".v-grid").forEach(g => {
    const sel = Array.from(g.children).findIndex(c => c.classList.contains("selected"));
    coverflow(g, sel >= 0 ? sel : 0);
  });

  updateActiveBrandDisplay();
}

function chooseVariant(b, v) {
  const base = BASE_LOGOS[b];
  const seed = state.variantSeed;
  let idx = LOGO_TEMPLATES.findIndex(t => t.chosen);
  if (idx !== -1) LOGO_TEMPLATES.splice(idx, 1);
  LOGO_TEMPLATES.push({
    type: base.type + "_v" + (v + 1),
    title: base.title.replace(/^\d+\.\s*/, "") + ", variation " + (v + 1),
    style: base.style,
    chosen: { b, v, seed },
    generate: (brand) => variantSVG(b, v, seed, brand)
  });
  state.selectedLogoIndex = LOGO_TEMPLATES.length - 1;
  setWizError("");
  generateAllLogos();
  // Clicking a logo picks it and moves straight on, no extra "Use this logo" click
  if (wizKey === "logos") nextStep();
}

function newVariations() { state.variantSeed++; generateAllLogos(); }

function saveBlobAs(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function logoFileBase() { return state.brand.name.toLowerCase().replace(/[^a-z0-9]/g, "_"); }
function downloadVariantSVG(b, v) {
  const svg = variantSVG(b, v);
  saveBlobAs(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${logoFileBase()}_${BASE_LOGOS[b].type}_v${v + 1}.svg`);
}
function downloadVariantPNG(b, v) {
  const svg = variantSVG(b, v);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
  const img = new Image();
  img.onload = () => {
    const c = document.createElement("canvas");
    c.width = 2048; c.height = 2048;
    c.getContext("2d").drawImage(img, 0, 0, 2048, 2048);
    URL.revokeObjectURL(url);
    c.toBlob(bl => saveBlobAs(bl, `${logoFileBase()}_${BASE_LOGOS[b].type}_v${v + 1}.png`), "image/png");
  };
  img.src = url;
}

function selectLogoForMenu(index) {
  state.selectedLogoIndex = index;
  generateAllLogos();
  updateActiveBrandDisplay();
  renderMenuBoard();
  renderMockups();
}

function updateActiveBrandDisplay() {
  const nameEl = document.getElementById("activeBrandNameDisplay");
  if (nameEl) nameEl.textContent = state.brand.name;

  const miniEl = document.getElementById("activeLogoMiniPreview");
  if (miniEl && LOGO_TEMPLATES[state.selectedLogoIndex]) {
    miniEl.innerHTML = LOGO_TEMPLATES[state.selectedLogoIndex].generate(state.brand);
  }
  if (typeof renderLiveBrand === "function") renderLiveBrand();
}

function downloadLogoSVG(index) {
  const tmpl = LOGO_TEMPLATES[index];
  const svgXml = tmpl.generate(state.brand);
  const blob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.brand.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${tmpl.type}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadLogoPNG(index) {
  const tmpl = LOGO_TEMPLATES[index];
  const svgXml = tmpl.generate(state.brand);
  const svgBlob = new Blob([svgXml], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, 2048, 2048);
    URL.revokeObjectURL(url);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${state.brand.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${tmpl.type}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
}

function openMockupWithLogo(index) {
  state.selectedLogoIndex = index;
  switchTab("mockups");
}

// ========================================================
// MENU BOARD STUDIO ENGINE
// ========================================================

function loadSampleMenu(sampleKey) {
  const sample = REFERENCE_SAMPLES[sampleKey];
  if (!sample) return;

  if (!state.brandTouched) {
    state.brand.name = sample.brandName;
    state.brand.tagline = sample.tagline;
    state.brand.estYear = sample.estYear;
  }
  state.menu.template = sample.template;
  state.menu.currency = sample.currency;
  state.menu.categories = JSON.parse(JSON.stringify(sample.categories));

  if (!state.brandTouched) {
    document.getElementById("inputBrandName").value = sample.brandName;
    document.getElementById("inputTagline").value = sample.tagline;
    document.getElementById("inputEstYear").value = sample.estYear;
    document.getElementById("selectCuisine").value = sample.cuisine;
  }
  document.getElementById("menuThemeSelect").value = sample.template;
  document.getElementById("menuCurrencySelect").value = sample.currency;

  onCuisineSelectChange();
  renderMenuBoard();
  syncMenuControls();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  if (ext === "xlsx" || ext === "xls") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        parseJsonRowsIntoMenu(json);
      } catch (err) {
        alert("Excel parse error: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  } else if (ext === "csv" || ext === "txt") {
    const reader = new FileReader();
    reader.onload = (e) => parseCSVText(e.target.result);
    reader.readAsText(file);
  } else if (ext === "json") {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        state.menu.categories = parsed.categories || [{ name: "Signature Items", items: parsed }];
        renderMenuBoard();
        menuLoaded();
      } catch (err) {
        alert("JSON parse error: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}

function parseCSVText(csvContent) {
  const lines = csvContent.split("\n").map(l => l.trim()).filter(l => l);
  if (!lines.length) return;

  const header = lines[0].toLowerCase().split(",").map(c => c.trim().replace(/"/g, ""));
  let catIdx = header.findIndex(h => h.includes("cat") || h.includes("sec"));
  let nameIdx = header.findIndex(h => h.includes("name") || h.includes("dish") || h.includes("item"));
  let descIdx = header.findIndex(h => h.includes("desc") || h.includes("detail") || h.includes("ingred"));
  let priceIdx = header.findIndex(h => h.includes("price") || h.includes("cost") || h.includes("amount"));
  let dietIdx = header.findIndex(h => h.includes("diet") || h.includes("tag") || h.includes("veg"));

  if (nameIdx === -1) nameIdx = 0;

  const categoriesMap = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const cat = catIdx !== -1 && cols[catIdx] ? cols[catIdx] : "Main Specialties";
    const name = cols[nameIdx];
    if (!name) continue;
    const desc = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : "";
    const price = priceIdx !== -1 && cols[priceIdx] ? cols[priceIdx].replace(/[^0-9.]/g, "") : "";
    const diet = dietIdx !== -1 && cols[dietIdx] ? cols[dietIdx].split(";").map(s => s.trim()) : [];

    if (!categoriesMap[cat]) categoriesMap[cat] = [];
    categoriesMap[cat].push({ name, description: desc, price, dietary: diet });
  }

  state.menu.categories = Object.keys(categoriesMap).map(k => ({ name: k, items: categoriesMap[k] }));
  renderMenuBoard();
  menuLoaded();
}

function parseJsonRowsIntoMenu(rows) {
  const categoriesMap = {};
  rows.forEach(row => {
    let cat = "Chef's Specials";
    let name = "";
    let desc = "";
    let price = "";
    let dietary = [];

    Object.keys(row).forEach(key => {
      const k = key.toLowerCase();
      const val = String(row[key]).trim();
      if (k.includes("cat") || k.includes("sec")) cat = val || cat;
      else if (k.includes("name") || k.includes("dish") || k.includes("item")) name = val;
      else if (k.includes("desc") || k.includes("detail")) desc = val;
      else if (k.includes("price") || k.includes("cost")) price = val.replace(/[^0-9.]/g, "");
      else if (k.includes("diet") || k.includes("tag") || k.includes("veg")) dietary = val ? [val] : [];
    });

    if (name) {
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push({ name, description: desc, price, dietary });
    }
  });

  state.menu.categories = Object.keys(categoriesMap).map(k => ({ name: k, items: categoriesMap[k] }));
  renderMenuBoard();
  menuLoaded();
}

function setupDragAndDrop() {
  window.addEventListener("dragover", (e) => e.preventDefault(), false);
  window.addEventListener("drop", (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      document.getElementById("menuFileInput").files = e.dataTransfer.files;
      handleFileUpload({ target: { files: e.dataTransfer.files } });
    }
  }, false);
}

// RAW TEXT PARSER MODAL
function openRawTextModal() { document.getElementById("rawTextModal").classList.remove("hidden"); }
function closeRawTextModal() { document.getElementById("rawTextModal").classList.add("hidden"); }
function fillExampleRawText() {
  document.getElementById("rawMenuTextArea").value = `[Starters]
Crispy Cheese Corn Balls - Crunchy outside, cheesy inside - Rs. 160
Tandoori Mushroom Tikka - Smoky juicy full of flavor - Rs. 180
Crispy Honey Chilli Potatoes - Sweet and spicy - Rs. 150

[Main Course]
Dal Tadka - Yellow lentils with cumin garlic tadka - Rs. 59
Kadhai Paneer - Cottage cheese tossed with bell peppers - Rs. 115
Tawa Roti Butter - Fresh handmade flatbread - Rs. 10`;
}
function parseRawTextSubmit() {
  const text = document.getElementById("rawMenuTextArea").value.trim();
  if (!text) return;

  fetch("/api/parse-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success && data.menu) {
      state.menu.categories = data.menu.categories;
      renderMenuBoard();
      closeRawTextModal();
      menuLoaded();
    }
  })
  .catch(() => {
    // Local fallback parse
    const lines = text.split("\n").map(l => l.trim()).filter(l => l);
    const categories = [];
    let cur = { name: "Signature Dishes", items: [] };
    lines.forEach(line => {
      if (line.startsWith("[") && line.endsWith("]")) {
        if (cur.items.length) categories.push(cur);
        cur = { name: line.slice(1, -1), items: [] };
      } else {
        const parts = line.split(" - ");
        const name = parts[0] || "";
        const desc = parts[1] || "";
        const price = (parts[2] || "").replace(/[^0-9.]/g, "");
        if (name) cur.items.push({ name, description: desc, price });
      }
    });
    if (cur.items.length) categories.push(cur);
    state.menu.categories = categories;
    renderMenuBoard();
    closeRawTextModal();
    menuLoaded();
  });
}

// INLINE ITEM & PHOTO EDITOR MODAL
function openItemEditorModal() {
  renderEditorItemsList();
  document.getElementById("itemEditorModal").classList.remove("hidden");
}
function closeItemEditorModal() {
  document.getElementById("itemEditorModal").classList.add("hidden");
  renderMenuBoard();
}

function renderEditorItemsList() {
  const container = document.getElementById("itemsEditorList");
  container.innerHTML = "";

  state.menu.categories.forEach((cat, cIdx) => {
    const catBox = document.createElement("div");
    catBox.className = "bg-[#fbfaf7] border border-[#e7e5e0] rounded-xl p-4 space-y-3";
    
    catBox.innerHTML = `
      <div class="flex items-center justify-between border-b border-[#f0eee6] pb-2">
        <input type="text" value="${cat.name}" onchange="updateCatName(${cIdx}, this.value)" 
          class="bg-transparent font-bold text-[#1c1917] text-sm focus:outline-none border-b border-transparent focus:border-[#c2410c]">
        <div class="flex space-x-2">
          <button onclick="addItemToCat(${cIdx})" class="text-xs bg-white hover:bg-[#f5f4ef] text-[#44403c] font-semibold border border-[#d6d3cb] px-2.5 py-1 rounded-lg">
            + Add Item
          </button>
          <button onclick="deleteCategory(${cIdx})" class="text-xs text-rose-600 hover:text-rose-700 px-1 font-semibold">
            Delete Section
          </button>
        </div>
      </div>
      <div class="space-y-3">
        ${cat.items.map((item, iIdx) => `
          <div class="bg-white p-3 rounded-lg text-xs space-y-2 border border-[#e7e5e0]">
            <div class="grid grid-cols-12 gap-2 items-center">
              <input type="text" value="${item.name}" onchange="updateItemField(${cIdx}, ${iIdx}, 'name', this.value)" placeholder="Dish Name" class="col-span-4 bg-transparent font-bold text-[#1c1917] border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]">
              <input type="text" value="${item.tagline || ''}" onchange="updateItemField(${cIdx}, ${iIdx}, 'tagline', this.value)" placeholder="Tagline (e.g. Cheesy & Crispy!)" class="col-span-4 bg-transparent text-[#b45309] border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]">
              <input type="text" value="${item.price}" onchange="updateItemField(${cIdx}, ${iIdx}, 'price', this.value)" placeholder="Price" class="col-span-3 bg-transparent text-[#1c1917] font-bold border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]">
              <button onclick="deleteItem(${cIdx}, ${iIdx})" class="col-span-1 text-[#78716c] hover:text-rose-600 text-center text-sm font-bold">&times;</button>
            </div>
            <div class="grid grid-cols-12 gap-2 items-center">
              <input type="text" value="${item.photo || ''}" onchange="updateItemField(${cIdx}, ${iIdx}, 'photo', this.value)" placeholder="Photo URL (e.g. https://...)" class="col-span-6 bg-transparent text-[#78716c] border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]">
              <input type="text" value="${item.ingredients || item.description || ''}" onchange="updateItemField(${cIdx}, ${iIdx}, 'ingredients', this.value)" placeholder="Ingredients / Description" class="col-span-6 bg-transparent text-[#78716c] border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]">
            </div>
            <div class="flex items-center gap-2">
              <input type="text" value="${escXml((item.dietary || []).join(', '))}" onchange="updateItemTags(${cIdx}, ${iIdx}, this.value)" placeholder="Tags (e.g. Veg, Spicy, Gluten-Free)" class="flex-1 bg-transparent text-[#15803d] border-b border-[#e7e5e0] focus:outline-none focus:border-[#c2410c]">
              ${AI_ADDED.has(item) ? `<span class="text-[10px] font-bold text-[#15803d] bg-[#dcfce7] rounded-full px-2 py-0.5 whitespace-nowrap" title="Confidence of the tags the model added">✨ AI added: ${escXml(AI_ADDED.get(item))}</span>` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    container.appendChild(catBox);
  });
}

function updateCatName(cIdx, val) { state.menu.categories[cIdx].name = val; }
function updateItemField(cIdx, iIdx, field, val) { state.menu.categories[cIdx].items[iIdx][field] = val; }
function updateItemTags(cIdx, iIdx, val) {
  const item = state.menu.categories[cIdx].items[iIdx];
  item.dietary = val.split(",").map(s => s.trim()).filter(Boolean);
  AI_ADDED.delete(item);
}

// ML DIETARY TAGGER: a Naive Bayes model on the server (ml.py) reads each dish and
// suggests tags. It only ever adds tags a dish is missing; it never removes the owner's tags.
const AI_ADDED = new WeakMap();   // item -> "Veg 97%, Spicy 84%" (kept out of the menu data so it never gets exported)
function autoTagWithAI() {
  const btn = document.getElementById("aiTagBtn"), status = document.getElementById("aiTagStatus");
  btn.disabled = true; status.textContent = "Reading your dishes…";
  fetch("/api/ml/tag-menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ categories: state.menu.categories }) })
    .then(r => r.json())
    .then(res => {
      if (!res.success) throw new Error(res.error);
      const all = state.menu.categories.flatMap(c => c.items.flatMap(i => i.dietary || []));
      const useLong = all.filter(t => /^vegetarian$/i.test(t)).length > all.filter(t => /^veg$/i.test(t)).length;
      let dishes = 0, tags = 0;
      res.predictions.forEach(p => {
        const item = ((state.menu.categories[p.c] || {}).items || [])[p.i];
        if (!item) return;
        item.dietary = item.dietary || [];
        const have = item.dietary.join(" ").toLowerCase();
        const hasDiet = /non[\s-]?veg|\bveg|vegan|vegetarian/.test(have);
        const isNonVeg = /non[\s-]?veg/.test(have) || "Non-Veg" in p.predicted && !hasDiet;
        const added = [];
        Object.entries(p.predicted).forEach(([tag, conf]) => {
          if (tag === "Veg" || tag === "Non-Veg") {
            if (hasDiet || (tag === "Veg" && "Vegan" in p.predicted)) return;   // Vegan already implies Veg
          } else if (tag === "Vegan" && isNonVeg) return;
          else if (have.replace(/[^a-z]/g, "").includes(tag.toLowerCase().replace(/[^a-z]/g, ""))) return;
          const label = tag === "Veg" && useLong ? "Vegetarian" : tag;
          item.dietary.push(label);
          added.push(`${label} ${Math.round(conf * 100)}%`);
        });
        if (added.length) { AI_ADDED.set(item, added.join(", ")); dishes++; tags += added.length; }
      });
      status.textContent = tags ? `✨ Added ${tags} tag${tags > 1 ? "s" : ""} to ${dishes} dish${dishes > 1 ? "es" : ""}. Check them below; you can edit any tag.`
                                : "✨ Nothing to add: every dish already has the tags the model is confident about.";
      renderEditorItemsList();
    })
    .catch(e => { status.textContent = "AI tagging failed: " + e.message; })
    .finally(() => { btn.disabled = false; });
}
function addItemToCat(cIdx) {
  state.menu.categories[cIdx].items.push({ name: "New Dish", price: "100", tagline: "Fresh & Delicious", photo: "", dietary: ["Veg"] });
  renderEditorItemsList();
}
function deleteItem(cIdx, iIdx) {
  state.menu.categories[cIdx].items.splice(iIdx, 1);
  renderEditorItemsList();
}
function deleteCategory(cIdx) {
  state.menu.categories.splice(cIdx, 1);
  renderEditorItemsList();
}
function addNewCategoryPrompt() {
  const name = prompt("Enter new section name (e.g. Starters, Main Course):");
  if (name) {
    state.menu.categories.push({ name, items: [] });
    renderEditorItemsList();
  }
}

// BOARD DESIGN CONTROLS
function onMenuDesignChange() {
  state.menu.template = document.getElementById("menuThemeSelect").value;
  state.menu.currency = document.getElementById("menuCurrencySelect").value;
  state.menu.priceStyle = document.getElementById("menuPriceStyle").value;
  const photoEl = document.getElementById("menuPhotoStyle");   // optional control; missing on the page used to crash this
  if (photoEl) state.menu.photoStyle = photoEl.value;
  state.menu.showLogo = document.getElementById("toggleShowLogo").checked;
  state.menu.showVegBadges = document.getElementById("toggleVegBadges").checked;
  state.menu.showDesc = document.getElementById("toggleShowDesc").checked;
  state.menu.showDietary = document.getElementById("toggleShowDietary").checked;
  state.menu.showFooter = document.getElementById("toggleShowFooter").checked;
  state.menu.headerSubtext = document.getElementById("menuHeaderSubtext").value;

  renderMenuBoard();
  syncMenuControls();
}

// ---------- Shop address, details and location QR ----------
state.menu.shop = { address: "", phone: "", hours: "", extra: "", locQr: false, mapLink: "", coords: "" };

function onShopInfoChange() {
  const s = state.menu.shop, v = id => document.getElementById(id).value.trim();
  s.address = v("shopAddress"); s.phone = v("shopPhone"); s.hours = v("shopHours"); s.extra = v("shopExtra");
  const link = v("shopMapLink");
  if (link !== s.mapLink) { s.mapLink = link; if (link) s.coords = ""; }
  refreshLocQr();
  renderMenuBoard();
  syncMenuControls();
}
function setLocQr(on) {
  state.menu.shop.locQr = on;
  document.getElementById("locQrBox").classList.toggle("hidden", !on);
  refreshLocQr();
  renderMenuBoard();
  syncMenuControls();
}
// The link inside the location QR: the user's own Maps link, else their GPS spot, else a Maps search for the address.
function locationUrl() {
  const s = state.menu.shop;
  if (s.mapLink) return /^https?:\/\//i.test(s.mapLink) ? s.mapLink : "https://" + s.mapLink;
  if (s.coords) return "https://www.google.com/maps/search/?api=1&query=" + s.coords;
  if (s.address) return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent([state.brand.name, s.address].filter(Boolean).join(", "));
  return "";
}
const qrCache = {};
function qrDataUrl(text) {
  if (!text || !window.QRCode) return "";
  if (qrCache[text]) return qrCache[text];
  const tmp = document.createElement("div");
  new QRCode(tmp, { text, width: 256, height: 256, colorDark: "#111111", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
  const c = tmp.querySelector("canvas");
  const url = c ? c.toDataURL("image/png") : "";
  if (url) qrCache[text] = url;
  return url;
}
function refreshLocQr() {
  const box = document.getElementById("locQrCode"), msg = document.getElementById("locQrMsg");
  if (!box) return;
  const url = state.menu.shop.locQr ? locationUrl() : "";
  if (!window.QRCode) { box.innerHTML = ""; msg.textContent = "QR library not loaded. Check your internet connection."; return; }
  if (!url) {
    box.innerHTML = "";
    msg.textContent = "Type your shop address above, paste a Google Maps link, or use your current location.";
    return;
  }
  const s = state.menu.shop;
  msg.textContent = s.mapLink ? "Using your Google Maps link." : s.coords ? "Using your current location (" + s.coords + ")." : "Using your shop address. For an exact pin, paste your Google Maps link.";
  box.innerHTML = `<img src="${qrDataUrl(url)}" alt="Location QR code">`;
}
function useMyLocation() {
  const msg = document.getElementById("locQrMsg");
  if (!navigator.geolocation) { msg.textContent = "This browser cannot share location. Paste a Google Maps link instead."; return; }
  if (!window.isSecureContext) { msg.textContent = "Location only works on this computer (localhost) or over https. Paste a Google Maps link instead."; return; }
  msg.textContent = "Finding your location…";
  navigator.geolocation.getCurrentPosition(pos => {
    const s = state.menu.shop;
    s.coords = pos.coords.latitude.toFixed(6) + "," + pos.coords.longitude.toFixed(6);
    s.mapLink = ""; document.getElementById("shopMapLink").value = "";
    refreshLocQr();
    renderMenuBoard();
    syncMenuControls();
  }, err => {
    msg.textContent = err.code === 1 ? "Location permission was blocked. Allow it in the browser, or paste a Google Maps link." : "Could not get your location. Paste a Google Maps link instead.";
  }, { enableHighAccuracy: true, timeout: 15000 });
}
function testLocQr() {
  const url = locationUrl();
  if (!url) { refreshLocQr(); return; }
  window.open(url, "_blank", "noopener");
}
function downloadLocQrPNG() {
  const url = locationUrl();
  if (!url) { refreshLocQr(); return; }
  const img = new Image();
  img.onload = () => {
    const W = 600, H = 760, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
    g.fillStyle = state.brand.bgColor || "#111827"; g.fillRect(0, 0, W, 120);
    g.textAlign = "center";
    g.fillStyle = state.brand.primaryColor || "#d4af37";
    g.font = "bold 40px Georgia, serif";
    g.fillText(state.brand.name || "Our shop", W / 2, 75, W - 40);
    g.imageSmoothingEnabled = false;
    g.drawImage(img, 100, 150, 400, 400);
    g.fillStyle = "#1c1917"; g.font = "bold 34px system-ui, sans-serif";
    g.fillText("SCAN TO FIND US", W / 2, 615);
    g.fillStyle = "#78716c"; g.font = "20px system-ui, sans-serif";
    const addr = state.menu.shop.address.replace(/\s+/g, " ");
    g.fillText(addr.length > 55 ? addr.slice(0, 54) + "…" : addr, W / 2, 660, W - 40);
    if (state.menu.shop.phone) g.fillText(state.menu.shop.phone, W / 2, 695, W - 40);
    c.toBlob(b => saveBlobAs(b, `${logoFileBase() || "shop"}_location_qr.png`), "image/png");
  };
  img.src = qrDataUrl(url);
}
// Strip at the bottom of every menu design: address, phone, hours, extra details and the location QR.
function appendShopStrip() {
  const target = document.getElementById("captureBoardTarget");
  const s = state.menu.shop;
  if (!target || !state.menu.showFooter) return;
  const qr = s.locQr ? qrDataUrl(locationUrl()) : "";
  if (!s.address && !s.phone && !s.hours && !s.extra && !qr) return;
  const line = (icon, t) => t ? `<div>${icon} ${escXml(t)}</div>` : "";
  const strip = document.createElement("div");
  strip.className = "shop-strip";
  strip.innerHTML = `
    <div class="shop-lines">
      <b>${escXml(state.brand.name || "Visit us")}</b>
      ${line("📍", s.address)}${line("📞", s.phone)}${line("🕒", s.hours)}${line("ℹ️", s.extra)}
    </div>
    ${qr ? `<div class="shop-qr"><img src="${qr}" alt="Location QR code"><small>Scan to find us</small></div>` : ""}`;
  target.appendChild(strip);
}

function setOrientation(orient) {
  orient = "portrait";   // landscape removed: menus are portrait for print and phones
  state.menu.orientation = orient;
  document.getElementById("menuBoardWrapper").className = orient === "portrait"
    ? "w-full transition-all duration-300 max-w-4xl"
    : "w-full transition-all duration-300 max-w-6xl aspect-16-9";
  renderMenuBoard();
  syncMenuControls();
}

function setColumns(cols) {
  state.menu.columns = cols;
  renderMenuBoard();
  syncMenuControls();
}

// ---------- Menu studio panel: tabs, design picker, price style, zoom, download menu ----------
const MENU_TEMPLATES = [
  ["infographic", "Dish cards", "Photos and recipes", "#fff7ed", "#c2410c"],
  ["photorow", "Photo row", "Round dish photos", "#fffbeb", "#166534"],
  ["chinese", "Takeaway trifold", "Many sections", "#991b1b", "#fde68a"],
  ["editorial", "Minimal bistro", "Clean, light paper", "#fbf8f1", "#1c1917"],
  ["luxe", "Noir & gold", "Fine dining", "#111827", "#d4af37"],
  ["chalkboard", "Chalkboard", "Hand-written cafe", "#2b2f2c", "#f5f5f4"],
  ["tv", "TV display", "Wide 16:9 screen", "#0f172a", "#f59e0b"]
];
function menuTplThumb(bg, fg) {
  const bar = (l, t, w, h, o) => `<i style="left:${l}%;top:${t}px;width:${w}%;height:${h}px;background:${fg};opacity:${o}"></i>`;
  let s = bar(34, 8, 32, 6, 1);
  [22, 31, 38, 45].forEach((t, k) => { const h = k ? 2 : 3, o = k ? .35 : .7; s += bar(10, t, 35, h, o) + bar(55, t, 35, h, o); });
  return `<div class="ms-th" style="background:${bg};box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)">${s}</div>`;
}
function renderMenuTemplates() {
  const box = document.getElementById("msTemplates");
  if (!box) return;
  box.innerHTML = MENU_TEMPLATES.map(([k, n, d, bg, fg]) =>
    `<button type="button" class="ms-tpl" data-tpl="${k}" aria-pressed="false" onclick="msPickTemplate('${k}')">${menuTplThumb(bg, fg)}<b>${n}</b><small>${d}</small></button>`).join("");
}
function msPickTemplate(k) {
  document.getElementById("menuThemeSelect").value = k;
  onMenuDesignChange();
}
function msSetPrice(v) {
  document.getElementById("menuPriceStyle").value = v;
  onMenuDesignChange();
}
function syncMenuControls() {
  const m = state.menu;
  const press = (el, on) => { if (el) { el.setAttribute("aria-pressed", on ? "true" : "false"); el.classList.toggle("sel", on); } };
  if (!document.querySelector("#msTemplates .ms-tpl")) renderMenuTemplates();
  document.querySelectorAll("#msTemplates .ms-tpl").forEach(b => press(b, b.dataset.tpl === m.template));
  press(document.getElementById("btnLocQrYes"), m.shop.locQr === true);
  press(document.getElementById("btnLocQrNo"), m.shop.locQr !== true);
  const locDl = document.getElementById("msDlLocQr");
  if (locDl) locDl.classList.toggle("hidden", !(m.shop.locQr && locationUrl()));
  for (let i = 1; i <= 4; i++) press(document.getElementById("btnCol" + i), m.columns === i);
  document.querySelectorAll("[data-price]").forEach(b => press(b, b.dataset.price === m.priceStyle));
}
function msTab(btn) {
  document.querySelectorAll(".ms-tab").forEach(t => t.setAttribute("aria-selected", t === btn ? "true" : "false"));
  document.querySelectorAll(".ms-pane").forEach(p => p.classList.toggle("on", p.id === "ms-p-" + btn.dataset.p));
}
let menuZoomPct = 100;
function setMenuZoom(d) {
  menuZoomPct = d === 0 ? 100 : Math.min(150, Math.max(50, menuZoomPct + d));
  const z = document.getElementById("menuZoom");
  if (z) z.style.zoom = menuZoomPct / 100;
  const v = document.getElementById("menuZoomVal");
  if (v) v.textContent = menuZoomPct + "%";
}
function msTvDisplay() { setMenuZoom(0); toggleFullScreenBoard(); }
function msToggleDl(e) {
  if (e) e.stopPropagation();
  const m = document.getElementById("msDlMenu"), open = !m.classList.contains("open");
  m.classList.toggle("open", open);
  document.getElementById("msDlBtn").setAttribute("aria-expanded", open ? "true" : "false");
  if (open) { const first = m.querySelector("button"); if (first) first.focus(); }
}
function msCloseDl() {
  const m = document.getElementById("msDlMenu");
  if (!m || !m.classList.contains("open")) return;
  m.classList.remove("open");
  document.getElementById("msDlBtn").setAttribute("aria-expanded", "false");
}
document.addEventListener("click", e => { if (!e.target.closest || !e.target.closest(".ms-head-actions")) msCloseDl(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") msCloseDl(); });

// ========================================================
// RENDER MENU BOARD CANVAS (REFERENCE-ACCURATE TEMPLATES)
// ========================================================
function renderMenuBoard() {
  renderMenuBoardBody();
  appendShopStrip();
}
function renderMenuBoardBody() {
  const wrapper = document.getElementById("menuBoardWrapper");
  if (!wrapper) return;

  let totalItems = 0;
  state.menu.categories.forEach(c => totalItems += c.items.length);
  const countEl = document.getElementById("menuItemCount");
  if (countEl) countEl.textContent = totalItems;
  const secEl = document.getElementById("menuSectionCount");
  if (secEl) {
    const cats = state.menu.categories;
    secEl.textContent = cats.length + (cats.length === 1 ? " section" : " sections") +
      (cats.length ? " · " + cats.slice(0, 2).map(c => c.name).join(", ") + (cats.length > 2 ? "…" : "") : "");
  }

  const { template, columns, currency, priceStyle, photoStyle, showLogo, showVegBadges, showDesc, showDietary, showFooter, headerSubtext } = state.menu;
  const brand = state.brand;
  const logoMarkup = LOGO_TEMPLATES[state.selectedLogoIndex] 
    ? LOGO_TEMPLATES[state.selectedLogoIndex].generate(brand)
    : "";

  // Helper for FSSAI Veg/Non-Veg Badges
  const getVegBadgeHtml = (dietary) => {
    if (!showVegBadges) return "";
    const isNonVeg = (dietary || []).some(d => String(d).toLowerCase().includes("non-veg") || String(d).toLowerCase().includes("chicken") || String(d).toLowerCase().includes("fish") || String(d).toLowerCase().includes("egg") || String(d).toLowerCase().includes("prawn"));
    return isNonVeg ? `<span class="badge-nonveg mr-1.5" title="Non-Vegetarian"></span>` : `<span class="badge-veg mr-1.5" title="100% Vegetarian"></span>`;
  };

  // Helper for formatted price
  const formatPrice = (p) => {
    if (!p) return "";
    if (currency === "/-") return `${p}/-`;
    return `${currency}${p}`;
  };

  // ----------------------------------------------------
  // TEMPLATE 1: INFOGRAPHIC DISH CARDS (Reference Image 1: Glow with Khushi style)
  // ----------------------------------------------------
  if (template === "infographic") {
    wrapper.innerHTML = `
      <div id="captureBoardTarget" class="menu-board-container w-full infographic-bg p-6 sm:p-8 rounded-2xl shadow-2xl relative">
        
        <!-- HEADER RIBBON -->
        <div class="flex items-center justify-between pb-4 border-b-2 border-[#ebd9c3] mb-6">
          <div class="flex items-center space-x-3">
            <span class="text-3xl">✨</span>
            <div>
              <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#c2410c] uppercase font-['Montserrat'] leading-none" contenteditable="true">
                ${brand.name.toUpperCase()}
              </h1>
              <div class="inline-block bg-[#166534] text-white text-xs sm:text-sm font-extrabold px-3 py-1 rounded-full mt-2 uppercase tracking-wider" contenteditable="true">
                ${brand.tagline}
              </div>
              <p class="text-xs text-[#78350f] font-semibold mt-1" contenteditable="true">
                ${headerSubtext}
              </p>
            </div>
          </div>

          ${showLogo ? `
            <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-[#166534] p-1 bg-white shadow shrink-0 overflow-hidden">
              ${logoMarkup}
            </div>
          ` : ''}
        </div>

        <!-- 8-GRID DISH CARDS (2 or 4 Columns) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${state.menu.categories.flatMap(c => c.items).map((item, idx) => `
            <div class="infographic-card p-3 flex flex-col justify-between space-y-2 relative">
              <!-- Number Pill + Name -->
              <div>
                <div class="flex items-start space-x-2">
                  <div class="w-6 h-6 rounded-full bg-[#166534] text-white font-black text-xs flex items-center justify-center shrink-0">
                    ${item.number || idx + 1}
                  </div>
                  <div class="flex-1">
                    <h3 class="text-xs sm:text-sm font-extrabold text-[#9a3412] leading-tight flex items-center" contenteditable="true">
                      ${getVegBadgeHtml(item.dietary)}
                      <span>${item.name}</span>
                    </h3>
                    ${item.tagline ? `<p class="text-[10px] text-[#78350f] italic" contenteditable="true">${item.tagline}</p>` : ''}
                  </div>
                </div>

                <!-- Food Photo Thumbnail -->
                ${item.photo ? `
                  <div class="w-full h-28 rounded-lg overflow-hidden my-2 shadow-inner border border-[#ebd9c3]">
                    <img src="${item.photo}" alt="${item.name}" class="w-full h-full object-cover">
                  </div>
                ` : ''}

                <!-- Ingredients Pill Box -->
                ${item.ingredients ? `
                  <div class="bg-[#fef3c7] border border-[#fde68a] p-1.5 rounded-lg text-[9px] text-[#78350f] mt-1">
                    <span class="font-extrabold uppercase text-[#b45309] block">INGREDIENTS:</span>
                    <p class="leading-tight mt-0.5" contenteditable="true">${item.ingredients}</p>
                  </div>
                ` : ''}

                <!-- Method Short Steps -->
                ${item.method ? `
                  <div class="bg-[#f0fdf4] border border-[#bbf7d0] p-1.5 rounded-lg text-[9px] text-[#166534] mt-1">
                    <span class="font-extrabold uppercase text-[#15803d] block">METHOD (Short Steps):</span>
                    <p class="leading-tight mt-0.5" contenteditable="true">${item.method}</p>
                  </div>
                ` : ''}
              </div>

              <!-- Price Footer -->
              <div class="flex items-center justify-between pt-1 border-t border-[#ebd9c3] text-xs font-bold text-[#b45309]">
                <span>Price</span>
                <span class="text-sm font-black text-[#9a3412]" contenteditable="true">${formatPrice(item.price)}</span>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- FOOTER: QUICK TIPS & SAUCES (From Image 1) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t-2 border-[#ebd9c3] text-xs">
          <!-- Quick Tips -->
          <div class="bg-[#fffbeb] border border-[#fde68a] p-3 rounded-xl">
            <span class="font-bold text-[#b45309] flex items-center space-x-1 mb-1">
              <span>💡</span><span class="uppercase tracking-wider">Quick Tips</span>
            </span>
            <ul class="text-[10px] text-[#78350f] space-y-0.5 list-disc list-inside">
              <li>For extra crispiness, add a little cornflour.</li>
              <li>Serve hot with fresh green chutney.</li>
              <li>Can also be air-fried or baked for a healthier twist!</li>
            </ul>
          </div>

          <!-- Brand Signature -->
          <div class="flex flex-col items-center justify-center text-center p-2">
            <span class="text-[11px] text-[#9a3412] italic">Made with Love ♡</span>
            <div class="text-xl font-bold text-[#be185d] font-['Great_Vibes']">${brand.name}</div>
            <div class="bg-[#166534] text-white text-[9px] font-bold px-2 py-0.5 rounded-full mt-1">
              Good Food &bull; Good Mood &bull; Great You!
            </div>
          </div>

          <!-- Dipping Sauces -->
          <div class="bg-[#fff1f2] border border-[#fecdd3] p-3 rounded-xl">
            <span class="font-bold text-[#be123c] block uppercase tracking-wider text-[10px] mb-1">Perfect To Serve With</span>
            <div class="grid grid-cols-2 gap-1 text-[10px] text-[#881337] font-semibold">
              <span class="bg-white/80 px-1.5 py-0.5 rounded">🌱 Mint Chutney</span>
              <span class="bg-white/80 px-1.5 py-0.5 rounded">🌶️ Schezwan</span>
              <span class="bg-white/80 px-1.5 py-0.5 rounded">🍅 Ketchup</span>
              <span class="bg-white/80 px-1.5 py-0.5 rounded">🧄 Garlic Mayo</span>
            </div>
          </div>
        </div>

        <!-- Bottom Ribbon -->
        <div class="bg-[#be185d] text-white text-center text-xs font-bold py-1.5 rounded-b-xl mt-4 tracking-wider uppercase">
          Follow for more Easy, Tasty & Healthy Dishes
        </div>

      </div>
    `;
    return;
  }

  // ----------------------------------------------------
  // TEMPLATE 2: PHOTO-ROW MENU (Reference Image 3: Dark Main Course)
  // ----------------------------------------------------
  if (template === "photorow") {
    wrapper.innerHTML = `
      <div id="captureBoardTarget" class="menu-board-container w-full photorow-bg p-8 rounded-2xl shadow-2xl relative font-sans">
        
        <!-- HEADER -->
        <div class="text-center pb-6 border-b border-white/10 mb-6">
          ${showLogo ? `
            <div class="w-20 h-20 mx-auto mb-3 filter drop-shadow">
              ${logoMarkup}
            </div>
          ` : ''}
          <h1 class="text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-white" contenteditable="true">
            ${brand.name}
          </h1>
          <p class="text-xs text-amber-400 font-semibold tracking-widest uppercase mt-1" contenteditable="true">
            ${brand.tagline}
          </p>
        </div>

        <!-- CATEGORIES & ROWS -->
        <div class="space-y-6">
          ${state.menu.categories.map(cat => `
            <div>
              <!-- Bold Amber Category Badge -->
              <div class="inline-block bg-[#f59e0b] text-[#111] font-black text-xs sm:text-sm px-4 py-1.5 rounded-md uppercase tracking-wider mb-4 shadow">
                ${cat.name}
              </div>

              <!-- Dishes with Circular Left Thumbnails -->
              <div class="space-y-2.5">
                ${cat.items.map(item => `
                  <div class="flex items-center text-xs sm:text-sm font-bold text-slate-100 hover:text-amber-300 transition py-1">
                    
                    <!-- Circular Dish Photo Thumbnail -->
                    ${item.photo ? `
                      <div class="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/80 mr-3 shrink-0 shadow">
                        <img src="${item.photo}" alt="${item.name}" class="w-full h-full object-cover">
                      </div>
                    ` : `
                      <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mr-3 shrink-0 text-amber-400 text-xs">
                        🍛
                      </div>
                    `}

                    <!-- Veg / Non-Veg Badge -->
                    ${getVegBadgeHtml(item.dietary)}

                    <!-- Item Name -->
                    <span class="tracking-wide uppercase truncate" contenteditable="true">${item.name}</span>

                    <!-- Dotted Leader -->
                    <span class="menu-leader"></span>

                    <!-- Price -->
                    <span class="text-amber-400 font-extrabold shrink-0 pl-2 font-mono" contenteditable="true">
                      ${formatPrice(item.price)}
                    </span>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- FOOTER -->
        ${showFooter ? `
          <div class="mt-8 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            <p>* All dishes prepared fresh with pure ghee and authentic spices.</p>
          </div>
        ` : ''}

      </div>
    `;
    return;
  }

  // ----------------------------------------------------
  // TEMPLATE 3: TAKEAWAY TRIFOLD (Reference Image 5: Hongkong Chinese)
  // ----------------------------------------------------
  if (template === "chinese") {
    wrapper.innerHTML = `
      <div id="captureBoardTarget" class="menu-board-container w-full trifold-chinese-bg p-6 rounded-2xl shadow-2xl relative">
        
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          <!-- LEFT HERO COLUMN (Branding, Stacked Photos & Order Now) -->
          <div class="lg:col-span-1 bg-[#faebd7] border-2 border-[#e0cda9] p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div>
              <!-- Stacked Food Photos -->
              <div class="grid grid-cols-2 gap-2 mb-3">
                <img src="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&auto=format&fit=crop&q=80" class="w-full h-20 object-cover rounded-lg shadow">
                <img src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&auto=format&fit=crop&q=80" class="w-full h-20 object-cover rounded-lg shadow">
              </div>

              <h1 class="text-2xl font-black text-[#991b1b] font-['Volkhov'] leading-tight" contenteditable="true">
                ${brand.name}
              </h1>
              <p class="text-xs text-[#78350f] font-bold mt-1" contenteditable="true">Food Menu</p>

              <div class="mt-4 p-2 bg-[#fef2f2] border border-[#fecaca] rounded-lg text-[10px] text-[#991b1b] font-bold space-y-1">
                <div>BULK ORDER | PARTY ORDER</div>
                <div>TAKEAWAY | WEDDING | WINTER</div>
              </div>
            </div>

            <!-- Big Red Order Button & Contact -->
            <div class="space-y-3">
              <button class="w-full py-2 bg-[#991b1b] text-white font-black text-sm rounded-lg shadow-lg uppercase tracking-wider">
                ORDER NOW
              </button>

              <div class="text-[10px] text-[#78350f] text-center font-bold space-y-0.5">
                <div>SAFE HOME DELIVERY</div>
                <div class="text-[#991b1b]">CONTACT : ${escXml(state.menu.shop.phone || "+999 999 9999")}</div>
                <div>WWW.WEBSITE.ORG</div>
              </div>
            </div>
          </div>

          <!-- 3-COLUMN STRUCTURED MENU -->
          <div class="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            ${state.menu.categories.map(cat => `
              <div class="space-y-2">
                <h3 class="text-base font-extrabold text-[#991b1b] font-['Volkhov'] border-b border-[#991b1b]/30 pb-0.5" contenteditable="true">
                  ${cat.name}
                </h3>
                <div class="space-y-1 text-xs">
                  ${cat.items.map(item => `
                    <div class="flex items-baseline justify-between">
                      <span class="truncate pr-1 text-[#3d2314] flex items-center" contenteditable="true">
                        ${getVegBadgeHtml(item.dietary)}
                        <span>${item.name}</span>
                      </span>
                      <span class="menu-leader"></span>
                      <span class="font-bold text-[#991b1b] shrink-0" contenteditable="true">${formatPrice(item.price)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            `).join("")}
          </div>

        </div>

        <!-- RED BOTTOM VISIT ADDRESS BANNER -->
        <div class="mt-6 bg-[#991b1b] text-white text-center text-xs font-bold py-2 rounded-xl flex items-center justify-center space-x-2">
          <span>= VISIT US AT =</span>
          <span class="font-normal" contenteditable="true">${escXml(state.menu.shop.address || "42, Street Down Town, City, Country")}</span>
        </div>

      </div>
    `;
    return;
  }

  // ----------------------------------------------------
  // TEMPLATE 4: EDITORIAL BISTRO (Reference Image 2: Salads, Burgers, Sides)
  // ----------------------------------------------------
  if (template === "editorial") {
    wrapper.innerHTML = `
      <div id="captureBoardTarget" class="menu-board-container w-full editorial-bg p-8 sm:p-10 rounded-2xl shadow-2xl relative font-serif">
        
        <!-- Centered Header -->
        <div class="text-center pb-8 border-b border-[#e5ded5] mb-8">
          ${showLogo ? `
            <div class="w-24 h-24 mx-auto mb-3">
              ${logoMarkup}
            </div>
          ` : ''}
          <h1 class="text-3xl sm:text-4xl font-black uppercase text-[#2b2623] tracking-widest" contenteditable="true">
            ${brand.name}
          </h1>
          <p class="text-xs text-[#78716c] font-sans font-semibold tracking-wider mt-1" contenteditable="true">
            ${brand.tagline}
          </p>
        </div>

        <!-- Categories & Dishes -->
        <div class="space-y-8 max-w-2xl mx-auto">
          ${state.menu.categories.map(cat => `
            <div class="text-center space-y-4">
              <!-- Underlined Centered Category Header with icon badge -->
              <div class="flex items-center justify-center space-x-2">
                ${cat.iconBadge ? `<span class="w-7 h-7 rounded-full bg-[#f5e6d3] text-sm flex items-center justify-center">${cat.iconBadge}</span>` : ''}
                <h2 class="text-xl sm:text-2xl font-bold underline text-[#2b2623] decoration-[#2b2623]/40 decoration-1 underline-offset-4" contenteditable="true">
                  ${cat.name}
                </h2>
              </div>

              <!-- Dishes with Descriptions Below -->
              <div class="space-y-4">
                ${cat.items.map(item => `
                  <div class="text-center">
                    <div class="flex items-baseline justify-center space-x-2 text-sm sm:text-base font-bold text-[#2b2623]">
                      ${getVegBadgeHtml(item.dietary)}
                      <span class="uppercase tracking-wide" contenteditable="true">${item.name}</span>
                      <span class="font-mono text-sm text-[#57534e]" contenteditable="true">${formatPrice(item.price)}</span>
                    </div>
                    ${showDesc && item.description ? `
                      <p class="text-xs text-[#78716c] font-sans max-w-lg mx-auto mt-0.5 leading-relaxed" contenteditable="true">
                        ${item.description}
                      </p>
                    ` : ''}
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Disclaimer Footer -->
        <div class="mt-12 pt-6 border-t border-[#e5ded5] text-center text-[10px] text-[#a8a29e] font-sans">
          Consumer Advisory: Consumption of undercooked meat, poultry, eggs, or seafood may increase the risk of food-borne illnesses.
        </div>

      </div>
    `;
    return;
  }

  // ----------------------------------------------------
  // TEMPLATE 5/6/7: CLASSIC THEMES (Luxe, Chalkboard, TV)
  // ----------------------------------------------------
  let themeContainerClass = "luxe-bg text-slate-100";
  let headerTitleColor = "text-[#d4af37]";
  let catTitleColor = "text-[#d4af37] border-b border-[#d4af37]/40";
  let itemTitleColor = "text-white";
  let descColor = "text-slate-400";
  let priceColor = "text-[#d4af37]";

  if (template === "chalkboard") {
    themeContainerClass = "chalkboard-bg text-[#f5f5f5]";
    headerTitleColor = "text-[#fef08a]";
    catTitleColor = "text-[#fef08a] border-b-2 border-dashed border-[#fef08a]/60";
    itemTitleColor = "text-white";
    descColor = "text-[#d4d4d4]";
    priceColor = "text-[#fef08a]";
  } else if (template === "tv") {
    themeContainerClass = "tv-display-bg text-slate-100";
    headerTitleColor = "text-amber-400";
    catTitleColor = "text-amber-400 border-b border-amber-500/30";
    itemTitleColor = "text-white font-bold";
    descColor = "text-slate-400";
    priceColor = "text-amber-400 font-extrabold";
  }

  let colGridClass = "grid-cols-1";
  if (columns === 2) colGridClass = "grid-cols-1 md:grid-cols-2";
  if (columns === 3) colGridClass = "grid-cols-1 md:grid-cols-3";
  if (columns === 4) colGridClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";

  wrapper.innerHTML = `
    <div id="captureBoardTarget" class="menu-board-container w-full ${themeContainerClass} p-8 rounded-2xl shadow-2xl relative">
      <header class="flex flex-col items-center justify-center text-center pb-6 border-b border-white/10 mb-8">
        ${showLogo ? `<div class="w-28 h-28 mb-3">${logoMarkup}</div>` : ''}
        <h1 class="text-3xl sm:text-4xl font-black uppercase ${headerTitleColor}" contenteditable="true">${brand.name}</h1>
        <p class="text-xs font-semibold tracking-widest uppercase mt-1 opacity-80" contenteditable="true">${brand.tagline}</p>
      </header>

      <div class="grid ${colGridClass} gap-8">
        ${state.menu.categories.map(cat => `
          <section class="space-y-4">
            <h2 class="text-lg font-bold uppercase tracking-wider ${catTitleColor}" contenteditable="true">${cat.name}</h2>
            <div class="space-y-3">
              ${cat.items.map(item => `
                <div>
                  <div class="flex items-baseline justify-between text-sm font-bold ${itemTitleColor}">
                    <span class="truncate pr-1 flex items-center" contenteditable="true">
                      ${getVegBadgeHtml(item.dietary)}
                      <span>${item.name}</span>
                    </span>
                    <span class="menu-leader"></span>
                    <span class="${priceColor} pl-2 shrink-0 font-mono" contenteditable="true">${formatPrice(item.price)}</span>
                  </div>
                  ${showDesc && item.description ? `<p class="text-xs ${descColor} mt-0.5" contenteditable="true">${item.description}</p>` : ''}
                </div>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    </div>
  `;
}

// EXPORT FUNCTIONS
function exportMenuPNG() {
  if (!document.getElementById("captureBoardTarget")) renderMenuBoard();
  const target = document.getElementById("captureBoardTarget");
  if (!target || !window.html2canvas) {
    alert("html2canvas not loaded. Check internet access.");
    return;
  }
  const zoomBox = document.getElementById("menuZoom");
  const prevZoom = zoomBox ? zoomBox.style.zoom : "";
  if (zoomBox) zoomBox.style.zoom = 1;               // export at true size, not the on-screen zoom
  // Called from the last page the menu tab is hidden: show it off-screen while we take the picture
  const tab = document.getElementById("tab-menu");
  const wasHidden = tab.classList.contains("hidden");
  if (wasHidden) { tab.classList.remove("hidden"); tab.style.cssText = "position:absolute;left:-12000px;top:0;width:1200px"; }
  html2canvas(target, { scale: 2, useCORS: true, backgroundColor: null, logging: false }).finally(() => {
    if (zoomBox) zoomBox.style.zoom = prevZoom;
    if (wasHidden) { tab.classList.add("hidden"); tab.style.cssText = ""; }
  }).then(canvas => {
    const a = document.createElement("a");
    a.download = `${state.brand.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_menu_board.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  });
}

function printMenu() { window.print(); }

function toggleFullScreenBoard() {
  const target = document.getElementById("captureBoardTarget");
  if (!target) return;
  if (!document.fullscreenElement) {
    target.requestFullscreen ? target.requestFullscreen() : target.webkitRequestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function exportMenuCSV() {
  let csv = "Category,Item Name,Description,Price,Dietary\n";
  state.menu.categories.forEach(cat => {
    cat.items.forEach(item => {
      const diet = (item.dietary || []).join(";");
      csv += `"${cat.name}","${item.name}","${item.description || item.ingredients || ''}","${item.price}","${diet}"\n`;
    });
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.brand.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_menu.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// QR CODE ONLINE MENU
// Publishes the current menu to the local server, then shows a QR code that opens /m.html on a phone.
function openQrMenuModal() {
  const modal = document.getElementById("qrMenuModal");
  const note = document.getElementById("qrNote");
  document.getElementById("qrBrandName").textContent = state.brand.name;
  modal.classList.remove("hidden");
  if (window.lucide) lucide.createIcons();

  if (!state.menu.categories.length) {
    note.textContent = "Load or add a menu first, then open this again.";
    drawQr("");
    return;
  }
  note.textContent = "Preparing your phone menu…";
  fetch("/api/publish-menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brand: state.brand, menu: state.menu })
  })
    .then(r => r.json())
    .then(res => {
      if (!res.success) throw new Error(res.error);
      document.getElementById("qrUrlInput").value = res.url;
      drawQr(res.url);
      note.textContent = "Demo mode: this link works only for phones on the same Wi-Fi as this computer, while the app is running. For real customers, put the menu online and paste that link above.";
    })
    .catch(err => {
      note.textContent = "Could not publish the menu: " + err.message + ". Restart the server (start.bat) and try again.";
    });
}

function closeQrMenuModal() { document.getElementById("qrMenuModal").classList.add("hidden"); }

function drawQr(url) {
  const box = document.getElementById("qrCodeBox");
  box.innerHTML = "";
  if (!url) return;
  if (!window.QRCode) { box.textContent = "QR library not loaded. Check internet access."; return; }
  new QRCode(box, { text: url, width: 200, height: 200, colorDark: "#1c1917", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
}

function downloadQrPNG() {
  const qr = document.querySelector("#qrCodeBox canvas");
  if (!qr) { alert("No QR code to download yet."); return; }
  // Print-ready card: brand name, QR code, call to action
  const W = 600, H = 760, c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, W, H);
  g.fillStyle = state.brand.bgColor || "#111827"; g.fillRect(0, 0, W, 120);
  g.textAlign = "center";
  g.fillStyle = state.brand.primaryColor || "#d4af37";
  g.font = "bold 40px Georgia, serif";
  g.fillText(state.brand.name, W / 2, 75, W - 40);
  g.imageSmoothingEnabled = false;
  g.drawImage(qr, 100, 160, 400, 400);
  g.fillStyle = "#1c1917"; g.font = "bold 34px system-ui, sans-serif";
  g.fillText("SCAN FOR MENU", W / 2, 630);
  g.fillStyle = "#78716c"; g.font = "20px system-ui, sans-serif";
  g.fillText("Point your phone camera at the code", W / 2, 670);
  c.toBlob(blob => saveBlobAs(blob, `${logoFileBase()}_menu_qr.png`), "image/png");
}

// BRAND MOCKUPS
function renderMockups() {
  const tmpl = LOGO_TEMPLATES[state.selectedLogoIndex] || LOGO_TEMPLATES[0];
  const svgMarkup = tmpl.generate(state.brand);

  const titleEl = document.getElementById("mockupActiveLogoTitle");
  if (titleEl) titleEl.textContent = tmpl.title;

  const sf = document.getElementById("mockupStorefrontLogo");
  const lm = document.getElementById("mockupLeatherMenuLogo");
  const cp = document.getElementById("mockupCupLogo");
  const bg = document.getElementById("mockupBagLogo");
  const cd = document.getElementById("mockupCardLogo");

  if (sf) sf.innerHTML = svgMarkup;
  if (lm) lm.innerHTML = svgMarkup;
  if (cp) cp.innerHTML = svgMarkup;
  if (bg) bg.innerHTML = svgMarkup;
  if (cd) cd.innerHTML = svgMarkup;

  centreFocus(document.getElementById("mockupGrid"), 4500);
  // Download section: only show what this person actually made
  const show = (id, on) => { const e = document.getElementById(id); if (e) e.classList.toggle("hidden", !on); };
  const hasMenu = state.wantMenu === true && state.menu.categories.length > 0;
  show("dlMenuPng", hasMenu);
  show("dlMenuCsv", hasMenu);
  show("dlMenuQr", hasMenu);
  show("dlLocQr", !!(state.menu.shop && state.menu.shop.locQr && locationUrl()));
  if (window.lucide) lucide.createIcons();
}
