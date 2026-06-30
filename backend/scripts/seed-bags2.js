require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const bags = [
  {
    name: 'Michael Kors Jet Set Tote',
    description: 'Sleek Michael Kors Jet Set Tote in saffiano leather with signature gold MK charm and adjustable straps. Roomy and structured — perfect for everyday use. Available in 8 colours.',
    colours: ['White', 'Brown', 'Beige', 'Blue', 'Hot Pink', 'Black', 'Purple', 'Orange'],
  },
  {
    name: 'Coach Alma Shell Bag',
    description: 'Iconic Coach Alma dome bag in CC signature canvas with leather trim. Features dual top handles and a removable crossbody strap. A timeless structured mini bag available in 6 colourways.',
    colours: ['Dark Brown', 'Black', 'Brown', 'Pink', 'White', 'Beige'],
  },
  {
    name: 'Coach Teri Chain Shoulder Bag',
    description: 'Chic Coach Teri shoulder bag in CC signature canvas with a gold chain strap and matching leather trim. Can be worn as a shoulder bag or crossbody. Available in 8 colours.',
    colours: ['Pink', 'Black', 'Teal', 'Blue', 'Brown', 'White', 'Beige', 'Tan'],
  },
  {
    name: 'Coach Tabby Shoulder Bag',
    description: 'The Coach Tabby in premium pebbled leather with a signature gold C-clasp closure and adjustable shoulder strap. A modern classic available in solid and colour-block styles.',
    colours: ['Black', 'White', 'Tan', 'Beige', 'Red', 'Brown', 'Black & White', 'Canvas Black'],
  },
]

async function main() {
  console.log('Seeding 4 bags2 products...')
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
