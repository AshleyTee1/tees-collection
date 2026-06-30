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

const FILE = "C:\\Users\\USER\\Documents\\Tee's collection\\bags2\\WhatsApp Image 2026-06-25 at 1.52.13 PM (3).jpeg"

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
  const product = await prisma.product.findFirst({ where: { name: 'Coach Tabby Shoulder Bag' } })
  if (!product) { console.log('Product not found'); return }

  console.log(`Found: ${product.name} (${product.images.length} images, ${product.colours.length} colours)`)

  const buffer = fs.readFileSync(FILE)
  process.stdout.write('Uploading Charcoal Canvas image... ')
  const result = await uploadBuffer(buffer, 'coach-tabby2_10')
  console.log('✓')

  const newImages = [...product.images, result.secure_url]
  const newColours = [...product.colours, 'Charcoal Canvas']

  await prisma.product.update({
    where: { id: product.id },
    data: { images: newImages, colours: newColours },
  })

  console.log(`Done: now ${newImages.length} images, colours: ${newColours.join(', ')}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
