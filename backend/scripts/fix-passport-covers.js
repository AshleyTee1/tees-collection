require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const covers = await prisma.product.findMany({
    where: { name: { contains: 'Passport Cover' } },
  })

  console.log(`Found ${covers.length} passport cover products:`)
  covers.forEach(p => console.log(`  - ${p.name}`))

  for (const p of covers) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        shipping: 'air',      // no sea shipping for passport covers
        price_air: 2.50,      // wholesale price (10+ by air)
        min_order_qty_sea: 0, // irrelevant now, clear it
      },
    })
    console.log(`✓ Updated: ${p.name}`)
  }

  console.log('\nDone. All passport covers: air only, retail $5, wholesale $2.50 (10+).')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
