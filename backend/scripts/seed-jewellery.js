require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const products = [
  {
    name: 'Wave Bracelets',
    description: 'Trendy wave-style bracelets available in Gold and Silver. Lightweight and stylish — perfect for stacking. Available by order.',
    category: 'jewellery',
    price_usd: 6,
    price_air: 6,
    price_sea: null,
    shipping: 'air',
    colours: ['Gold', 'Silver'],
    availability: 'by_order',
  },
  {
    name: 'Crystal Gem Watches',
    description: 'Elegant crystal gem-studded watches in 6 stunning colours. Retail price $8 per piece. Wholesale deal: $115 for a set of 20 watches (air shipping). Available by order.',
    category: 'watches',
    price_usd: 8,
    price_air: 8,
    price_sea: null,
    shipping: 'air',
    colours: ['Red', 'Green', 'Black', 'White', 'Pink', 'Multicolour'],
    availability: 'by_order',
  },
  {
    name: 'Gold Necklace Set (11 Pieces)',
    description: 'Beautiful set of 11 gold necklaces — a variety of styles and lengths perfect for layering. Great gift or personal collection. Available by order.',
    category: 'jewellery',
    price_usd: 5,
    price_air: 5,
    price_sea: null,
    shipping: 'air',
    colours: [],
    availability: 'by_order',
  },
]

async function main() {
  console.log('Seeding jewellery products...')
  let created = 0

  for (const p of products) {
    try {
      const data = {
        name: p.name,
        description: p.description,
        category: p.category,
        price_usd: p.price_usd,
        price_air: p.price_air,
        origin: 'china',
        availability: p.availability,
        shipping: p.shipping,
        images: [],
        colours: p.colours,
        sizes: [],
      }
      if (p.price_sea) data.price_sea = p.price_sea

      await prisma.product.create({ data })
      console.log(`✓ ${p.name}`)
      created++
    } catch (err) {
      console.error(`✗ ${p.name}: ${err.message}`)
    }
  }

  console.log(`\nDone: ${created} created`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
