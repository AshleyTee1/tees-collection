require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcrypt')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Default settings
  const defaults = [
    { key: 'ecocash_number', value: '077 XXX XXXX' },
    { key: 'ecocash_name', value: "Tee's Collection" },
    { key: 'office_address', value: 'Harare, Zimbabwe — address TBC' },
    { key: 'office_hours', value: 'Monday – Saturday, 8am – 6pm' },
    { key: 'whatsapp_number', value: '+263 7X XXX XXXX' },
  ]
  for (const s of defaults) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s })
  }

  // Admin user
  const existing = await prisma.user.findUnique({ where: { email: 'admin@teescollection.com' } })
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Tee's Collection Admin",
        email: 'admin@teescollection.com',
        password_hash: await bcrypt.hash('changeme123', 12),
        role: 'ADMIN',
      },
    })
    console.log('Admin user created: admin@teescollection.com / changeme123')
  }

  // Sample products
  const products = [
    { name: 'Thai Glow Skincare Set', description: 'Luxurious skincare bundle from premium Thai beauty brands.', category: 'cosmetics', origin: 'thailand', price_usd: 28, sizes: ['One Size'], colours: [], availability: 'in_stock', shipping: 'air', images: [] },
    { name: 'Classic White Sneakers', description: 'Premium quality sneakers from trusted Chinese suppliers.', category: 'shoes', origin: 'china', price_usd: 22, sizes: ['36','37','38','39','40','41'], colours: ['White','Black','Pink','Beige'], availability: 'by_order', shipping: 'both', min_order_qty_sea: 100, images: [] },
    { name: 'Quilted Shoulder Bag', description: 'Elegant quilted design with gold-tone hardware.', category: 'handbags', origin: 'china', price_usd: 45, sizes: ['One Size'], colours: ['Black','Rose','Cream'], availability: 'in_stock', shipping: 'both', min_order_qty_sea: 50, images: [] },
    { name: 'Pearl Drop Earrings Set', description: 'Delicate freshwater pearl drop earrings.', category: 'jewellery', origin: 'china', price_usd: 12, sizes: ['One Size'], colours: [], availability: 'in_stock', shipping: 'air', images: [] },
    { name: 'Rose Water Mist Spray', description: '100% natural rose water from Thai rose farms.', category: 'cosmetics', origin: 'thailand', price_usd: 15, sizes: ['100ml','200ml'], colours: [], availability: 'by_order', shipping: 'air', images: [] },
    { name: 'Straw Sun Hat', description: 'Handwoven natural straw wide-brim hat.', category: 'accessories', origin: 'china', price_usd: 18, sizes: ['S/M','L/XL'], colours: ['Natural','Black'], availability: 'in_stock', shipping: 'both', min_order_qty_sea: 100, images: [] },
    { name: 'Block Heel Sandals', description: 'Strappy block heel sandals with cushioned footbed.', category: 'shoes', origin: 'china', price_usd: 30, sizes: ['36','37','38','39','40'], colours: ['Nude','Black','White'], availability: 'by_order', shipping: 'both', min_order_qty_sea: 50, images: [] },
    { name: 'Newborn Gift Set', description: 'Complete newborn essentials bundle.', category: 'baby_wear', origin: 'china', price_usd: 35, sizes: ['0–3m','3–6m','6–12m'], colours: [], availability: 'coming_soon', shipping: 'both', images: [] },
  ]

  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.name }, update: {}, create: { ...p, id: p.name.toLowerCase().replace(/\s+/g, '-') } }).catch(() =>
      prisma.product.create({ data: p })
    )
  }

  console.log('Seed complete.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
