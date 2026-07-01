const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
const bcrypt = require('bcrypt')

// Run with: DATABASE_URL="your-connection-string" node reset-admin-prod.js
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) { console.error('Set DATABASE_URL env var'); process.exit(1) }

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

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
  console.log('Admin ready on production DB:', user.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
