require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const products = [
  // SUPPLEMENTS — SKIN BRIGHTENING CAPSULES
  {
    name: 'GW L-Gluta Collagen Q-10 Capsules',
    description: 'A powerful skin-brightening supplement combining L-Glutathione, Marine Collagen, and CoQ10. Works from within to reduce melanin production, even skin tone, and boost collagen for firmer, more radiant skin. Double-action formula for visible glow in 2–4 weeks.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '60 Capsules',
  },
  {
    name: 'ElSa Lycopene Collagen Multi Plus',
    description: 'Premium dietary supplement with 105,000mg Collagen, Lycopene, and Hyaluronic Acid. Supports skin barrier repair, boosts immunity, and strengthens bones and joints. Imported from Japan for the highest quality standard.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '7 Sachets (15g each)',
  },
  {
    name: 'PH L-Gluta Plus X2 Capsules',
    description: 'Contains L-Glutathione sourced from Japan with AstaReal Astaxanthin, Vitamin C, and CoQ10. Provides double whitening power to brighten skin tone, reduce dark spots, and protect against oxidative stress from within.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '30 Capsules',
  },
  // SUPPLEMENTS — DIGESTIVE HEALTH
  {
    name: 'APIS-S Digestive Health Supplement',
    description: 'Natural digestive supplement with Mango, Garcinia, Green Coffee, Ginger, and Berry extracts. Supports smooth digestion, regular bowel movement, and maintains a healthy gut environment for daily digestive wellness.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '10 Capsules',
  },
  // SUPPLEMENTS — COLLAGEN DRINK POWDERS
  {
    name: 'PURERA Gluta Collagen Strawberry & Vit C Powder',
    description: 'Delicious drink mix packed with 300,000mg Collagen, L-Glutathione, Vitamin C, and antioxidant-rich berry extracts. Mix one sachet in water daily for glowing, hydrated skin from the inside out.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 25,
    price_air: 25,
    pack_size: '30 Sachets (450g total)',
  },
  {
    name: 'MARA-S Gluta Collagen Mix Fruit & Vit C Plus',
    description: 'Zero-sugar-added collagen drink with 300,000mg Collagen, L-Glutathione, Vitamin C, and CoQ10 in tropical mix-fruit flavor. Supports bright, even skin tone and promotes a healthy luminous complexion.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 25,
    price_air: 25,
    pack_size: '30 Sachets',
  },
  // SUPPLEMENTS — GLUTA CAPSULES
  {
    name: 'Gluta Primme V2M Capsules (Precious Skin)',
    description: 'High-potency beauty supplement from Precious Skin Thailand with L-Glutathione, mixed berry antioxidants, and brightening vitamins. Targets uneven skin tone, dark spots, and dullness for a visibly clearer, luminous complexion.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '30 Capsules',
  },
  // SKINCARE — FACE & BODY MASKS
  {
    name: 'Precious Skin Milky Chocolate Repair Mask',
    description: 'Luxurious sheet mask infused with cocoa and milk extracts to deeply repair and soften skin. Paraben-free, alcohol-free, and silicone-free — gentle for all skin types. Leave on 15–20 minutes for intensely nourished, velvety smooth skin.',
    category: 'cosmetics',
    unit: 'sheet',
    price_usd: 3,
    price_air: 3,
    pack_size: '1 Sheet (30g)',
  },
  {
    name: 'Precious Skin Coconut Softly Peel Foot Mask',
    description: 'Gentle exfoliating foot treatment enriched with coconut extract. Softens tough, calloused skin and removes dead cells for baby-soft feet. Simply wear like socks and enjoy smooth, rejuvenated feet within days.',
    category: 'cosmetics',
    unit: 'pair',
    price_usd: 6,
    price_air: 6,
    pack_size: '1 Pair',
  },
  {
    name: 'Joji Snail Centella Natural Care Facial Mask',
    description: 'Soothing sheet mask combining Snail Secretion Filtrate and Centella Asiatica to intensely hydrate, calm redness, and repair sun-damaged skin. Delivers a refreshed, dewy complexion after a single use.',
    category: 'cosmetics',
    unit: 'sheet',
    price_usd: 3,
    price_air: 3,
    pack_size: '1 Sheet — All Skin Types',
  },
  // SKINCARE — SERUMS & TREATMENTS
  {
    name: 'Joji Gluta Arbutin 4X Whitening Ampoule Serum',
    description: 'Concentrated 4X whitening ampoule blending L-Glutathione and Alpha-Arbutin to visibly brighten skin, fade dark spots, and reduce wrinkles. Fast-absorbing and suitable for all skin types.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 6,
    price_air: 6,
    pack_size: '10ml',
  },
  {
    name: 'Precious Skin Miracle Anti-Melasma Brightening Serum',
    description: 'Formulated with 1% Tranexamic Acid to target melasma, dark spots, and uneven pigmentation. Brightens skin tone, reduces hyperpigmentation, and restores a uniform luminous complexion for all skin types.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 10,
    price_air: 10,
    pack_size: '50ml',
  },
  {
    name: 'Precious Skin Kojic Collagen Soap',
    description: 'Extreme whitening soap combining Kojic Acid, Marine Collagen, and Snail Secretion. Gently cleanses while targeting hyperpigmentation and dark patches, leaving skin visibly brighter and more even-toned.',
    category: 'cosmetics',
    unit: 'bar',
    price_usd: 10,
    price_air: 10,
    pack_size: '60g',
  },
  // SKINCARE — SOAPS
  {
    name: 'Precious Skin Snail Whipp Intensive Whitening Soap',
    description: 'Intensive whitening soap enriched with Snail Secretion Filtrate for deep skin brightening and moisturising. Creates rich, creamy lather that nourishes while cleansing, gradually lightening skin tone for a full-body whitening effect.',
    category: 'cosmetics',
    unit: 'bar',
    price_usd: 12,
    price_air: 12,
    pack_size: '120g',
  },
  {
    name: 'Collagen Gold 24K Eye Roller Serum',
    description: 'Luxurious eye serum with 24K Gold, Marine Collagen, and Hyaluronic Acid in a cooling roller applicator. Reduces fine lines, puffiness, and dark circles. Brightens and firms the delicate eye area with each application.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 6,
    price_air: 6,
    pack_size: '15ml — 70+ uses',
  },
  // SKINCARE — SERUMS (CONTINUED)
  {
    name: 'Precious Skin Niacinamide 10% Facial Bright Serum',
    description: 'High-concentration 10% Niacinamide (Vitamin B3) serum that minimises pores, controls excess oil, and brightens dull skin. Smooths texture, reduces fine lines, and promotes an even, radiant complexion.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 10,
    price_air: 10,
    pack_size: '50ml — All Skin Types',
  },
  {
    name: 'Precious Skin Primme DTX Kiwi Plus Fiber',
    description: 'Kiwi-flavored detox fiber supplement to support healthy digestion, promote regular bowel movements, and gently cleanse the gut. Formulated with natural fiber and botanical extracts for effective daily detox.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 11,
    price_air: 11,
    pack_size: '10 Sachets (20g each)',
  },
  // WELLNESS — DETOX & FIBER
  {
    name: 'PB Vitamin C Brightening Skin Serum',
    description: 'Intensive Vitamin C serum that revives dull and tired-looking skin, restoring a healthy radiant glow. Boosts radiance, evens skin tone, and provides antioxidant protection against environmental stressors.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 12,
    price_air: 12,
    pack_size: '20ml',
  },
  // SKINCARE — BRIGHTENING SERUMS (SOAPS)
  {
    name: 'JAM Turmeric Gluta Collagen Soap',
    description: 'Natural handcrafted soap combining Turmeric, L-Glutathione, and Collagen. Turmeric\'s anti-inflammatory properties reduce blemishes and dark spots while collagen firms and brightens. Leaves skin smooth, clear, and glowing.',
    category: 'cosmetics',
    unit: 'bar',
    price_usd: 8,
    price_air: 8,
    pack_size: 'Approx. 100g bar',
  },
  {
    name: 'VEREN Elastic Firming Neck Cream',
    description: 'Targeted neck treatment that reduces neck lines, improves skin elasticity, and diminishes pigmentation on the neck and décolleté. Deeply moisturises and softens skin while enhancing firmness for a more youthful, toned neck appearance.',
    category: 'cosmetics',
    unit: 'jar',
    price_usd: 15,
    price_air: 15,
    pack_size: 'Full size',
  },
  // NEW ARRIVALS — SUPPLEMENTS
  {
    name: 'Joji Brand Gluta Primme Capsules',
    description: 'Premium L-Glutathione supplement from Joji Brand, formulated with hydrolyzed marine fish collagen peptides. Works from within to brighten skin tone, reduce dark spots, and deliver a radiant, even complexion with consistent daily use.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 18,
    price_air: 18,
    pack_size: '30 Capsules',
  },
  {
    name: 'Joji Brand Collagen Vitta C Capsules',
    description: 'A collagen and Vitamin C supplement featuring hydrolyzed marine fish collagen peptides to support skin firmness, elasticity, and brightness. Vitamin C boosts collagen synthesis for visibly plumper, more youthful-looking skin.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '30 Capsules',
  },
  // NEW ARRIVALS — BEAUTY SUPPLEMENTS
  {
    name: 'Precious Skin Patty Doomz+ Premium Supplement',
    description: 'An all-in-one beauty supplement with Goji Berry, Bilberry, Hydrolyzed Marine Fish Collagen, L-Glutathione, Isolated Soy Protein, and Pine Bark Extract. New 2021 formula designed to enhance skin brightness, elasticity, and overall wellness.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 10,
    price_air: 10,
    pack_size: '30 Capsules',
  },
  // NEW ARRIVALS — SOAPS
  {
    name: 'De Beauté De Skin Whitening Soap',
    description: 'An elegant floral-infused whitening soap from De Beauté that gently cleanses while brightening and evening the skin tone. Formulated for daily use to deliver softer, lighter, and more radiant skin with each wash.',
    category: 'cosmetics',
    unit: 'bar',
    price_usd: 10,
    price_air: 10,
    pack_size: '80g',
  },
  {
    name: 'JAM Tamarind Gluta Collagen Soap',
    description: 'Natural Thai soap enriched with Tamarind extract, L-Glutathione, and Collagen. Tamarind\'s natural AHAs gently exfoliate dead skin cells while collagen and gluta work to brighten, firm, and even the skin tone for a flawless finish.',
    category: 'cosmetics',
    unit: 'bar',
    price_usd: 10,
    price_air: 10,
    pack_size: 'Approx. 100g bar',
  },
  // NEW ARRIVALS — SERUMS & TREATMENTS
  {
    name: 'PB Collagen Gold HYA White Serum',
    description: 'A powerful brightening serum combining Marine Collagen, 24K Gold particles, and Hyaluronic Acid. Deeply hydrates, firms, and evens skin tone while reducing the appearance of fine lines. Leaves skin plump, luminous, and visibly younger.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 15,
    price_air: 15,
    pack_size: '30ml',
  },
  {
    name: 'Dr.Agei No.7 Serum (Niacinamide 10% + Zinc PCA + Glycolic Acid)',
    description: 'A cosmetic-scientist-developed serum (20+ years experience) combining 10% Niacinamide, 1% Zinc PCA, and 2% Glycolic Acid. Targets whitening, hyperpigmentation, premature aging, and acne. UV protective packaging preserves formula integrity.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 20,
    price_air: 20,
    pack_size: '30ml',
  },
  {
    name: 'Dr.Agei No.8 Serum (Tranexamic Acid 3% + Niacinamide + Alpha Arbutin)',
    description: 'Advanced anti-melasma formula by Dr.Agei with 3% Tranexamic Acid, 6% Niacinamide, 0.5% Alpha Arbutin, and 1% Glycolic Acid. Specifically formulated to treat melasma, black spots, and achieve overall whitening. pH 4.5–5.5 optimised formula.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 20,
    price_air: 20,
    pack_size: '30ml',
  },
  {
    name: 'HYA Whitening Booster Serum (Aria Brand)',
    description: 'Korean-inspired Hyaluronic Acid Whitening Booster Serum that delivers intense hydration while brightening skin tone, fading wrinkles, minimising pores, and evening out dark patches. Suitable for all skin types for a dewy, glass-skin effect.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 15,
    price_air: 15,
    pack_size: '30ml',
  },
  // NEW ARRIVALS — MASKS
  {
    name: 'COLLA Collagen Anti-Aging Cream',
    description: 'A rich collagen-infused anti-aging cream that deeply moisturises, firms, and smooths skin texture. Targets fine lines and wrinkles while restoring the skin\'s natural elasticity and plumpness for a visibly more youthful complexion.',
    category: 'cosmetics',
    unit: 'jar',
    price_usd: 20,
    price_air: 20,
    pack_size: 'Full size jar',
  },
  {
    name: '12 Nangpaya Pure Niacinamide Booster Serum',
    description: 'A concentrated booster serum with 5% Niacinamide, 0.5% Tranexamic Acid, and 1% Ceramide Complex. Rapidly restores skin radiance, strengthens the skin barrier, minimises pores, and visibly evens skin tone for smooth, healthy-looking skin.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 15,
    price_air: 15,
    pack_size: '30ml',
  },
  // NEW ARRIVALS — GLUTA & COLLAGEN PILLS
  {
    name: '12 Nangpaya Retinol B3 Booster Serum',
    description: 'A powerful anti-aging booster combining 1% Retinol and 5% Vitamin B3 (Niacinamide). Accelerates skin renewal, smooths fine lines, brightens skin tone, and refines skin texture for a softer, visibly clearer complexion.',
    category: 'cosmetics',
    unit: 'bottle',
    price_usd: 15,
    price_air: 15,
    pack_size: '30ml',
  },
  // NEW ARRIVALS — MOISTURISERS & SUNSCREEN
  {
    name: 'Mui Mui Sunscreen Cream SPF50 PA++++ (Imported from Japan)',
    description: 'A Japanese-imported oil-control sunscreen with SPF50 PA++++ providing broad-spectrum UVA and UVB protection. Lightweight, non-greasy formula that keeps skin matte while shielding against sun damage. Essential daily skin protection for all skin types.',
    category: 'cosmetics',
    unit: 'jar',
    price_usd: 10,
    price_air: 10,
    pack_size: 'Full size — All Skin Types',
  },
  {
    name: 'BANNA Ginseng Collagen Peel-Off Facial Mask',
    description: 'A premium peel-off mask enriched with Ginseng extract and Collagen to deeply cleanse pores, remove impurities, and firm the skin. Reveals a smoother, brighter, and more toned complexion after each use.',
    category: 'cosmetics',
    unit: 'tube',
    price_usd: 20,
    price_air: 20,
    pack_size: 'Full size tube',
  },
  {
    name: 'BANNA Gold Collagen Peel-Off Facial Mask',
    description: 'A luxurious 24K Gold Collagen peel-off mask that lifts away dead skin cells and impurities while infusing skin with collagen and gold particles. Leaves skin visibly firmer, luminous, and deeply refreshed after each application.',
    category: 'cosmetics',
    unit: 'tube',
    price_usd: 20,
    price_air: 20,
    pack_size: 'Full size tube',
  },
  {
    name: 'Kana Blueberry Glutathione Supplement',
    description: 'A potent L-Glutathione supplement with 16,500mg per box, infused with Blueberry, Cherry, and mixed berry antioxidants. Powerful skin-brightening supplement that works from within to lighten skin tone, reduce dark spots, and combat free radical damage.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '10 Sachets (3g each)',
  },
  {
    name: 'Madam Koy Slimming Dietary Supplement',
    description: 'A natural weight management supplement combining Garcinia Extract, White Kidney Bean Extract, Chitosan (90%), Cactus Extract, Capsicum Extract, and Chromium Picolinate. Supports appetite control, fat blocking, and healthy weight management.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 15,
    price_air: 15,
    pack_size: '10 Tablets',
  },
  // NEW ARRIVALS — PREMIUM CAPSULES
  {
    name: 'SORIKO Gluta Collagen X10 & Bright Up (So Beauty)',
    description: 'Premium Hydrolyzed Fish Collagen Tripeptide drink in mix-fruit flavor with Gluta 100X, CoQ10, Vitamin C, Vitamin D, and AHA. 10X collagen formula for dramatically brighter, firmer, and more youthful skin from within.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 25,
    price_air: 25,
    pack_size: '15 Sachets (15mg each)',
  },
  {
    name: 'SORIKO Retinol Anti-Aging Night Moisturiser',
    description: 'An advanced night cream combining Retinol, Palmitoyl Pentapeptide-4, and Niacinamide (Vitamin B3) to visibly reduce fine lines, firm the skin, and promote overnight cell renewal. Wake up to plumper, more radiant, and youthful-looking skin.',
    category: 'cosmetics',
    unit: 'jar',
    price_usd: 25,
    price_air: 25,
    pack_size: '50g',
  },
  // NEW ARRIVALS — SOAPS (CONTINUED)
  {
    name: 'YURIKO Gluta Pure X10 Capsules (8-in-1)',
    description: 'An 8-in-1 premium Glutathione capsule formula featuring L-Glutathione, L-Glutamine, and L-Cysteine for maximum skin brightening. X10 concentrated formula for a deep glow, brighter skin tone, and enhanced antioxidant protection.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 17,
    price_air: 17,
    pack_size: '60 Capsules',
  },
  {
    name: 'YURIKO Collagen X10 Capsules (8-in-1)',
    description: 'An 8-in-1 premium collagen supplement with Collagen, L-Glutathione, and Vitamin C in a high-potency X10 formula. Supports skin firmness, elasticity, and brightness while reducing the visible signs of aging for a youthful, radiant complexion.',
    category: 'cosmetics',
    unit: 'pack',
    price_usd: 17,
    price_air: 17,
    pack_size: '60 Capsules',
  },
  {
    name: '12 Nangpaya Turmeric & Honey Soap',
    description: 'A skin-brightening soap combining fermented honey essence and Turmeric for a smooth, blemish-free complexion. Honey deeply moisturises and heals while Turmeric\'s natural anti-inflammatory properties fade dark spots and even skin tone. Comes with a free bubble net bag.',
    category: 'cosmetics',
    unit: 'bar',
    price_usd: 15,
    price_air: 15,
    pack_size: 'Full size bar + Bubble net bag',
  },
]

async function main() {
  console.log(`Seeding ${products.length} cosmetics products...`)
  let created = 0
  let failed = 0

  for (const p of products) {
    try {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          category: p.category,
          price_usd: p.price_usd,
          price_air: p.price_air,
          price_sea: null,
          origin: 'thailand',
          availability: 'by_order',
          shipping: 'air',
          images: [],
          colours: [],
          sizes: [],
        },
      })
      console.log(`✓ ${p.name}`)
      created++
    } catch (err) {
      console.error(`✗ ${p.name}: ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${created} created, ${failed} failed`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
