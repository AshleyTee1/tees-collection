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

const IMAGES_DIR = "C:\\Users\\USER\\Documents\\Tee's collection\\watches"

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/watches', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  const products = await prisma.product.findMany({
    where: { category: 'watches' },
    orderBy: { created_at: 'asc' },
    select: { id: true, name: true },
  })

  console.log(`Found ${products.length} watch products`)

  // Expects watch1.jpg, watch2.jpg ... watch5.jpg
  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const num = i + 1
    const extensions = ['jpg', 'jpeg', 'png', 'webp']
    let imagePath = null

    for (const ext of extensions) {
      const candidate = path.join(IMAGES_DIR, `watch${num}.${ext}`)
      if (fs.existsSync(candidate)) { imagePath = candidate; break }
    }

    if (!imagePath) {
      console.log(`⚠  No image file found for watch${num} — skipping ${product.name}`)
      continue
    }

    try {
      process.stdout.write(`Uploading watch${num} → ${product.name}... `)
      const buffer = fs.readFileSync(imagePath)
      const result = await uploadBuffer(buffer, `watch_${String(num).padStart(2, '0')}`)
      await prisma.product.update({ where: { id: product.id }, data: { images: [result.secure_url] } })
      console.log('✓')
    } catch (err) {
      console.log(`✗ ${err.message}`)
    }
  }

  console.log('Done')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
