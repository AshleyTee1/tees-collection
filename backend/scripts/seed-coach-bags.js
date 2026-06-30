require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const bags = [
  {
    name: 'Coach Tabby Quilted Shoulder Bag',
    description: 'Chic Coach Tabby shoulder bag in soft quilted leather with a gold chain strap and signature C-clasp closure. Available in multiple colours. A versatile everyday bag with designer appeal.',
    colours: ['Pink', 'Red', 'White', 'Black'],
  },
  {
    name: 'Coach Signature City Tote',
    description: 'Spacious Coach Signature City Tote in classic CC monogram canvas with smooth leather handles. Roomy enough for everyday essentials. Available in multiple colourways.',
    colours: ['Grey', 'Pink', 'Black'],
  },
  {
    name: 'Coach Signature Crossbody Bag',
    description: 'Elegant Coach Signature crossbody bag in CC monogram canvas with a gold-tone clasp and adjustable leather strap. Can be carried by hand or over the shoulder.',
    colours: ['Brown', 'White'],
  },
]

async function main() {
  console.log('Seeding 3 Coach bags...')
  let created = 0

  for (const b of bags) {
    try {
      await prisma.product.create({
        data: {
          name: b.name,
          description: b.description,
          category: 'handbags',
          price_usd: 25,
          price_air: 25,
          price_sea: 10,
          min_order_qty_sea: 50,
          origin: 'china',
          availability: 'by_order',
          shipping: 'both',
          images: [],
          colours: b.colours,
          sizes: [],
        },
      })
      console.log(`✓ ${b.name}`)
      created++
    } catch (err) {
      console.error(`✗ ${b.name}: ${err.message}`)
    }
  }

  console.log(`\nDone: ${created} created`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
