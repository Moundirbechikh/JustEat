import mainBurger from '../assets/MainBurger.png'
import secondBurger from '../assets/SecondBurger.png'
import thirdBurger from '../assets/ThirdBurger.png'

// Données d'exemple (prix en DA). Plus tard : onglets Produits et Options du Google Sheet.

export const CATEGORIES = [
  { id: 'burger', label: 'Burgers' },
  { id: 'side', label: 'Accompagnements' },
  { id: 'sauce', label: 'Sauces' },
  { id: 'drink', label: 'Boissons' },
]

// Suppléments cochables sur un burger
export const OPTIONS = {
  cheese: { id: 'cheese', name: 'Fromage en plus', price: 80 },
  bacon: { id: 'bacon', name: 'Bacon croustillant', price: 120 },
  patty: { id: 'patty', name: 'Steak en plus', price: 250 },
  spicy: { id: 'spicy', name: 'Sauce piquante', price: 50 },
  noOnion: { id: 'noOnion', name: 'Sans oignon', price: 0 },
}

const burgerOptions = ['cheese', 'bacon', 'patty', 'spicy', 'noOnion']

// options  = suppléments au choix
// variants = choix obligatoire (la boisson, la sauce...)
// recommend = mis en avant dans « Complète ton repas »
export const PRODUCTS = [
  {
    id: 'double-smash',
    category: 'burger',
    name: 'Double Smash',
    desc: 'Deux steaks écrasés, cheddar fondant, oignons caramélisés, cornichons et sauce maison.',
    price: 900,
    img: mainBurger,
    tag: 'Le préféré de la maison',
    options: burgerOptions,
  },
  {
    id: 'crispy-chicken',
    category: 'burger',
    name: 'Crispy Chicken',
    desc: 'Poulet croustillant, cheddar, salade, tomate, oignon rouge et sauce crémeuse.',
    price: 800,
    img: secondBurger,
    options: burgerOptions,
  },
  {
    id: 'signature',
    category: 'burger',
    name: 'Signature',
    desc: 'La recette de la maison : steak smashé, fromage fondant, salade et sauce signature.',
    price: 950,
    img: thirdBurger,
    tag: 'Nouveau',
    options: burgerOptions,
  },
  {
    id: 'triple-smash',
    category: 'burger',
    name: 'Triple Smash XXL',
    desc: 'Trois steaks smashés, triple cheddar, bacon de bœuf croustillant et sauce secrète.',
    price: 1200,
    img: mainBurger,
    tag: 'Gros appétit',
    options: burgerOptions,
  },
  {
    id: 'frites',
    category: 'side',
    name: 'Frites maison dorées',
    desc: 'Coupées sur place, croustillantes à l’extérieur et fondantes à l’intérieur.',
    price: 250,
    recommend: true,
  },
  {
    id: 'nuggets',
    category: 'side',
    name: 'Nuggets (6 pièces)',
    desc: 'Poulet tendre sous une panure ultra croustillante, servis avec une sauce au choix.',
    price: 450,
    variants: { label: 'Ta sauce', items: ['Algérienne', 'Blanche', 'Barbecue fumée', 'Cheddar fondu'] },
  },
  {
    id: 'onion-rings',
    category: 'side',
    name: 'Onion rings (8 pièces)',
    desc: 'Ronds d’oignons doux frits à la perfection, croustillants et savoureux.',
    price: 350,
  },
  {
    id: 'sauce',
    category: 'sauce',
    name: 'Sauce supplémentaire',
    desc: 'Un pot de sauce en plus pour tremper tes frites et tes nuggets.',
    price: 50,
    variants: { label: 'Choisis ta sauce', items: ['Algérienne', 'Blanche', 'Cheddar fondu', 'Barbecue fumée'] },
  },
  {
    id: 'boisson',
    category: 'drink',
    name: 'Boisson fraîche (33 cl)',
    desc: 'Servie bien fraîche, selon disponibilité.',
    price: 150,
    recommend: true,
    variants: { label: 'Choisis ta boisson', items: ['Coca-Cola', 'Fanta', 'Sprite', 'Hamoud Boualem'] },
  },
]
