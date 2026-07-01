require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hash = await bcrypt.hash('changeme123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'goweratanatswa@gmail.com' },
    update: { password_hash: hash, role: 'ADMIN' },
    create: {
      name: "Tee's Collection Admin",
      email: 'goweratanatswa@gmail.com',
      password_hash: hash,
      role: 'ADMIN',
    },
  })
  console.log('Admin account ready:', user.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
