# GourmetStudio Pro 🍽️
### Enterprise Restaurant Multi-Logo Generator & Digital Menu Board Studio

A corporate-grade, full-stack design automation platform developed for hospitality brands, restaurant chains, bistros, and culinary enterprises.

---

## 🌟 Key Capabilities

### 1. 🎨 Multi-Logo Vector Generator
- **Instant Generation**: Enter a restaurant name (e.g. *L'Aura Bistro*, *Fire & Oak*, *Bella Roma*) and optional tagline/established year to instantly generate **12 distinct corporate-grade vector logo archetypes**:
  1. **Grand Royal Monogram**: Ornate heraldic frame, luxury serif, starry laurel wreath
  2. **Artisan Circular Seal**: Concentric woodcut circles with arched text on SVG path
  3. **Modernist Editorial**: Scandinavian minimalist framing, high whitespace, sharp geometric serifs
  4. **Rustic Bistro Wreath**: Handcrafted botanical laurel & olive branches
  5. **Smokehouse & Grill Emblem**: Robust octagonal shield with hearth flame motif
  6. **Zen Minimalist Ensō**: Open Japanese brushstroke circle with traditional red seal stamp
  7. **Urban Diner & Craft Eatery**: Bold retro diner badge with star flourishes
  8. **Coastal Maritime & Seafood**: Stylized ocean wave crest & anchor-fork
  9. **Italian Trattoria & Arch**: Roman archway frame with golden wheat sheaves
  10. **Boutique Patisserie**: Scalloped vintage medallion with delicate Parisian cursive
  11. **Art Deco Speakeasy**: 1920s Great Gatsby geometric fan & diamond gold lattice
  12. **Contemporary Bauhaus**: Bold modernist geometric primitives & stark layout
- **Vector SVG & High-Res PNG Export**:
  - Export lossless, infinitely scalable **`.svg`** vector files ready for CNC, embroidery, signage, and Adobe Illustrator.
  - Export ultra-high-resolution **2048×2048 px `.png`** files.
- **1-Click Menu Board Sync**:
  - Click **"Select for Menu"** on any logo to instantly set it as the primary brand header on all digital and print menu boards.

---

### 2. 📋 Smart Menu Board Studio
- **Multi-Format Ingestion**:
  - Drag-and-drop or upload **`.csv`**, **`.xlsx` (Excel)**, **`.json`**, or unformatted raw text.
  - Smart automatic column detection: Category, Item Name, Ingredients/Description, Price, Dietary Badges.
  - 1-click sample menus included (*Modern Bistro*, *L'Antica Trattoria*, *Artisan Cafe & Bakery*, *Craft Burgers & Smokehouse*).
- **6 Designer Menu Themes**:
  1. **Luxe Noir & Gold**: Dark velvet charcoal, metallic gold borders, refined Cinzel serifs (Fine dining).
  2. **Rustic Chalkboard Cafe**: Authentic slate blackboard, textured chalk typography, warm ambient cafe vibes.
  3. **Parisian Modern Bistro**: Crisp warm French ivory paper, deep navy/burgundy typography, clean double-line rules.
  4. **Digital TV Landscape Display (16:9 4K Signage)**: Optimized for wall-mounted TV screens behind counters or bar tops with high-contrast cards.
  5. **Botanical Farm-to-Table**: Organic sage green & parchment with delicate botanical dividers.
  6. **Vibrant Cantina & Craft Bar**: Energetic electric amber & coral accents with modern pill badges.
- **Deep Layout Controls**:
  - **Form Factors**: Portrait (Print / A4 / Delivery) or Landscape (16:9 Digital TV Display).
  - **Grid Balancing**: 1, 2, 3, or 4 columns with automatic category balancing.
  - **Price Formatting**: Dotted leaders (`... $14.00`), Pill badges, or Clean right-aligned.
  - **Multi-Currency Support**: `$`, `€`, `£`, `₹`, `¥`, `AED`, `CHF`.
  - **Dietary Icons**: Automatic recognition of 🌱 Vegan, 🌾 Gluten-Free, 🌶️ Spicy, ⭐ Chef's Special, 🥜 Nut-Free.
  - **Inline Live Text Editing**: Click directly on any dish name, price, or description in the preview to make instant adjustments.
- **Export & Production**:
  - **High-Res PNG Export** (2x retina pixel rendering via html2canvas).
  - **Clean Print / PDF Engine** with marginless `@media print` CSS optimization.
  - **16:9 Full-Screen TV Mode** for live wall display.
  - **CSV / JSON Export** for POS synchronization.

---

### 3. 🖼️ Real-World Brand Mockup Studio
Visualize your selected restaurant logo live across 4 realistic settings:
- **Exterior Architectural Signboard**: Matte acrylic backlit by simulated evening spotlights.
- **Gold-Foil Leather Menu Cover**: Debossed metallic gold on dark chestnut leather.
- **Ceramic Tableware & Paper Bag**: Takeout kraft bag with modern porcelain espresso cup.
- **Executive Business Card**: 600 GSM matte cotton cardstock.

---

### 4. 🤖 Machine Learning (`ml.py`, no extra installs)
- **AI Dietary Tagger**: In *Edit dishes & prices*, click **✨ Auto-tag with AI**. A Multinomial Naive Bayes model reads each dish's name, description and section and suggests **Veg / Non-Veg, Vegan, Gluten-Free and Spicy** tags. It trains on a built-in labelled dataset *plus the dishes you've already tagged*, so it learns your menu's shorthand (e.g. "Ch." = chicken). It only adds missing tags above a confidence threshold, never removes yours, and shows the confidence of each tag it adds.
- **"Goes well with your order" recommender**: The phone menu's cart suggests up to 3 dishes. It's a hybrid model:
  - *Collaborative*: learns which dishes are ordered together from real orders.
  - *Content-based*: TF-IDF cosine similarity on dish text, used before any orders exist (cold start).
  - The blend shifts toward the collaborative model as orders accumulate, and favours other sections (a drink or side with a burger, not a second burger).
- **Evaluate the model**: `python ml.py` prints leave-one-out accuracy, precision and recall on the training set.
- API: `POST /api/ml/tag-menu` `{categories}` and `POST /api/ml/recommend` `{slug, cart: ["c-i", ...]}`.

---

## 🚀 How to Launch

### Option 1: Quick Launch (Windows)
Double-click `Run_GourmetStudio.bat` located in the root folder, or navigate to `restaurant-studio/` and double-click `start.bat`.

### Option 2: Terminal / Command Line
```powershell
cd restaurant-studio
python server.py
```
Then open your web browser to:
```
http://localhost:8080
```

---

## 📁 Project Architecture
```
restaurant-studio/
├── server.py              # Multithreaded HTTP & REST API server
├── ml.py                  # Naive Bayes dietary tagger + hybrid dish recommender
├── start.bat              # One-click Windows runner
├── public/
│   ├── index.html         # Responsive Single Page Application UI
│   ├── app.js             # Core SVG generator, parsers & canvas engine
│   └── styles.css         # Print stylesheets, textures, animations
└── samples/
    ├── bistro_menu.csv    # Sample casual fine-dining CSV menu
    └── italian_trattoria.xlsx # Sample multi-course Italian XLSX menu
```
