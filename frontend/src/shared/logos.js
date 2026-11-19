// Logo generators, culinary icons and sample menus.
// Lifted unchanged from the original app.js so every logo and export looks exactly the same.
// Logos stay as SVG strings because the same markup is what gets downloaded as .svg / .png.

export function escXml(s) { return String(s).replace(/[&<>"]/g, c => "&#" + c.charCodeAt(0) + ";"); }   // numeric, so .toUpperCase() leaves them valid

// CULINARY VECTOR ICONS
export const ICONS = {
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
export function getInitials(name) {
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
const RAW_TEMPLATES = [
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

// Every base template receives XML-safe text, so exported SVG/PNG files stay valid for names like "Fire & Oak"
export const BASE_LOGOS = RAW_TEMPLATES.map(t => ({
  ...t,
  generate: (brand) => t.generate(Object.assign({}, brand, {
    name: escXml(brand.name || ""), tagline: escXml(brand.tagline || ""), estYear: escXml(brand.estYear || "")
  }))
}));

// ========================================================
// EMBEDDED SAMPLE MENUS (Matching User's Reference Images)
// ========================================================
export const REFERENCE_SAMPLES = {
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
