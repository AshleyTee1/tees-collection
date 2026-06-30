require('dotenv').config()
const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')
const cloudinary = require('cloudinary').v2
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const DIR = 'C:\\Users\\USER\\Downloads\\coach'

// images[0]=group, images[1..6] match colours: Pink, Brown, Beige, Black, White, Dark Brown
const files = [
  'WhatsApp Image 2026-06-25 at 12.24.41 PM (2).jpeg', // group photo
  'WhatsApp Image 2026-06-25 at 12.24.41 PM.jpeg',     // Pink
  'WhatsApp Image 2026-06-25 at 12.24.41 PM (1).jpeg', // Brown
  'WhatsApp Image 2026-06-25 at 12.24.43 PM.jpeg',     // Beige (grey/taupe — confirmed by user)
  'WhatsApp Image 2026-06-25 at 12.24.42 PM.jpeg',     // Black
  'WhatsApp Image 2026-06-25 at 12.24.41 PM (3).jpeg', // White
  'WhatsApp Image 2026-06-25 at 12.24.43 PM (1).jpeg', // Dark Brown
  'WhatsApp Image 2026-06-25 at 12.24.42 PM (2).jpeg', // extra
  'WhatsApp Image 2026-06-25 at 12.24.42 PM (1).jpeg', // extra
  'WhatsApp Image 2026-06-25 at 12.24.40 PM (2).jpeg', // extra
  'WhatsApp Image 2026-06-25 at 12.24.40 PM (3).jpeg', // extra
]

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/coach-bags', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  const product = await prisma.product.findFirst({ where: { name: 'Coach Signature City Tote' } })
  if (!product) { console.log('Not found'); return }

  console.log('Fixing tote image order...')
  const urls = []

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(DIR, files[i])
    if (!fs.existsSync(filePath)) { console.log(`  ⚠  Missing: ${files[i]}`); continue }
    try {
      process.stdout.write(`  [${i + 1}] ${files[i].slice(-30)}... `)
      const buffer = fs.readFileSync(filePath)
      const result = await uploadBuffer(buffer, `tote_${String(i + 1).padStart(2, '0')}`)
      urls.push(result.secure_url)
      console.log('✓')
    } catch (err) {
      console.log(`✗ ${err.message}`)
    }
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { images: urls, colours: ['Pink', 'Brown', 'Beige', 'Black', 'White', 'Dark Brown'] },
  })
  console.log('\n→ Done. Beige now shows the correct grey/taupe bag.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
