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

// Colours and images ordered so images[0]=group photo, images[1]=colour[0], images[2]=colour[1] ...
const MODEL_MAP = [
  {
    name: 'Coach Tabby Quilted Shoulder Bag',
    colours: ['Black', 'Red', 'Brown', 'Beige', 'White', 'Pink'],
    files: [
      'WhatsApp Image 2026-06-25 at 12.24.40 PM (1).jpeg', // group photo
      'WhatsApp Image 2026-06-25 at 12.24.38 PM (1).jpeg', // Black
      'WhatsApp Image 2026-06-25 at 12.24.39 PM.jpeg',     // Red
      'WhatsApp Image 2026-06-25 at 12.24.38 PM (2).jpeg', // Brown
      'WhatsApp Image 2026-06-25 at 12.24.39 PM (2).jpeg', // Beige
      'WhatsApp Image 2026-06-25 at 12.24.40 PM.jpeg',     // White
      'WhatsApp Image 2026-06-25 at 12.24.38 PM.jpeg',     // Pink
      'WhatsApp Image 2026-06-25 at 12.24.39 PM (1).jpeg', // Brown alt
    ],
    folder: 'tabby',
  },
  {
    name: 'Coach Signature City Tote',
    colours: ['Pink', 'Brown', 'Beige', 'Black', 'White', 'Dark Brown'],
    files: [
      'WhatsApp Image 2026-06-25 at 12.24.41 PM (2).jpeg', // group photo (6 colours)
      'WhatsApp Image 2026-06-25 at 12.24.41 PM.jpeg',     // Pink
      'WhatsApp Image 2026-06-25 at 12.24.41 PM (1).jpeg', // Brown
      'WhatsApp Image 2026-06-25 at 12.24.42 PM (2).jpeg', // Beige
      'WhatsApp Image 2026-06-25 at 12.24.42 PM.jpeg',     // Black
      'WhatsApp Image 2026-06-25 at 12.24.41 PM (3).jpeg', // White
      'WhatsApp Image 2026-06-25 at 12.24.43 PM (1).jpeg', // Dark Brown
      'WhatsApp Image 2026-06-25 at 12.24.43 PM.jpeg',     // extra
      'WhatsApp Image 2026-06-25 at 12.24.42 PM (1).jpeg', // extra pink
      'WhatsApp Image 2026-06-25 at 12.24.40 PM (2).jpeg', // extra tan
      'WhatsApp Image 2026-06-25 at 12.24.40 PM (3).jpeg', // extra black
    ],
    folder: 'tote',
  },
  {
    name: 'Coach Signature Crossbody Bag',
    colours: ['Brown', 'White', 'Black', 'Pink'],
    files: [
      'WhatsApp Image 2026-06-25 at 12.24.43 PM (2).jpeg', // group photo (multiple colours)
      'WhatsApp Image 2026-06-25 at 12.24.46 PM.jpeg',     // Brown
      'WhatsApp Image 2026-06-25 at 12.24.44 PM.jpeg',     // White
      'WhatsApp Image 2026-06-25 at 12.24.43 PM (3).jpeg', // Black (in box)
      'WhatsApp Image 2026-06-25 at 12.24.44 PM (1).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.44 PM (2).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.44 PM (3).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.45 PM.jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.45 PM (1).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.45 PM (2).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.46 PM (1).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.46 PM (2).jpeg',
      'WhatsApp Image 2026-06-25 at 12.24.46 PM (3).jpeg',
    ],
    folder: 'crossbody',
  },
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
  for (const model of MODEL_MAP) {
    const product = await prisma.product.findFirst({ where: { name: model.name } })
    if (!product) { console.log(`⚠  Not found: ${model.name}`); continue }

    console.log(`\n${model.name}: ${model.files.length} images`)
    const urls = []

    for (let i = 0; i < model.files.length; i++) {
      const filePath = path.join(DIR, model.files[i])
      if (!fs.existsSync(filePath)) { console.log(`  ⚠  Missing: ${model.files[i]}`); continue }
      const publicId = `${model.folder}_${String(i + 1).padStart(2, '0')}`
      try {
        process.stdout.write(`  [${i + 1}] ${model.files[i].slice(-30)}... `)
        const buffer = fs.readFileSync(filePath)
        const result = await uploadBuffer(buffer, publicId)
        urls.push(result.secure_url)
        console.log('✓')
      } catch (err) {
        console.log(`✗ ${err.message}`)
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { images: urls, colours: model.colours },
    })
    console.log(`  → ${urls.length} images + colours saved`)
  }

  console.log('\nDone')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
