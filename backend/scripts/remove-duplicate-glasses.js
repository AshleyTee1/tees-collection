require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const products = await prisma.product.findMany({
    where: { category: 'glasses' },
    orderBy: { created_at: 'asc' },
  })

  const seen = new Set()
  const toDelete = []

  for (const p of products) {
    if (seen.has(p.name)) {
      toDelete.push(p.id)
    } else {
      seen.add(p.name)
    }
  }

  console.log(`Found ${toDelete.length} duplicates to remove...`)
  await prisma.product.deleteMany({ where: { id: { in: toDelete } } })
  console.log('Done! Duplicates removed.')
  await prisma.$disconnect()
}

main().catch(console.error)
