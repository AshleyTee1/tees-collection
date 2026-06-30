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

const DIR = "C:\\Users\\USER\\Documents\\Tee's collection\\bags2"

const MODEL_MAP = [
  {
    name: 'Michael Kors Jet Set Tote',
    colours: ['White', 'Brown', 'Beige', 'Blue', 'Hot Pink', 'Black', 'Purple', 'Orange'],
    folder: 'mk-tote',
    files: [
      'WhatsApp Image 2026-06-25 at 1.52.06 PM.jpeg',      // group (all colours)
      'WhatsApp Image 2026-06-25 at 1.52.02 PM.jpeg',      // White
      'WhatsApp Image 2026-06-25 at 1.52.02 PM (1).jpeg',  // Brown
      'WhatsApp Image 2026-06-25 at 1.52.03 PM.jpeg',      // Beige
      'WhatsApp Image 2026-06-25 at 1.52.03 PM (1).jpeg',  // Blue
      'WhatsApp Image 2026-06-25 at 1.52.03 PM (2).jpeg',  // Hot Pink
      'WhatsApp Image 2026-06-25 at 1.52.04 PM.jpeg',      // Black
      'WhatsApp Image 2026-06-25 at 1.52.05 PM.jpeg',      // Purple
      'WhatsApp Image 2026-06-25 at 1.52.05 PM (1).jpeg',  // Orange
    ],
  },
  {
    name: 'Coach Alma Shell Bag',
    colours: ['Dark Brown', 'Black', 'Brown', 'Pink', 'White', 'Beige'],
    folder: 'coach-alma',
    files: [
      'WhatsApp Image 2026-06-25 at 1.52.06 PM (1).jpeg',  // group (6 colours)
      'WhatsApp Image 2026-06-25 at 1.52.07 PM.jpeg',      // Dark Brown (dark canvas + black trim)
      'WhatsApp Image 2026-06-25 at 1.52.07 PM (1).jpeg',  // Black
      'WhatsApp Image 2026-06-25 at 1.52.06 PM (2).jpeg',  // Brown (khaki canvas + brown trim)
      'WhatsApp Image 2026-06-25 at 1.52.07 PM (2).jpeg',  // Pink
      'WhatsApp Image 2026-06-25 at 1.52.07 PM (3).jpeg',  // White
      'WhatsApp Image 2026-06-25 at 1.52.08 PM.jpeg',      // Beige (khaki canvas + white trim)
    ],
  },
  {
    name: 'Coach Teri Chain Shoulder Bag',
    colours: ['Pink', 'Black', 'Teal', 'Blue', 'Brown', 'White', 'Beige', 'Tan'],
    folder: 'coach-teri',
    files: [
      'WhatsApp Image 2026-06-25 at 1.52.08 PM (2).jpeg',  // group (all colours)
      'WhatsApp Image 2026-06-25 at 1.52.09 PM.jpeg',      // Pink
      'WhatsApp Image 2026-06-25 at 1.52.09 PM (1).jpeg',  // Black
      'WhatsApp Image 2026-06-25 at 1.52.09 PM (2).jpeg',  // Teal
      'WhatsApp Image 2026-06-25 at 1.52.10 PM.jpeg',      // Blue
      'WhatsApp Image 2026-06-25 at 1.52.10 PM (1).jpeg',  // Brown
      'WhatsApp Image 2026-06-25 at 1.52.10 PM (2).jpeg',  // White
      'WhatsApp Image 2026-06-25 at 1.52.10 PM (3).jpeg',  // Beige
      'WhatsApp Image 2026-06-25 at 1.52.11 PM.jpeg',      // Tan
    ],
  },
  {
    name: 'Coach Tabby Shoulder Bag',
    colours: ['Black', 'White', 'Tan', 'Beige', 'Red', 'Brown', 'Black & White', 'Canvas Black'],
    folder: 'coach-tabby2',
    files: [
      'WhatsApp Image 2026-06-25 at 1.52.11 PM (1).jpeg',  // group (all colours)
      'WhatsApp Image 2026-06-25 at 1.52.11 PM (2).jpeg',  // Black
      'WhatsApp Image 2026-06-25 at 1.52.12 PM.jpeg',      // White
      'WhatsApp Image 2026-06-25 at 1.52.12 PM (1).jpeg',  // Tan
      'WhatsApp Image 2026-06-25 at 1.52.12 PM (2).jpeg',  // Beige
      'WhatsApp Image 2026-06-25 at 1.52.13 PM.jpeg',      // Red
      'WhatsApp Image 2026-06-25 at 1.52.13 PM (1).jpeg',  // Brown
      'WhatsApp Image 2026-06-25 at 1.52.13 PM (2).jpeg',  // Black & White
      'WhatsApp Image 2026-06-25 at 1.52.14 PM.jpeg',      // Canvas Black
    ],
  },
]

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/bags2', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  for (const model of MODEL_MAP) {
    const product = await prisma.product.findFirst({ where: { name: model.name } })
    if (!product) { console.log(`⚠  Not found in DB: ${model.name}`); continue }

    console.log(`\n${model.name}: ${model.files.length} images`)
    const urls = []

    for (let i = 0; i < model.files.length; i++) {
      const filePath = path.join(DIR, model.files[i])
      if (!fs.existsSync(filePath)) { console.log(`  ⚠  Missing: ${model.files[i]}`); continue }
      const publicId = `${model.folder}_${String(i + 1).padStart(2, '0')}`
      try {
        process.stdout.write(`  [${i + 1}] ${model.files[i].slice(-35)}... `)
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
    console.log(`  → ${urls.length} images + colours saved to DB`)
  }

  console.log('\nAll done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
