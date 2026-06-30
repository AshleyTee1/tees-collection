require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// A-Z except M (not available in either background colour)
const LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

async function main() {
  const product = await prisma.product.findFirst({ where: { name: 'Initial Letter Passport Cover' } })
  if (!product) { console.log('Product not found'); return }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      colours: LETTERS,
      description: 'Personalised passport cover with a velvet varsity initial letter. Available in Blue Marble or Pink Marble background — please specify your preferred background colour in the order notes. All letters A–Z available except M.',
    },
  })

  console.log(`✓ Updated Initial Letter Passport Cover with ${LETTERS.length} letter options: ${LETTERS.join(', ')}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
