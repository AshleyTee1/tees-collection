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

const IMAGES_DIR = 'C:\\Users\\USER\\Downloads\\coach'

// Map timestamp prefix → product name (must match seeded name exactly)
const MODEL_MAP = [
  {
    name: 'Coach Tabby Quilted Shoulder Bag',
    prefixes: ['12.24.38 PM', '12.24.39 PM', '12.24.40 PM'],
    folder: 'tabby',
  },
  {
    name: 'Coach Signature City Tote',
    prefixes: ['12.24.41 PM', '12.24.42 PM', '12.24.43 PM'],
    folder: 'tote',
  },
  {
    name: 'Coach Signature Crossbody Bag',
    prefixes: ['12.24.44 PM', '12.24.45 PM', '12.24.46 PM'],
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
  const allFiles = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'))

  for (const model of MODEL_MAP) {
    const product = await prisma.product.findFirst({ where: { name: model.name } })
    if (!product) { console.log(`⚠  Product not found: ${model.name}`); continue }

    // Find files matching this model's timestamp prefixes
    const modelFiles = allFiles
      .filter(f => model.prefixes.some(p => f.includes(p)))
      .sort()

    console.log(`\n${model.name}: ${modelFiles.length} images`)

    const urls = []
    for (let i = 0; i < modelFiles.length; i++) {
      const filePath = path.join(IMAGES_DIR, modelFiles[i])
      const publicId = `${model.folder}_${String(i + 1).padStart(2, '0')}`
      try {
        process.stdout.write(`  Uploading ${modelFiles[i]}... `)
        const buffer = fs.readFileSync(filePath)
        const result = await uploadBuffer(buffer, publicId)
        urls.push(result.secure_url)
        console.log('✓')
      } catch (err) {
        console.log(`✗ ${err.message}`)
      }
    }

    await prisma.product.update({ where: { id: product.id }, data: { images: urls } })
    console.log(`  → Saved ${urls.length} image URLs to DB`)
  }

  console.log('\nDone')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
