require('dotenv').config()
const fs = require('fs')
const path = require('path')
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

const SLIDES_DIR = "C:\\Users\\USER\\Documents\\Tee's collection\\2025"

// Slide number → model number (from catalog)
const SLIDE_MODELS = {
  1: '9036', 2: '1925', 3: '5018', 4: '8011', 5: '2323',
  6: '1920', 7: '9038', 8: '25009', 9: '98526', 10: '2322',
  11: '8009', 12: '1924', 13: '9068-1', 14: '9090', 15: '9066',
  16: '9061', 17: '25012', 18: '9080', 19: '9063', 20: '23098',
  21: '2318', 22: '9035', 23: '9020', 24: '9037', 25: '9018',
  26: '9067', 27: '9033', 28: '8213', 29: '25026', 30: '8003',
  31: '6639', 32: '2261', 33: '25028', 34: '9088', 35: '8011-B',
  36: '8261', 37: '9012', 38: '9016', 39: '9010', 40: '9050',
  41: '9077', 42: '95761', 43: '9081', 44: '9032', 45: '9068',
  46: '98525', 47: '8002', 48: '5553', 49: '9065', 50: '9067-B',
  51: '2001', 53: '9069', 54: '7044', 55: '1009',
  56: '8010', 57: '8001', 58: '5019', 59: '2002', 60: '9013',
  61: '9019', 62: '6073', 63: '9009', 64: '9022', 65: '25052',
  66: '9015', 67: '9026', 68: '25033', 69: '25028-B', 70: '25035',
  71: '25011', 72: '9029', 73: '25062', 74: '25031', 75: '25068',
  77: '25053', 78: '25050', 79: '25045', 80: '25033-B',
  81: '25043', 82: '25027', 83: '21270', 84: '2295', 85: '2291',
  86: '23182', 87: '21258', 88: '21270-B', 89: '2260', 90: '23188',
  91: '23179', 92: '5048', 93: '5047', 94: '5079', 95: '5079-B',
  96: '68243', 97: '25036', 98: '25047', 99: '25055', 100: '2127',
  101: '25062-B', 102: '25801', 103: '25065', 104: '25805', 105: '25083',
  106: '25082', 107: '25049', 108: '25037', 109: '25806', 110: '25064',
  111: '25066', 112: '25060', 113: '25101', 114: '25102', 115: '25107',
  116: '25056', 117: '25106', 118: '25810', 119: '25811', 120: '25041',
  121: '25103', 122: '25058', 123: '25039', 124: '25057', 126: '9857',
  127: '158', 128: '95597', 130: '8620', 131: '214', 132: '25105',
  133: '178', 134: '3024', 135: '250', 136: '25820',
}

// Known photochromic models
const PHOTOCHROMIC = new Set(['1925', '1920', '8011', '8011-B', '9061'])

async function uploadImage(slidePath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(slidePath, { folder: 'tees-collection/glasses' }, (err, result) => {
      if (err) reject(err)
      else resolve(result.secure_url)
    })
  })
}

async function main() {
  console.log('Starting glasses product upload...\n')
  let created = 0
  let failed = 0

  for (const [slideNum, model] of Object.entries(SLIDE_MODELS)) {
    const slideFile = path.join(SLIDES_DIR, `Slide${slideNum}.JPG`)
    if (!fs.existsSync(slideFile)) {
      console.log(`⚠️  Slide${slideNum}.JPG not found, skipping`)
      continue
    }

    const isPhotochromic = PHOTOCHROMIC.has(model)
    const name = isPhotochromic
      ? `Photochromic Anti-Blue Light Glasses – Model ${model}`
      : `Anti-Blue Light Glasses – Model ${model}`

    try {
      process.stdout.write(`Uploading Slide${slideNum} (Model ${model})... `)
      const imageUrl = await uploadImage(slideFile)

      await prisma.product.create({
        data: {
          name,
          description: `Anti-blue light blocking glasses imported from China. ${isPhotochromic ? 'Photochromic lenses — darken in sunlight and clear indoors. ' : ''}Available in multiple colours — see image for all colour options.\n\n💰 Retail price: $8/pair (1–9 pairs)\n💰 Wholesale price: $4.50/pair (minimum 10 pairs)\n\nPlease specify your preferred colour when ordering.`,
          category: 'glasses',
          origin: 'china',
          price_usd: 8,
          price_air: 4.50,
          price_sea: null,
          images: [imageUrl],
          sizes: [],
          colours: [],
          availability: 'by_order',
          shipping: 'air',
          min_order_qty_sea: null,
        },
      })

      console.log('✅')
      created++
    } catch (err) {
      console.log(`❌ ${err.message}`)
      failed++
    }
  }

  console.log(`\nDone! Created: ${created}, Failed: ${failed}`)
  await prisma.$disconnect()
}

main().catch(console.error)
