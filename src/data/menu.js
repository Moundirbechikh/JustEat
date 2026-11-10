// Catégories (onglets du menu)
export const CATEGORIES = [
  { id: "burger", label: "Burgers" },
  { id: "side", label: "Accompagnements" },
  { id: "sauce", label: "Sauces" },
  { id: "drink", label: "Boissons" },
];

// ---------- Images ----------
// Toutes les images du dossier assets, retrouvées par leur nom (sans extension, en minuscules).
// Dans le Sheet, la colonne « image » contient ce nom (ex. « mainburger ») ou une URL https://
const IMAGES = import.meta.glob("../assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const IMAGE_BY_KEY = Object.fromEntries(
  Object.entries(IMAGES).map(([path, url]) => [
    path.split("/").pop().replace(/\.[^.]+$/, "").toLowerCase(),
    url,
  ])
);

export function resolveImage(value) {
  if (!value) return undefined;
  const v = String(value).trim();
  if (/^https?:\/\//i.test(v)) return v;
  return IMAGE_BY_KEY[v.replace(/\.[^.]+$/, "").toLowerCase()];
}

// ---------- Conversion des lignes du Sheet ----------
const toList = (v) =>
  String(v ?? "")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

const toBool = (v, fallback) => {
  if (v === "" || v === null || v === undefined) return fallback;
  return v === true || String(v).toUpperCase() === "TRUE";
};

const byOrder = (a, b) => (Number(a.order) || 999) - (Number(b.order) || 999);

// raw = { products: [...], options: [...] } tel que renvoyé par Apps Script
export function normalizeMenu(raw) {
  const options = Object.fromEntries(
    (raw?.options ?? [])
      .filter((o) => toBool(o.available, true))
      .sort(byOrder)
      .map((o) => [
        String(o.id),
        { id: String(o.id), name: o.name, price: Number(o.price) || 0 },
      ])
  );

  const products = (raw?.products ?? [])
    .slice()
    .sort(byOrder)
    .map((r) => {
      const optionIds = toList(r.options).filter((id) => options[id]);
      const variantItems = toList(r.variants);
      return {
        id: String(r.id),
        category: String(r.category).trim(),
        name: r.name,
        desc: r.description,
        price: Number(r.price) || 0,
        img: resolveImage(r.image),
        tag: r.tag || undefined,
        available: toBool(r.available, true),
        recommend: toBool(r.recommend, false),
        ...(optionIds.length ? { options: optionIds } : {}),
        ...(variantItems.length
          ? { variants: { label: r.variant_label || "Ton choix", items: variantItems } }
          : {}),
      };
    });

  return { products, options };
}

// ---------- Menu de secours ----------
// Utilisé tant que le Sheet n'a pas répondu (ou s'il est injoignable).
// Même format que les lignes du Sheet.
const BURGER_OPTIONS = "cheese|bacon|patty|spicy|noOnion";

export const FALLBACK_MENU = {
  products: [
    { id: "double-smash", category: "burger", name: "Double Smash", description: "Deux steaks écrasés, cheddar fondant, oignons caramélisés, cornichons et sauce maison.", price: 900, image: "mainburger", tag: "Le préféré de la maison", order: 1, options: BURGER_OPTIONS },
    { id: "crispy-chicken", category: "burger", name: "Crispy Chicken", description: "Poulet croustillant, cheddar, salade, tomate, oignon rouge et sauce crémeuse.", price: 800, image: "secondburger", order: 2, options: BURGER_OPTIONS },
    { id: "signature", category: "burger", name: "Signature", description: "La recette de la maison : steak smashé, fromage fondant, salade et sauce signature.", price: 950, image: "thirdburger", tag: "Nouveau", order: 3, options: BURGER_OPTIONS },
    { id: "triple-smash", category: "burger", name: "Triple Smash XXL", description: "Trois steaks smashés, triple cheddar, bacon de bœuf croustillant et sauce secrète.", price: 1200, image: "fourthburger", tag: "Gros appétit", order: 4, options: BURGER_OPTIONS },
    { id: "frites", category: "side", name: "Frites Maison Dorées", description: "Frites fraîches coupées sur place, croustillantes et fondantes.", price: 250, image: "frites", tag: "Fait maison", order: 1, recommend: true },
    { id: "nuggets", category: "side", name: "Nuggets (6 pièces)", description: "Morceaux de poulet tendre enrobés d’une panure croustillante.", price: 450, image: "nuggets", order: 2, variant_label: "Ta sauce", variants: "Algérienne|Blanche|Barbecue fumée|Cheddar fondu" },
    { id: "onion-rings", category: "side", name: "Onion Rings (8 pièces)", description: "Ronds d’oignons doux frits à la perfection.", price: 350, image: "ognions", order: 3 },
    { id: "sc1", category: "sauce", name: "Sauce Algérienne", description: "Épicée et onctueuse", price: 50, image: "sauce4", tag: "Populaire", order: 1 },
    { id: "sc2", category: "sauce", name: "Sauce Cheddar Fondu", description: "Fromage chaud fondant", price: 80, image: "sauce3", tag: "Gourmand", order: 2 },
    { id: "sc3", category: "sauce", name: "Sauce Blanche", description: "Aillée et fraîche", price: 50, image: "sauce5", order: 3 },
    { id: "sc4", category: "sauce", name: "Sauce Barbecue", description: "Fumée et sucrée", price: 50, image: "sauce2", order: 4 },
    { id: "sc5", category: "sauce", name: "Sauce Ketchup", description: "Fraîche et savoureuse", price: 40, image: "sauce1", order: 5 },
    { id: "boisson", category: "drink", name: "Boisson fraîche (33 cl)", description: "Servie bien fraîche, selon disponibilité.", price: 150, order: 1, recommend: true, variant_label: "Choisis ta boisson", variants: "Coca-Cola|Fanta|Sprite|Hamoud Boualem" },
  ],
  options: [
    { id: "cheese", name: "Fromage en plus", price: 80, order: 1 },
    { id: "bacon", name: "Bacon croustillant", price: 120, order: 2 },
    { id: "patty", name: "Steak en plus", price: 250, order: 3 },
    { id: "spicy", name: "Sauce piquante", price: 50, order: 4 },
    { id: "noOnion", name: "Sans oignon", price: 0, order: 5 },
  ],
};

// Compatibilité : les fichiers qui importent encore PRODUCTS / OPTIONS
// (ex. MiniMenu) continuent de fonctionner avec le menu de secours.
const fallback = normalizeMenu(FALLBACK_MENU);
export const PRODUCTS = fallback.products;
export const OPTIONS = fallback.options;