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

const DIR = "C:\\Users\\USER\\Documents\\Tee's collection\\pics"
const LETTERS = ['A','B','C','D','E','F','G','H','I','J','K','L','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

const SHARED = {
  description: 'Personalised passport cover with a velvet varsity initial letter. Choose your letter below. Available by order.',
  category: 'accessories',
  price_usd: 5,
  price_air: 5,
  price_sea: 2.50,
  min_order_qty_sea: 10,
  origin: 'china',
  availability: 'by_order',
  shipping: 'both',
  sizes: [],
  colours: LETTERS,
}

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/initial-cover', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  // 1. Delete the old single product
  const old = await prisma.product.findFirst({ where: { name: 'Initial Letter Passport Cover' } })
  if (old) {
    await prisma.product.delete({ where: { id: old.id } })
    console.log('✓ Deleted old "Initial Letter Passport Cover"')
    // Reuse the blue group image URL that was already uploaded
    var blueGroupUrl = old.images[0]
    console.log(`  Blue group URL: ${blueGroupUrl}`)
  }

  // 2. Upload pink group image (7.11.29 PM.jpeg — full group showing all pink marble letters)
  const pinkFile = path.join(DIR, 'WhatsApp Image 2026-06-25 at 7.11.29 PM.jpeg')
  process.stdout.write('Uploading pink marble group image... ')
  const buffer = fs.readFileSync(pinkFile)
  const pinkResult = await uploadBuffer(buffer, 'initial-cover-pink_group')
  const pinkGroupUrl = pinkResult.secure_url
  console.log('✓')

  // 3. Create Blue Marble product
  await prisma.product.create({
    data: {
      ...SHARED,
      name: 'Initial Letter Passport Cover (Blue Marble)',
      images: blueGroupUrl ? [blueGroupUrl] : [],
    },
  })
  console.log('✓ Created "Initial Letter Passport Cover (Blue Marble)"')

  // 4. Create Pink Marble product
  await prisma.product.create({
    data: {
      ...SHARED,
      name: 'Initial Letter Passport Cover (Pink Marble)',
      images: [pinkGroupUrl],
    },
  })
  console.log('✓ Created "Initial Letter Passport Cover (Pink Marble)"')

  console.log(`\nDone. Both products have ${LETTERS.length} letter options (A–Z, no M).`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
