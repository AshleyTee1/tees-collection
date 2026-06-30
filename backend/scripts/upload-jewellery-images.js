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

const DIR = 'C:\\Users\\USER\\Downloads'

// colours[n-1] → images[n]  (images[0] = main/group)
const PRODUCTS = [
  {
    name: 'Wave Bracelets',
    colours: ['Gold', 'Silver'],
    folder: 'wave-bracelets',
    // [0]=main(silver shot), [1]=Gold, [2]=Silver(same as main)
    files: [
      'WhatsApp Image 2026-06-02 at 8.35.50 PM.jpeg', // main (silver)
      'WhatsApp Image 2026-06-02 at 8.36.06 PM.jpeg', // Gold
      'WhatsApp Image 2026-06-02 at 8.35.50 PM.jpeg', // Silver (same as main)
    ],
  },
  {
    name: 'Crystal Gem Watches',
    colours: ['Red', 'Green', 'Black', 'White', 'Pink', 'Multicolour'],
    folder: 'crystal-watches',
    files: [
      'WhatsApp Image 2026-06-10 at 10.07.24 PM.jpeg', // group (all 6 colours)
    ],
  },
  {
    name: 'Gold Necklace Set (11 Pieces)',
    colours: [],
    folder: 'gold-necklace-set',
    files: [
      'WhatsApp Image 2026-06-02 at 8.34.59 PM.jpeg', // necklace set
    ],
  },
]

function uploadBuffer(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: 'tees-collection/jewellery', overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  for (const item of PRODUCTS) {
    const product = await prisma.product.findFirst({ where: { name: item.name } })
    if (!product) { console.log(`⚠  Not found: ${item.name}`); continue }

    console.log(`\n${item.name}: uploading ${item.files.length} images`)

    // deduplicate: upload each unique file once, then build url array
    const uploadedUrls = {}
    for (const file of [...new Set(item.files)]) {
      const filePath = path.join(DIR, file)
      if (!fs.existsSync(filePath)) { console.log(`  ⚠  Missing: ${file}`); continue }
      const publicId = `${item.folder}_${Object.keys(uploadedUrls).length + 1}`
      process.stdout.write(`  ${file.slice(-30)}... `)
      const buffer = fs.readFileSync(filePath)
      const result = await uploadBuffer(buffer, publicId)
      uploadedUrls[file] = result.secure_url
      console.log('✓')
    }

    const urls = item.files.map(f => uploadedUrls[f]).filter(Boolean)

    await prisma.product.update({
      where: { id: product.id },
      data: { images: urls, colours: item.colours },
    })
    console.log(`  → ${urls.length} images saved`)
  }

  console.log('\nAll done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
