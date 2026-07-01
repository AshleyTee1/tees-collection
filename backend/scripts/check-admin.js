require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'goweratanatswa@gmail.com' } })
  console.log('User found:', user ? 'yes' : 'no')
  if (user) {
    console.log('Role:', user.role)
    const match = await bcrypt.compare('changeme123', user.password_hash)
    console.log('Password matches:', match)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
