require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const products = [
  {
    name: 'Fluffy Cross-Strap Slides',
    description: 'Soft, cloud-like fluffy cross-strap slides — perfect for outdoor casual wear. Open-toe design with an X-cross strap for a stylish yet comfortable fit. Available in 4 colours.',
    category: 'shoes',
    price_usd: 10,
    price_air: 10,
    price_sea: 4.50,
    min_order_qty_sea: 50,
    shipping: 'both',
    sizes: ['36-37', '38-39', '40-41', '42-43'],
    colours: ['White', 'Black', 'Beige', 'Purple/Pink Tie-Dye'],
    availability: 'by_order',
  },
  {
    name: 'Fluffy Ribbed Slingback Mules',
    description: 'Plush ribbed fluffy mules with an elastic slingback strap — cosy and stylish for outdoor casual wear. Chunky ridged upper with a padded insole for all-day comfort. Available in 5 colours.',
    category: 'shoes',
    price_usd: 20,
    price_air: 20,
    price_sea: 9.50,
    min_order_qty_sea: 50,
    shipping: 'both',
    sizes: ['35', '36', '37', '38', '39', '40', '41', '42'],
    colours: ['Cream', 'Grey', 'Black', 'Pink', 'Beige'],
    availability: 'by_order',
  },
  {
    name: 'Marble Print Passport Cover',
    description: 'Elegant marble-print PU leather passport cover with gold foil "PASSPORT" lettering. Slim and lightweight with card slots inside. Available in 7 marble colour variants.',
    category: 'accessories',
    price_usd: 5,
    price_air: 5,
    price_sea: 2.50,
    min_order_qty_sea: 10,
    shipping: 'both',
    sizes: [],
    colours: ['Blue', 'Grey', 'Pink', 'Camel', 'Black', 'White', 'Light Blue'],
    availability: 'by_order',
  },
  {
    name: 'Adventure Passport Cover',
    description: 'Chic PU leather passport cover with gold foil "And So the Adventure Begins" script and airplane motif. Available in 12 solid colours.',
    category: 'accessories',
    price_usd: 5,
    price_air: 5,
    price_sea: 2.50,
    min_order_qty_sea: 10,
    shipping: 'both',
    sizes: [],
    colours: ['Black', 'Dark Brown', 'Red', 'Navy', 'Dark Grey', 'Purple', 'Olive', 'Blue', 'Tan', 'Pink', 'Mint', 'Cream'],
    availability: 'by_order',
  },
  {
    name: 'Initial Letter Passport Cover',
    description: 'Personalised passport cover with a velvet varsity initial letter on a marble background. Available in Blue Marble and Pink Marble. Any letter A–Z except M — please specify your initial in the order notes.',
    category: 'accessories',
    price_usd: 5,
    price_air: 5,
    price_sea: 2.50,
    min_order_qty_sea: 10,
    shipping: 'both',
    sizes: [],
    colours: ['Blue Marble', 'Pink Marble'],
    availability: 'by_order',
  },
  {
    name: 'GG Monogram Canvas Tote Bag',
    description: 'Large structured tote bag in GG monogram canvas with leather trim and twin shoulder straps. Roomy and stylish — perfect for everyday use. Available in 4 colours.',
    category: 'handbags',
    price_usd: 10,
    price_air: 10,
    price_sea: 4.50,
    min_order_qty_sea: 50,
    shipping: 'both',
    sizes: [],
    colours: ['Pink', 'Black', 'Cream', 'Brown'],
    availability: 'by_order',
  },
]

async function main() {
  console.log('Seeding pics products...')
  let created = 0

  for (const p of products) {
    try {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          category: p.category,
          price_usd: p.price_usd,
          price_air: p.price_air,
          price_sea: p.price_sea,
          min_order_qty_sea: p.min_order_qty_sea,
          origin: 'china',
          availability: p.availability,
          shipping: p.shipping,
          images: [],
          colours: p.colours,
          sizes: p.sizes,
        },
      })
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
