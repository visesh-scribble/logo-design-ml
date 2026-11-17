#!/usr/bin/env python3
"""
GourmetStudio ML - small, dependency-free machine learning for menus.

1. DietaryTagger   Multinomial Naive Bayes that reads a dish's name, description and
                   section and predicts dietary tags: Veg / Non-Veg, Vegan, Gluten-Free, Spicy.
                   Trained on a built-in labelled seed set, plus the restaurant's own
                   already-tagged dishes (so it adapts to each menu's vocabulary, e.g. "Ch." = chicken).

2. Recommender     Hybrid "Goes well with..." recommender for the phone cart.
                   - Collaborative: item-to-item co-occurrence learned from real orders.
                   - Content: TF-IDF cosine similarity of dish text (cold start, before any orders).
                   The blend shifts from content to collaborative as orders accumulate.

Run `python ml.py` to see leave-one-out accuracy of the tagger on the seed set.
"""

import math
import re
from collections import Counter, defaultdict

# --------------------------------------------------------------------------------------
# Text features
# --------------------------------------------------------------------------------------

STOPWORDS = {
    "a", "an", "and", "the", "of", "with", "on", "in", "for", "to", "or", "our", "your",
    "served", "fresh", "house", "homemade", "special", "style", "per", "pcs", "pc", "doz",
    "oz", "plate", "half", "full", "small", "large", "regular",
}


def tokenize(text):
    """Lowercase word tokens with light stemming. 'Non-Veg' becomes one token so it never reads as 'veg'."""
    t = str(text or "").lower()
    t = re.sub(r"non[\s\-.]*veg(etarian)?", " nonveg ", t)
    t = re.sub(r"\bch\.", " chicken ", t)          # common Indo-Chinese menu shorthand
    out = []
    for w in re.findall(r"[a-z]+", t):
        if len(w) > 4 and w.endswith("ies"):
            w = w[:-3] + "y"                      # patties -> patty, berries -> berry
        elif len(w) > 3 and w.endswith("s") and not w.endswith("ss"):
            w = w[:-1]
        if len(w) > 1 and w not in STOPWORDS:
            out.append(w)
    return out


def item_text(item, category=""):
    return " ".join(str(x) for x in (
        item.get("name", ""), item.get("description", ""), item.get("ingredients", ""),
        item.get("tagline", ""), category) if x)


def features(item, category=""):
    """Unigrams from all text, plus name bigrams (e.g. 'fried_rice', 'spring_roll')."""
    toks = tokenize(item_text(item, category))
    name = tokenize(item.get("name", ""))
    return toks + [a + "_" + b for a, b in zip(name, name[1:])]


# --------------------------------------------------------------------------------------
# Labels
# --------------------------------------------------------------------------------------

def canon_tags(tags):
    """Map the many spellings menus use onto the labels the model learns."""
    out = set()
    for t in tags or []:
        k = re.sub(r"[^a-z]", "", str(t).lower())
        if k.startswith("nonveg"):
            out.add("Non-Veg")
        elif k in ("veg", "vegetarian", "veggie", "v"):
            out.add("Veg")
        elif k in ("vegan", "plantbased", "vg"):
            out.update(("Vegan", "Veg"))
        elif k in ("glutenfree", "gf"):
            out.add("Gluten-Free")
        elif k in ("spicy", "hot", "chilli", "chili"):
            out.add("Spicy")
    return out


BINARY_LABELS = ("Vegan", "Gluten-Free", "Spicy")

# name ; description ; tags   (V = Veg, N = Non-Veg, VG = Vegan, GF = Gluten-Free, S = Spicy)
SEED = """
Paneer Butter Masala; cottage cheese in rich tomato butter gravy; V
Kadhai Paneer; paneer, capsicum, onion, kadhai masala; V,S
Palak Paneer; spinach puree with paneer cubes; V,GF
Paneer Tikka; tandoor grilled paneer with peppers; V,GF
Chilli Paneer; indo chinese paneer tossed with green chilli and soy; V,S
Dal Makhani; black lentils slow cooked with butter and cream; V,GF
Dal Tadka; yellow lentils tempered with cumin and garlic; V,GF
Chana Masala; chickpeas in spiced onion tomato gravy; VG,GF,S
Aloo Gobi; potato and cauliflower dry sabzi; VG,GF
Jeera Aloo; cumin potatoes; VG,GF
Mixed Veg Curry; seasonal vegetables in gravy; V,GF
Malai Kofta; paneer and potato dumplings in creamy gravy; V
Mushroom Masala; button mushrooms in spiced gravy; V,GF
Veg Biryani; basmati rice layered with vegetables and saffron; V,GF
Jeera Rice; basmati rice with cumin; VG,GF
Steamed Rice; plain basmati rice; VG,GF
Butter Naan; tandoor flatbread brushed with butter; V
Tandoori Roti; whole wheat flatbread; VG
Laccha Paratha; layered flaky wheat bread; V
Masala Dosa; rice crepe with spiced potato filling, sambar, chutney; VG,GF
Idli Sambar; steamed rice cakes with lentil stew; VG,GF
Sambar; lentil and vegetable stew with tamarind; VG,GF
Samosa; crisp pastry filled with spiced potato and peas; VG
Pav Bhaji; spiced vegetable mash with buttered buns; V,S
Pani Puri; hollow puri with spicy tamarind water; VG,S
Chole Bhature; spicy chickpeas with fried bread; V,S
Veg Manchurian; vegetable balls in manchurian sauce; V
Veg Hakka Noodles; wok tossed noodles with vegetables; V
Veg Fried Rice; wok fried rice with vegetables; V
Schezwan Veg Noodles; noodles in fiery schezwan sauce; V,S
Veg Spring Roll; crisp rolls stuffed with cabbage and carrot; V
Veg Momos; steamed dumplings with vegetable filling; V
Veg Manchow Soup; spicy soup with fried noodles; V,S
Sweet Corn Soup; creamy sweet corn soup; V
Veg Hot and Sour Soup; tangy peppery vegetable soup; V,S
Gulab Jamun; milk dumplings in rose sugar syrup; V
Rasmalai; cottage cheese discs in saffron milk; V,GF
Kulfi; traditional frozen milk dessert with pistachio; V,GF
Mango Lassi; yogurt mango drink; V,GF
Masala Chai; spiced milk tea; V,GF
Fresh Lime Soda; lime, soda, sugar and salt; VG,GF
Butter Chicken; tandoori chicken in creamy tomato makhani gravy; N,GF
Chicken Tikka; boneless chicken marinated and grilled in tandoor; N,GF
Tandoori Chicken; whole leg chicken marinated in yogurt and spices; N,GF,S
Chicken Biryani; basmati rice with spiced chicken and saffron; N,GF
Mutton Biryani; dum cooked rice with tender goat meat; N,GF
Mutton Rogan Josh; kashmiri lamb curry with red chilli; N,GF,S
Mutton Korma; lamb in rich cashew gravy; N,GF
Keema Pav; spiced minced mutton with buns; N,S
Seekh Kebab; minced lamb skewers from the tandoor; N,GF
Fish Curry; fish simmered in coconut and tamarind; N,GF,S
Fish Fry; masala coated fried fish; N,GF
Prawn Masala; prawns in spicy onion masala; N,GF,S
Egg Curry; boiled eggs in onion tomato gravy; N,GF
Egg Bhurji; spiced scrambled eggs; N,GF
Chicken 65; deep fried spicy chicken with curry leaves; N,S
Chilli Chicken; chicken tossed with green chilli and soy; N,S
Chicken Lollipop; fried chicken wings frenched; N
Chicken Manchurian; chicken balls in manchurian gravy; N
Ch. Fried Rice; wok fried rice with chicken; N
Egg Fried Rice; fried rice with scrambled egg; N
Prawn Fried Rice; fried rice with prawns; N
Mixed Fried Rice; fried rice with chicken, egg and prawn; N
Ch. Hakka Noodles; noodles with shredded chicken; N
Chicken Schezwan Noodles; noodles with chicken in hot schezwan sauce; N,S
Mixed Chow Mein; noodles with chicken, egg, prawn; N
Egg Chow Mein; noodles with egg; N
Ch. Spring Roll; crisp rolls with chicken filling; N
Chicken Momos; steamed dumplings with minced chicken; N
Chicken Hot and Sour Soup; peppery soup with chicken; N,S
Chicken Clear Soup; light broth with chicken; N
Chicken Shawarma; spit roasted chicken in pita with garlic sauce; N
Afghani Chicken; creamy mildly spiced grilled chicken; N,GF
Margherita Pizza; tomato, mozzarella, basil; V
Farmhouse Pizza; onion, capsicum, mushroom, tomato, cheese; V
Pepperoni Pizza; spicy pepperoni, mozzarella, tomato sauce; N,S
Prosciutto Pizza; prosciutto ham, arugula, parmesan; N
Penne Arrabbiata; penne in spicy tomato garlic chilli sauce; VG,S
Fettuccine Alfredo; pasta in creamy parmesan sauce; V
Pesto Pasta; basil pesto, pine nuts, parmesan; V
Spaghetti Bolognese; slow cooked beef ragu; N
Chicken Alfredo; fettuccine, grilled chicken, cream sauce; N
Mushroom Risotto; arborio rice, porcini, parmesan; V,GF
Seafood Risotto; prawns, calamari, clams, saffron; N,GF
Garlic Bread; toasted baguette with garlic butter; V
Bruschetta; tomato, garlic, olive oil on toasted bread; VG
Caprese Salad; tomato, mozzarella, basil, olive oil; V,GF
Greek Salad; cucumber, tomato, olive, feta; V,GF
Garden Salad; mixed greens with vinaigrette; VG,GF
Quinoa Salad; quinoa, roasted vegetables, lemon dressing; VG,GF
Buddha Bowl; brown rice, chickpeas, avocado, tahini; VG,GF
Hummus and Pita; chickpea hummus with warm pita; VG
Falafel Wrap; chickpea falafel, tahini, pickles; VG
Avocado Toast; smashed avocado on sourdough; VG
Tofu Stir Fry; tofu, broccoli, soy ginger sauce; VG
Thai Green Curry Vegetables; coconut green curry with tofu; VG,GF,S
Mapo Tofu; silken tofu in chilli bean sauce with minced pork; N,S
Veggie Burger; grilled vegetable patty, lettuce, tomato; V
Plant Based Burger; beyond meat patty, vegan cheese; VG
French Fries; crispy salted potato fries; VG,GF
Loaded Nachos; tortilla chips, cheese, jalapeno, salsa; V,S
Grilled Cheese Sandwich; cheddar on toasted bread; V
Mac and Cheese; macaroni in cheddar sauce; V
Pancakes; fluffy pancakes with maple syrup; V
Belgian Waffle; waffle with berries and cream; V
Butter Croissant; flaky french pastry; V
Chocolate Brownie; fudgy chocolate brownie with walnuts; V
New York Cheesecake; baked cream cheese cake; V
Tiramisu; espresso soaked ladyfingers, mascarpone, cocoa; V
Vanilla Ice Cream; two scoops; V,GF
Mango Sorbet; dairy free mango sorbet; VG,GF
Fruit Salad; seasonal fresh fruit; VG,GF
Espresso; double shot; VG,GF
Cappuccino; espresso with steamed milk foam; V,GF
Oat Milk Latte; espresso with oat milk; VG
Iced Tea; brewed black tea with lemon; VG,GF
Chocolate Milkshake; chocolate ice cream shake; V,GF
Classic Smash Burger; smashed angus beef patty, american cheese, pickles; N
Double Cheeseburger; two beef patties, cheddar, onion, special sauce; N
Wagyu Burger; wagyu beef patty, truffle aioli, brioche bun; N
Mushroom Swiss Burger; beef patty, sauteed mushrooms, swiss cheese; N
Philly Cheesesteak; shaved steak, provolone, peppers, hoagie roll; N
Meatball Sub; beef meatballs, marinara, mozzarella; N
Hot Dog; all beef frank, mustard, relish; N
Chicken Nuggets; crispy breaded chicken bites; N
Paneer Burger; crispy paneer patty, mint mayo; V
Cheese Burst Pizza; extra mozzarella and cheddar; V
Paneer Kathi Roll; paneer tikka wrapped in paratha; V
Egg Roll; paratha roll with fried egg and onion; N
Chicken Kathi Roll; chicken tikka wrapped in paratha; N
Grilled Chicken Burger; chicken breast, lettuce, mayo; N
Bacon Cheeseburger; beef patty, bacon, cheddar; N
Nashville Hot Chicken; fried chicken in cayenne spice; N,S
Buffalo Wings; chicken wings tossed in hot sauce; N,GF,S
BBQ Pork Ribs; slow smoked ribs with barbecue glaze; N,GF
Pulled Pork Sandwich; smoked pork shoulder, slaw, bun; N
Beef Brisket; 14 hour smoked brisket; N,GF
Ribeye Steak; dry aged beef with herb butter; N,GF
Lamb Chops; grilled lamb with rosemary; N,GF
Grilled Salmon; salmon fillet, lemon butter; N,GF
Fish and Chips; beer battered cod with fries; N
Shrimp Tacos; grilled shrimp, chipotle crema, slaw; N,S
Beef Tacos; spiced beef, salsa, jalapeno; N,S
Chicken Caesar Salad; romaine, chicken, parmesan, anchovy dressing; N
Tuna Tartare; yellowfin tuna, avocado, ponzu; N,GF
Seared Scallops; scallops with cauliflower puree; N,GF
Lobster Bisque; creamy lobster soup; N
Clam Chowder; clams, potato, cream; N
Duck Confit; slow cooked duck leg; N,GF
Calamari Fritti; fried squid rings with aioli; N
Club Sandwich; chicken, ham, egg, bacon; N
Eggs Benedict; poached eggs, ham, hollandaise on muffin; N
Salmon Sushi Roll; salmon, rice, nori; N
Pad Thai Shrimp; rice noodles with shrimp and peanuts; N,GF
Tom Yum Soup; spicy sour soup with prawns and lemongrass; N,GF,S
Thai Green Curry Chicken; chicken in spicy coconut green curry; N,GF,S
Kung Pao Chicken; chicken, peanuts, dried chillies; N,S
Beef Pho; rice noodle soup with sliced beef; N,GF
Chicken Ramen; noodles in chicken broth with egg; N
"""


def _seed_examples():
    code = {"V": "Veg", "N": "Non-Veg", "VG": "Vegan", "GF": "Gluten-Free", "S": "Spicy"}
    out = []
    for line in SEED.strip().splitlines():
        name, desc, tags = [p.strip() for p in line.split(";")]
        labels = {code[t.strip()] for t in tags.split(",")}
        if "Vegan" in labels:
            labels.add("Veg")
        out.append(({"name": name, "description": desc}, "", labels, True))
    return out


# --------------------------------------------------------------------------------------
# 1. Naive Bayes dietary tagger
# --------------------------------------------------------------------------------------

class NaiveBayes:
    """Multinomial Naive Bayes with Laplace smoothing and per-example weights."""

    def __init__(self, alpha=1.0):
        self.alpha = alpha
        self.class_w = Counter()
        self.word_counts = defaultdict(Counter)
        self.total_words = Counter()
        self.vocab = set()

    def fit(self, X, y, w=None):
        for i, (toks, label) in enumerate(zip(X, y)):
            wt = w[i] if w else 1.0
            self.class_w[label] += wt
            for t in toks:
                self.word_counts[label][t] += wt
                self.total_words[label] += wt
                self.vocab.add(t)
        return self

    def predict_proba(self, toks):
        V, n = len(self.vocab) or 1, sum(self.class_w.values())
        logp = {}
        for c in self.class_w:
            lp = math.log(self.class_w[c] / n)
            denom = self.total_words[c] + self.alpha * V
            for t in toks:
                if t in self.vocab:              # unseen words carry no evidence either way
                    lp += math.log((self.word_counts[c][t] + self.alpha) / denom)
            logp[c] = lp
        m = max(logp.values())
        z = sum(math.exp(v - m) for v in logp.values())
        return {c: math.exp(v - m) / z for c, v in logp.items()}


class DietaryTagger:
    THRESHOLD = {"Veg": 0.80, "Non-Veg": 0.80, "Vegan": 0.92, "Gluten-Free": 0.85, "Spicy": 0.80}

    def __init__(self, extra_examples=()):
        examples = _seed_examples() + list(extra_examples)
        # Veg vs Non-Veg: only from items that state one or the other
        diet = [(features(it, cat), "Non-Veg" if "Non-Veg" in lab else "Veg", 1.0 if seed else 2.0)
                for it, cat, lab, seed in examples if lab & {"Veg", "Non-Veg"}]
        self.diet = NaiveBayes().fit([d[0] for d in diet], [d[1] for d in diet], [d[2] for d in diet])
        # One-vs-rest models for the other tags, from items whose owner clearly tags things
        self.binary = {}
        for label in BINARY_LABELS:
            rows = [(features(it, cat), label in lab, 1.0 if seed else 2.0)
                    for it, cat, lab, seed in examples if lab]
            self.binary[label] = NaiveBayes().fit([r[0] for r in rows], [r[1] for r in rows], [r[2] for r in rows])

    @classmethod
    def for_menu(cls, categories):
        """A tagger that also learns from the dishes this restaurant has already tagged."""
        extra = []
        for cat in categories or []:
            for it in cat.get("items", []):
                lab = canon_tags(it.get("dietary"))
                if lab:
                    extra.append((it, cat.get("name", ""), lab, False))
        return cls(extra)

    def predict(self, item, category=""):
        toks = features(item, category)
        if not toks:
            return {}
        scores = {}
        p = self.diet.predict_proba(toks)
        top = max(p, key=p.get)
        scores[top] = p[top]
        for label, model in self.binary.items():
            if label == "Vegan" and top == "Non-Veg":
                continue
            scores[label] = model.predict_proba(toks).get(True, 0.0)
        return {k: round(v, 3) for k, v in scores.items() if v >= self.THRESHOLD[k]}


def tag_menu(categories):
    """Predicted tags for every dish: [{c, i, name, predicted: {tag: confidence}}]."""
    tagger = DietaryTagger.for_menu(categories)
    out = []
    for c, cat in enumerate(categories or []):
        for i, it in enumerate(cat.get("items", [])):
            out.append({"c": c, "i": i, "name": it.get("name", ""),
                        "predicted": tagger.predict(it, cat.get("name", ""))})
    return out


# --------------------------------------------------------------------------------------
# 2. Hybrid recommender
# --------------------------------------------------------------------------------------

def _tfidf(docs):
    n = len(docs)
    df = Counter(t for d in docs for t in set(d))
    vecs = []
    for d in docs:
        tf = Counter(d)
        v = {t: (1 + math.log(c)) * math.log((n + 1) / (df[t] + 1)) + 0.0 for t, c in tf.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        vecs.append({t: x / norm for t, x in v.items()})
    return vecs


def _cos(a, b):
    if len(a) > len(b):
        a, b = b, a
    return sum(x * b.get(t, 0.0) for t, x in a.items())


def recommend(categories, cart_keys, orders, k=3):
    """
    categories: the published menu's categories.
    cart_keys:  ["c-i", ...] dishes already in the cart.
    orders:     past orders for this menu, each with "items": [{"name": ...}].
    Returns up to k [{c, i, name, price, score, reason}] not already in the cart.
    """
    items = []
    for c, cat in enumerate(categories or []):
        for i, it in enumerate(cat.get("items", [])):
            items.append({"key": f"{c}-{i}", "c": c, "i": i, "item": it, "cat": c,
                          "name": str(it.get("name", "")).strip().lower()})
    if not items:
        return []
    idx = {x["key"]: n for n, x in enumerate(items)}
    in_cart = [idx[k] for k in cart_keys if k in idx]
    if not in_cart:
        return []
    cart_set, cart_cats = set(in_cart), {items[j]["cat"] for j in in_cart}

    # Collaborative signal: how often each dish shows up alongside the cart dishes
    count, pair = Counter(), defaultdict(Counter)
    for o in orders:
        names = {str(l.get("name", "")).strip().lower() for l in o.get("items", [])}
        for a in names:
            count[a] += 1
            for b in names:
                if a != b:
                    pair[a][b] += 1
    n_orders = len(orders)
    w_collab = n_orders / (n_orders + 5.0)              # trust orders more as they pile up

    vecs = _tfidf([features(x["item"], categories[x["cat"]].get("name", "")) for x in items])

    scored = []
    for j, x in enumerate(items):
        if j in cart_set or not x["name"]:
            continue
        collab = max(pair[items[a]["name"]][x["name"]] / (count[items[a]["name"]] + 2.0) for a in in_cart)
        sim = max(_cos(vecs[a], vecs[j]) for a in in_cart)
        # "Goes well with" means complementing the cart: favour other sections over near-duplicates
        content = sim * (0.4 if x["cat"] in cart_cats else 1.0) + (0.15 if x["cat"] not in cart_cats else 0.0)
        popularity = count[x["name"]] / (n_orders + 5.0)
        score = w_collab * collab + (1 - w_collab) * content + 0.15 * popularity
        reason = ("Often ordered together" if w_collab * collab >= (1 - w_collab) * content and collab > 0
                  else "Popular here" if popularity > 0.3
                  else "Pairs well with your order")
        scored.append((score, j, reason))

    scored.sort(key=lambda s: -s[0])
    out, used_cats = [], Counter()
    for score, j, reason in scored:
        x = items[j]
        if used_cats[x["cat"]] >= 2:                     # keep suggestions varied
            continue
        used_cats[x["cat"]] += 1
        out.append({"c": x["c"], "i": x["i"], "name": x["item"].get("name", ""),
                    "price": x["item"].get("price", ""), "score": round(score, 3), "reason": reason})
        if len(out) == k:
            break
    return out


# --------------------------------------------------------------------------------------
# Evaluation: leave-one-out accuracy on the seed set
# --------------------------------------------------------------------------------------

def evaluate():
    seed = _seed_examples()
    hits, total, tp, fp, fn = 0, 0, Counter(), Counter(), Counter()
    for n in range(len(seed)):
        held_item, _, truth, _ = seed[n]
        global_seed = seed[:n] + seed[n + 1:]
        model = DietaryTagger.__new__(DietaryTagger)
        # Train on everything except the held-out dish
        diet = [(features(it), "Non-Veg" if "Non-Veg" in lab else "Veg") for it, _, lab, _ in global_seed]
        model.diet = NaiveBayes().fit([d[0] for d in diet], [d[1] for d in diet])
        model.binary = {l: NaiveBayes().fit([features(it) for it, _, _, _ in global_seed],
                                            [l in lab for _, _, lab, _ in global_seed]) for l in BINARY_LABELS}
        p = model.diet.predict_proba(features(held_item))
        guess = max(p, key=p.get)
        hits += guess == ("Non-Veg" if "Non-Veg" in truth else "Veg")
        total += 1
        pred = model.predict(held_item)
        for l in BINARY_LABELS:
            if l in pred and l in truth:
                tp[l] += 1
            elif l in pred:
                fp[l] += 1
            elif l in truth:
                fn[l] += 1
    print(f"Veg / Non-Veg accuracy (leave-one-out, {total} dishes): {hits / total:.1%}")
    for l in BINARY_LABELS:
        prec = tp[l] / (tp[l] + fp[l]) if tp[l] + fp[l] else 0.0
        rec = tp[l] / (tp[l] + fn[l]) if tp[l] + fn[l] else 0.0
        print(f"  {l:<12} precision {prec:.0%}  recall {rec:.0%}")


if __name__ == "__main__":
    evaluate()
