export type Category = "Ceramics" | "Glass" | "Lighting" | "Textiles" | "Scent";

export type Shape = "vase" | "bud" | "bowl" | "mug" | "carafe" | "tumbler" | "lamp" | "pendant" | "throw" | "pillow" | "candle" | "diffuser";

export interface Color {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** price in cents, so totals never suffer floating-point drift */
  price: number;
  compareAt?: number;
  colors: Color[];
  sizes?: string[];
  rating: number;
  reviews: number;
  stock: number;
  shape: Shape;
  isNew?: boolean;
  blurb: string;
  details: string[];
}

const C = {
  bone: { name: "Bone", hex: "#e9e1d3" },
  clay: { name: "Clay", hex: "#c0714f" },
  sage: { name: "Sage", hex: "#9caf88" },
  ink: { name: "Ink", hex: "#2d3142" },
  ochre: { name: "Ochre", hex: "#d4a24c" },
  mist: { name: "Mist", hex: "#a9bcc9" },
  blush: { name: "Blush", hex: "#e3b5a4" },
  moss: { name: "Moss", hex: "#5f6f52" },
  amber: { name: "Amber", hex: "#c98a3c" },
  smoke: { name: "Smoke", hex: "#8c8a87" },
  oat: { name: "Oat", hex: "#d8c7a6" },
  rust: { name: "Rust", hex: "#a4492f" },
} satisfies Record<string, Color>;

export const products: Product[] = [
  { id: "tide-vase", name: "Tide Vase", category: "Ceramics", price: 6800, colors: [C.bone, C.clay, C.ink], sizes: ["Small", "Large"], rating: 4.8, reviews: 214, stock: 12, shape: "vase", blurb: "A wheel-thrown stoneware vase with a soft, tidal shoulder.", details: ["Stoneware, satin glaze", "Small 18 cm / Large 28 cm", "Watertight; hand wash"] },
  { id: "pebble-bud-vase", name: "Pebble Bud Vase", category: "Ceramics", price: 2800, colors: [C.sage, C.blush, C.bone], rating: 4.6, reviews: 98, stock: 30, shape: "bud", isNew: true, blurb: "Small enough for a single stem, heavy enough to stay put.", details: ["Stoneware", "11 cm tall", "Sold individually"] },
  { id: "harbor-bowl", name: "Harbor Serving Bowl", category: "Ceramics", price: 5400, compareAt: 6400, colors: [C.bone, C.mist], rating: 4.7, reviews: 156, stock: 8, shape: "bowl", blurb: "A wide, shallow bowl for salads, fruit and long dinners.", details: ["Porcelain-stoneware blend", "30 cm diameter", "Dishwasher safe"] },
  { id: "dune-mug", name: "Dune Mug", category: "Ceramics", price: 2400, colors: [C.oat, C.clay, C.ink, C.sage], rating: 4.9, reviews: 532, stock: 64, shape: "mug", blurb: "A 12 oz mug with a thumb-rest handle and speckled glaze.", details: ["Speckled stoneware", "350 ml", "Microwave and dishwasher safe"] },
  { id: "still-carafe", name: "Still Carafe", category: "Glass", price: 4200, colors: [C.mist, C.smoke, C.amber], rating: 4.5, reviews: 77, stock: 20, shape: "carafe", blurb: "Mouth-blown glass with a cup that doubles as a lid.", details: ["Borosilicate glass", "1 L", "Hand wash"] },
  { id: "ripple-tumbler", name: "Ripple Tumblers, Set of 4", category: "Glass", price: 3600, colors: [C.mist, C.amber, C.sage], rating: 4.7, reviews: 301, stock: 40, shape: "tumbler", blurb: "Fluted tumblers that catch the light at every angle.", details: ["Recycled glass", "280 ml each", "Dishwasher safe"] },
  { id: "lantern-lamp", name: "Lantern Table Lamp", category: "Lighting", price: 18900, colors: [C.bone, C.ochre], rating: 4.8, reviews: 64, stock: 5, shape: "lamp", isNew: true, blurb: "A ceramic base under a pleated linen shade: warm, low, even light.", details: ["Ceramic base, linen shade", "46 cm tall", "E26 bulb, dimmer compatible"] },
  { id: "halo-pendant", name: "Halo Pendant", category: "Lighting", price: 24500, compareAt: 27500, colors: [C.ink, C.bone, C.rust], rating: 4.6, reviews: 41, stock: 3, shape: "pendant", blurb: "A spun-aluminium dome with a frosted diffuser and no glare.", details: ["Powder-coated aluminium", "38 cm diameter", "2 m adjustable cord"] },
  { id: "field-throw", name: "Field Linen Throw", category: "Textiles", price: 12800, colors: [C.oat, C.sage, C.rust], rating: 4.9, reviews: 188, stock: 15, shape: "throw", blurb: "Stonewashed European linen, soft from the first night.", details: ["100% European flax linen", "130 × 180 cm", "Machine wash cold"] },
  { id: "drift-pillow", name: "Drift Cushion Cover", category: "Textiles", price: 4600, colors: [C.oat, C.blush, C.moss, C.ink], sizes: ["45 × 45", "50 × 70"], rating: 4.6, reviews: 120, stock: 26, shape: "pillow", blurb: "Bouclé on the front, linen on the back, hidden zip.", details: ["Bouclé and linen", "Insert sold separately", "Dry clean"] },
  { id: "ember-candle", name: "Ember Candle", category: "Scent", price: 3800, colors: [C.amber, C.ink], rating: 4.8, reviews: 402, stock: 50, shape: "candle", blurb: "Cedar, smoke and black pepper in a reusable stoneware vessel.", details: ["Coconut-soy wax", "50-hour burn", "Cotton wick"] },
  { id: "grove-diffuser", name: "Grove Diffuser", category: "Scent", price: 4400, colors: [C.moss, C.bone], rating: 4.4, reviews: 59, stock: 0, shape: "diffuser", blurb: "Fig leaf and vetiver, with reeds that last about 4 months.", details: ["200 ml", "8 rattan reeds", "Refillable"] },
  { id: "salt-vase", name: "Salt Vase, Tall", category: "Ceramics", price: 9200, colors: [C.bone, C.smoke], rating: 4.7, reviews: 36, stock: 7, shape: "vase", blurb: "A tall, narrow-necked form glazed to look like weathered stone.", details: ["Stoneware, crawl glaze", "38 cm tall", "Decorative; not watertight"] },
  { id: "morning-mug", name: "Morning Mug, Pair", category: "Ceramics", price: 4000, compareAt: 4800, colors: [C.blush, C.mist], rating: 4.7, reviews: 210, stock: 22, shape: "mug", blurb: "Two low, wide mugs for flat whites and slow mornings.", details: ["Stoneware", "240 ml each", "Dishwasher safe"] },
  { id: "amber-carafe", name: "Night Carafe", category: "Glass", price: 3900, colors: [C.amber, C.smoke], rating: 4.6, reviews: 88, stock: 18, shape: "carafe", isNew: true, blurb: "A bedside water set in tinted glass.", details: ["Soda-lime glass", "600 ml", "Hand wash"] },
  { id: "loom-throw", name: "Loom Wool Throw", category: "Textiles", price: 15800, colors: [C.ink, C.oat], rating: 4.8, reviews: 73, stock: 9, shape: "throw", blurb: "A herringbone weave in undyed lambswool.", details: ["100% lambswool", "140 × 190 cm", "Dry clean"] },
];

export const categories: Category[] = ["Ceramics", "Glass", "Lighting", "Textiles", "Scent"];

export const allColors: Color[] = Array.from(
  new Map(products.flatMap((p) => p.colors).map((c) => [c.name, c])).values(),
);

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
