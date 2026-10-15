const SHOP = {
  name: "Somchai's Kitchen",
  area: "Sukhumvit 38 • MSME",
  type: "Thai street food",
};

const UNLIMITED = {
  price: "฿499 / month",
  tagline: "Grab Unlimited for MSME merchants",
  benefits: [
    "Market news that flags ingredient shocks before they hit your kitchen",
    "Group wholesale buying — pool nearby shops to bargain bulk prices",
    "Grab Supplier Delivery or hub pickup on pooled orders",
    "Bank close: link accounts, match Grab payouts, see true income",
    "AI recipes: grams per dish → buy list with no leftover food",
    "AI Cost Optimizer + live assistant for tomorrow’s demand",
  ],
};

const NEWS = [
  {
    id: "chicken",
    icon: "🐔",
    tag: "Meat Market Update",
    title: "Chicken cost has risen 12% this week",
    body: "Broiler and minced chicken prices jumped nationwide after feed costs and farm output dropped. Nearby group-buy pools can still lock yesterday’s wholesale rate until 6:00 AM.",
    action: "Plan purchases and adjust Basil Fried Rice / chicken menus accordingly.",
    tone: "up",
    change: "+12%",
  },
  {
    id: "pork",
    icon: "🐖",
    tag: "Meat Market Update",
    title: "Pork belly and minced pork +15% nationwide",
    body: "Wholesale pork is up 15%. Grab Supplier recommends shifting 20% of tomorrow’s covers to chicken or tofu specials if you cannot join the pooled order.",
    action: "Join the Sukhumvit pork pool or swap two menu specials.",
    tone: "up",
    change: "+15%",
  },
  {
    id: "basil",
    icon: "🍚",
    tag: "Business News",
    title: "Basil Fried Rice delivery orders are climbing",
    body: "Consumers are trending toward single-dish meals. Your shop’s GrabFood tickets for Basil Fried Rice are +28% vs last Thursday.",
    action: "AI suggests buying extra holy basil and garlic, not extra rice (you already have surplus).",
    tone: "down",
    change: "+28% demand",
  },
];

const PRODUCTS = [
  { id: "chicken", name: "Fresh chicken thigh", unit: "kg", retail: 89, wholesale: 73, icon: "🍗", cat: "Meat" },
  { id: "pork", name: "Minced pork", unit: "kg", retail: 145, wholesale: 123, icon: "🥓", cat: "Meat" },
  { id: "rice", name: "Jasmine rice", unit: "kg", retail: 32, wholesale: 26, icon: "🌾", cat: "Dry" },
  { id: "basil", name: "Holy basil", unit: "kg", retail: 90, wholesale: 72, icon: "🌿", cat: "Produce" },
  { id: "garlic", name: "Garlic", unit: "kg", retail: 78, wholesale: 64, icon: "🧄", cat: "Produce" },
  { id: "chili", name: "Bird’s eye chili", unit: "kg", retail: 85, wholesale: 70, icon: "🌶️", cat: "Produce" },
  { id: "oil", name: "Soybean oil", unit: "L", retail: 52, wholesale: 44, icon: "🛢️", cat: "Dry" },
  { id: "egg", name: "Eggs", unit: "pcs", retail: 5.2, wholesale: 4.4, icon: "🥚", cat: "Dairy" },
  { id: "shrimp", name: "White shrimp", unit: "kg", retail: 280, wholesale: 238, icon: "🦐", cat: "Seafood" },
  { id: "lime", name: "Limes", unit: "kg", retail: 45, wholesale: 36, icon: "🍋", cat: "Produce" },
  { id: "noodle", name: "Rice noodles", unit: "kg", retail: 48, wholesale: 39, icon: "🍜", cat: "Dry" },
  { id: "tofu", name: "Firm tofu", unit: "kg", retail: 42, wholesale: 35, icon: "⬜", cat: "Produce" },
];

const POOLS = [
  {
    id: "chicken-pool",
    title: "Sukhumvit chicken pool",
    item: "chicken",
    shops: 14,
    targetKg: 240,
    joinedKg: 186,
    cutoff: "Today 22:00",
    drop: "Grab Supplier Delivery 05:30–07:00",
    savePct: 18,
  },
  {
    id: "pork-pool",
    title: "Pork nationwide lock-in",
    item: "pork",
    shops: 22,
    targetKg: 400,
    joinedKg: 251,
    cutoff: "Today 21:00",
    drop: "Grab Supplier Delivery 06:00–08:00",
    savePct: 15,
  },
  {
    id: "produce-pool",
    title: "Morning produce run",
    item: "basil",
    shops: 9,
    targetKg: 40,
    joinedKg: 27,
    cutoff: "Tonight 20:30",
    drop: "Pickup at hub or Grab bike 07:15",
    savePct: 20,
  },
];

const MENUS_SEED = [
  {
    id: "basil-rice",
    name: "Basil Fried Rice",
    price: 79,
    forecast: 42,
    stockDays: 1,
    ingredients: [
      { productId: "chicken", qty: 0.08 },
      { productId: "rice", qty: 0.2 },
      { productId: "basil", qty: 0.012 },
      { productId: "garlic", qty: 0.008 },
      { productId: "chili", qty: 0.005 },
      { productId: "oil", qty: 0.015 },
      { productId: "egg", qty: 1 },
    ],
  },
  {
    id: "pad-thai",
    name: "Pad Thai",
    price: 89,
    forecast: 28,
    stockDays: 1,
    ingredients: [
      { productId: "noodle", qty: 0.18 },
      { productId: "shrimp", qty: 0.06 },
      { productId: "tofu", qty: 0.04 },
      { productId: "egg", qty: 1 },
      { productId: "oil", qty: 0.02 },
      { productId: "lime", qty: 0.03 },
    ],
  },
  {
    id: "tom-yum",
    name: "Tom Yum Goong",
    price: 129,
    forecast: 16,
    stockDays: 1,
    ingredients: [
      { productId: "shrimp", qty: 0.1 },
      { productId: "lime", qty: 0.04 },
      { productId: "chili", qty: 0.008 },
      { productId: "garlic", qty: 0.006 },
    ],
  },
];

const STOCK_SEED = {
  chicken: 1.2,
  pork: 0.4,
  rice: 8.5,
  basil: 0.15,
  garlic: 0.6,
  chili: 0.2,
  oil: 1.8,
  egg: 24,
  shrimp: 0.7,
  lime: 0.9,
  noodle: 2.1,
  tofu: 1.0,
};

const BANKS = [
  { id: "kbank", name: "Kasikornbank", last4: "8821", connected: true, balance: 42850 },
  { id: "scb", name: "Siam Commercial Bank", last4: "4410", connected: true, balance: 12640 },
  { id: "grabpay", name: "GrabPay Merchant Wallet", last4: "Grab", connected: true, balance: 8940 },
  { id: "bbl", name: "Bangkok Bank", last4: "—", connected: false, balance: 0 },
];

const LEDGER = {
  period: "1–15 Oct 2026",
  foodSales: 186420,
  grabFees: 18642,
  supplierSpend: 41280,
  deliverySpend: 2340,
  otherIncome: 1200,
  payoutsPending: 22150,
};
