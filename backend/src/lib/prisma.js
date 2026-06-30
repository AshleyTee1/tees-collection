const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

function createClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

const prisma = global.__prisma ?? createClient()
if (process.env.NODE_ENV !== 'production') global.__prisma = prisma

module.exports = prisma
