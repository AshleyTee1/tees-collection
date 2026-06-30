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

const IMAGES_DIR = "C:\\Users\\USER\\Documents\\Tee's collection\\cosmetics_images"

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/cosmetics', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  // Get all cosmetics products ordered by creation time (same order they were seeded)
  const products = await prisma.product.findMany({
    where: { category: 'cosmetics' },
    orderBy: { created_at: 'asc' },
    select: { id: true, name: true, images: true },
  })

  console.log(`Found ${products.length} cosmetics products in DB`)

  // Get sorted image files
  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'))
    .sort()

  console.log(`Found ${files.length} image files`)
  console.log()

  let updated = 0
  let failed = 0

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    const imageFile = files[i]

    if (!imageFile) {
      console.log(`⚠  No image for: ${product.name} (skipping)`)
      continue
    }

    const imagePath = path.join(IMAGES_DIR, imageFile)
    const buffer = fs.readFileSync(imagePath)
    const publicId = `cosmetic_${String(i + 1).padStart(3, '0')}`

    try {
      process.stdout.write(`Uploading [${i + 1}/${products.length}] ${product.name}... `)
      const result = await uploadBuffer(buffer, publicId)

      await prisma.product.update({
        where: { id: product.id },
        data: { images: [result.secure_url] },
      })

      console.log(`✓`)
      updated++
    } catch (err) {
      console.log(`✗ ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed`)
  if (products.length > files.length) {
    console.log(`Note: ${products.length - files.length} product(s) had no image file — add via Admin panel`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
