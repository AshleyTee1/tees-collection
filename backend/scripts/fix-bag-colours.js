require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const tote = await prisma.product.findFirst({ where: { name: 'Coach Signature City Tote' } })
  await prisma.product.update({
    where: { id: tote.id },
    data: { colours: ['Pink', 'Brown', 'Beige', 'Black', 'White', 'Dark Brown'] },
  })
  console.log('✓ Tote colours: Pink, Brown, Beige, Black, White, Dark Brown')
}

main().catch(console.error).finally(() => prisma.$disconnect())
