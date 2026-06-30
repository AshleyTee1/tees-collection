require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const watches = [
  {
    name: 'Coach New York Ladies Watch (Silver/White)',
    description: 'Elegant Coach New York stainless steel ladies watch with a classic white dial and silver-tone bracelet. Features the iconic Coach New York branding on the dial. A timeless everyday accessory.',
    colours: ['Silver/White'],
  },
  {
    name: 'Coach New York Ladies Watch (Silver/Pink)',
    description: 'Chic Coach New York stainless steel ladies watch with a soft pink dial and silver-tone bracelet. Features the iconic Coach New York branding. A feminine and stylish everyday timepiece.',
    colours: ['Silver/Pink'],
  },
  {
    name: 'Coach Signature CC Ladies Watch (Silver/White)',
    description: 'Sophisticated Coach ladies watch featuring the embossed CC Signature logo dial in white with a sleek silver-tone stainless steel bracelet. Minimalist and luxurious.',
    colours: ['Silver/White'],
  },
  {
    name: 'Coach Signature CC Ladies Watch (Rose Gold/Pink)',
    description: 'Luxurious Coach ladies watch with an embossed CC Signature logo dial in blush pink and a rose gold-tone stainless steel bracelet. Elegant and on-trend.',
    colours: ['Rose Gold/Pink'],
  },
  {
    name: 'Coach Signature Bangle Watch (Gold/Rainbow)',
    description: 'Eye-catching Coach bangle-style ladies watch with a gold-tone chain bracelet and a colourful rainbow CC Signature bezel. Features the classic Coach carriage logo on the white dial. A statement piece.',
    colours: ['Gold/Rainbow'],
  },
]

async function main() {
  console.log('Seeding 5 Coach watches...')
  let created = 0

  for (const w of watches) {
    try {
      await prisma.product.create({
        data: {
          name: w.name,
          description: w.description,
          category: 'watches',
          price_usd: 10,
          price_air: 10,
          price_sea: null,
          origin: 'china',
          availability: 'by_order',
          shipping: 'air',
          images: [],
          colours: w.colours,
          sizes: [],
        },
      })
      console.log(`✓ ${w.name}`)
      created++
    } catch (err) {
      console.error(`✗ ${w.name}: ${err.message}`)
    }
  }

  console.log(`\nDone: ${created} created`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
