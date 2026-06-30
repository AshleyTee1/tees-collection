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

// colours[n-1] → images[n]  (images[0] = main/group)
const MODEL_MAP = [
  {
    name: 'Fluffy Cross-Strap Slides',
    folder: 'cross-strap-slides',
    colours: ['White', 'Black', 'Beige', 'Purple/Pink Tie-Dye'],
    files: [
      'WhatsApp Image 2026-06-25 at 7.11.19 PM.jpeg',      // [0] main (White)
      'WhatsApp Image 2026-06-25 at 7.11.19 PM.jpeg',      // [1] White (same as main)
      'WhatsApp Image 2026-06-25 at 7.11.20 PM.jpeg',      // [2] Black
      'WhatsApp Image 2026-06-25 at 7.11.21 PM (1).jpeg',  // [3] Beige
      'WhatsApp Image 2026-06-25 at 7.11.21 PM.jpeg',      // [4] Purple/Pink Tie-Dye
    ],
  },
  {
    name: 'Fluffy Ribbed Slingback Mules',
    folder: 'ribbed-mules',
    colours: ['Cream', 'Grey', 'Black', 'Pink', 'Beige'],
    files: [
      'WhatsApp Image 2026-06-25 at 7.11.23 PM.jpeg',       // [0] group (all 5 colours)
      'WhatsApp Image 2026-06-25 at 7.11.21 PM (2).jpeg',   // [1] Cream
      'WhatsApp Image 2026-06-25 at 7.11.21 PM (3).jpeg',   // [2] Grey
      'WhatsApp Image 2026-06-25 at 7.11.22 PM.jpeg',       // [3] Black
      'WhatsApp Image 2026-06-25 at 7.11.22 PM (1).jpeg',   // [4] Pink
      'WhatsApp Image 2026-06-25 at 7.11.22 PM (3).jpeg',   // [5] Beige
    ],
  },
  {
    name: 'Marble Print Passport Cover',
    folder: 'marble-cover',
    colours: ['Blue', 'Grey', 'Pink', 'Camel', 'Black', 'White', 'Light Blue'],
    files: [
      'WhatsApp Image 2026-06-25 at 7.11.23 PM (1).jpeg',  // [0] main (Blue, front+open)
      'WhatsApp Image 2026-06-25 at 7.11.23 PM (1).jpeg',  // [1] Blue (same as main)
      'WhatsApp Image 2026-06-25 at 7.11.23 PM (2).jpeg',  // [2] Grey
      'WhatsApp Image 2026-06-25 at 7.11.24 PM.jpeg',      // [3] Pink
      'WhatsApp Image 2026-06-25 at 7.11.24 PM (1).jpeg',  // [4] Camel
      'WhatsApp Image 2026-06-25 at 7.11.24 PM (2).jpeg',  // [5] Black
      'WhatsApp Image 2026-06-25 at 7.11.24 PM (3).jpeg',  // [6] White
      'WhatsApp Image 2026-06-25 at 7.11.25 PM.jpeg',      // [7] Light Blue
    ],
  },
  {
    name: 'Adventure Passport Cover',
    folder: 'adventure-cover',
    colours: ['Black', 'Dark Brown', 'Red', 'Navy', 'Dark Grey', 'Purple', 'Olive', 'Blue', 'Tan', 'Pink', 'Mint', 'Cream'],
    // Colours without standalone shots point to the group image
    files: [
      'WhatsApp Image 2026-06-25 at 7.11.27 PM.jpeg',       // [0]  group (all 12 colours)
      'WhatsApp Image 2026-06-25 at 7.11.27 PM.jpeg',       // [1]  Black → group
      'WhatsApp Image 2026-06-25 at 7.11.27 PM.jpeg',       // [2]  Dark Brown → group
      'WhatsApp Image 2026-06-25 at 7.11.27 PM (1).jpeg',   // [3]  Red
      'WhatsApp Image 2026-06-25 at 7.11.27 PM.jpeg',       // [4]  Navy → group
      'WhatsApp Image 2026-06-25 at 7.11.26 PM.jpeg',       // [5]  Dark Grey
      'WhatsApp Image 2026-06-25 at 7.11.27 PM.jpeg',       // [6]  Purple → group
      'WhatsApp Image 2026-06-25 at 7.11.26 PM (3).jpeg',   // [7]  Olive
      'WhatsApp Image 2026-06-25 at 7.11.26 PM (2).jpeg',   // [8]  Blue
      'WhatsApp Image 2026-06-25 at 7.11.26 PM (1).jpeg',   // [9]  Tan
      'WhatsApp Image 2026-06-25 at 7.11.25 PM (2).jpeg',   // [10] Pink
      'WhatsApp Image 2026-06-25 at 7.11.25 PM (1).jpeg',   // [11] Mint
      'WhatsApp Image 2026-06-25 at 7.11.28 PM.jpeg',       // [12] Cream
    ],
  },
  {
    name: 'Initial Letter Passport Cover',
    folder: 'initial-cover',
    colours: ['Blue Marble', 'Pink Marble'],
    files: [
      'WhatsApp Image 2026-06-25 at 7.11.28 PM (2).jpeg',  // [0] main (Blue marble group)
      'WhatsApp Image 2026-06-25 at 7.11.28 PM (2).jpeg',  // [1] Blue Marble (same as main)
      'WhatsApp Image 2026-06-25 at 7.11.28 PM (3).jpeg',  // [2] Pink Marble
    ],
  },
  {
    name: 'GG Monogram Canvas Tote Bag',
    folder: 'gg-tote',
    colours: ['Pink', 'Black', 'Cream', 'Brown'],
    files: [
      'WhatsApp Image 2026-06-25 at 7.11.30 PM (2).jpeg',  // [0] group (all 4 colours)
      'WhatsApp Image 2026-06-25 at 7.11.29 PM (2).jpeg',  // [1] Pink
      'WhatsApp Image 2026-06-25 at 7.11.30 PM (1).jpeg',  // [2] Black
      'WhatsApp Image 2026-06-25 at 7.11.30 PM (2).jpeg',  // [3] Cream → group (no standalone)
      'WhatsApp Image 2026-06-25 at 7.11.30 PM (3).jpeg',  // [4] Brown
    ],
  },
]

function uploadBuffer(buffer, publicId, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, folder: `tees-collection/${folder}`, overwrite: true },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

async function main() {
  for (const model of MODEL_MAP) {
    const product = await prisma.product.findFirst({ where: { name: model.name } })
    if (!product) { console.log(`⚠  Not found in DB: ${model.name}`); continue }

    console.log(`\n${model.name}: ${model.files.length} slots (${new Set(model.files).size} unique files)`)

    const uploadedUrls = {}
    for (const file of [...new Set(model.files)]) {
      const filePath = path.join(DIR, file)
      if (!fs.existsSync(filePath)) { console.log(`  ⚠  Missing: ${file}`); continue }
      const publicId = `${model.folder}_${Object.keys(uploadedUrls).length + 1}`
      process.stdout.write(`  ${file.slice(-35)}... `)
      const buffer = fs.readFileSync(filePath)
      const result = await uploadBuffer(buffer, publicId, model.folder)
      uploadedUrls[file] = result.secure_url
      console.log('✓')
    }

    const urls = model.files.map(f => uploadedUrls[f]).filter(Boolean)

    await prisma.product.update({
      where: { id: product.id },
      data: { images: urls, colours: model.colours },
    })
    console.log(`  → ${urls.length} images saved`)
  }

  console.log('\nAll done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
