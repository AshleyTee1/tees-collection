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

// images[0] = group photo, images[1..7] = one per colour in order
const files = [
  'WhatsApp Image 2026-06-25 at 12.24.43 PM (2).jpeg', // group photo (main)
  'WhatsApp Image 2026-06-25 at 12.24.45 PM.jpeg',     // Pink
  'WhatsApp Image 2026-06-25 at 12.24.46 PM (1).jpeg', // Brown
  'WhatsApp Image 2026-06-25 at 12.24.45 PM (2).jpeg', // Blue
  'WhatsApp Image 2026-06-25 at 12.24.44 PM.jpeg',     // White
  'WhatsApp Image 2026-06-25 at 12.24.45 PM (1).jpeg', // Yellow
  'WhatsApp Image 2026-06-25 at 12.24.46 PM (3).jpeg', // Beige
  'WhatsApp Image 2026-06-25 at 12.24.44 PM (2).jpeg', // Dark Brown
  // extra shots
  'WhatsApp Image 2026-06-25 at 12.24.43 PM (3).jpeg',
  'WhatsApp Image 2026-06-25 at 12.24.44 PM (1).jpeg',
  'WhatsApp Image 2026-06-25 at 12.24.44 PM (3).jpeg',
  'WhatsApp Image 2026-06-25 at 12.24.46 PM.jpeg',
  'WhatsApp Image 2026-06-25 at 12.24.46 PM (2).jpeg',
]

const colours = ['Pink', 'Brown', 'Blue', 'White', 'Yellow', 'Beige', 'Dark Brown']

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
  const product = await prisma.product.findFirst({ where: { name: 'Coach Signature Crossbody Bag' } })
  if (!product) { console.log('Product not found'); return }

  console.log(`Fixing Coach Signature Crossbody Bag: ${files.length} images`)
  const urls = []

  for (let i = 0; i < files.length; i++) {
    const filePath = path.join(DIR, files[i])
    if (!fs.existsSync(filePath)) { console.log(`  ⚠  Missing: ${files[i]}`); continue }
    try {
      process.stdout.write(`  [${i + 1}] ${files[i].slice(-30)}... `)
      const buffer = fs.readFileSync(filePath)
      const result = await uploadBuffer(buffer, `crossbody_${String(i + 1).padStart(2, '0')}`)
      urls.push(result.secure_url)
      console.log('✓')
    } catch (err) {
      console.log(`✗ ${err.message}`)
    }
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { images: urls, colours },
  })
  console.log(`\n→ ${urls.length} images + colours: [${colours.join(', ')}]`)
  console.log('Done')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
