/**
 * Fix: re-upload bag images to Cloudinary and PATCH each product via PUT.
 * Run after deploying the updated products.js (PUT now supports imageUrls).
 *
 *   node scripts/fix-bag-images.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const path = require('path')
const { Readable } = require('stream')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const API_BASE = 'https://tees-collection.onrender.com'
const ADMIN_EMAIL = 'goweratanatswa@gmail.com'
const ADMIN_PASS = 'changeme123'
const STOCK_DIR = "C:/Users/USER/Documents/Tee's collection/new stock"

// Product IDs from the original upload run
const PRODUCTS = [
  {
    id: 'cmr8x3u5i00001jgdymd4a93w',
    name: 'Coach Double Pocket Shoulder Bag',
    folder: 'tees-collection/coach-double-pocket',
    files: [
      'WhatsApp Image 2026-07-04 at 9.41.23 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.41.24 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.41.24 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.41.24 PM (3).jpeg',
      'WhatsApp Image 2026-07-04 at 9.41.25 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.41.25 PM (1).jpeg',
    ],
  },
  {
    id: 'cmr8x3zqe00011jgdrp9kkmf7',
    name: 'Coach Mini Barrel Bag',
    folder: 'tees-collection/coach-mini-barrel',
    files: [
      'WhatsApp Image 2026-07-04 at 9.43.58 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.43.58 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.43.58 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.43.59 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.43.59 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.43.59 PM (2).jpeg',
    ],
  },
  {
    id: 'cmr8x44ei00021jgd94rwxcbz',
    name: 'Coach Embossed Leather Backpack',
    folder: 'tees-collection/coach-embossed-backpack',
    files: [
      'WhatsApp Image 2026-07-04 at 9.44.26 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.26 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.26 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.27 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.27 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.27 PM (2).jpeg',
    ],
  },
  {
    id: 'cmr8x48cd00031jgd8qos724x',
    name: 'Coach Signature Canvas Backpack',
    folder: 'tees-collection/coach-canvas-backpack',
    files: [
      'WhatsApp Image 2026-07-04 at 9.45.12 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.45.13 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.45.13 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.45.13 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.45.14 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.45.14 PM (1).jpeg',
    ],
  },
  {
    id: 'cmr8x4cau00041jgdgwuxoc90',
    name: 'Coach Signature Belt Bag',
    folder: 'tees-collection/coach-belt-bag',
    files: [
      'WhatsApp Image 2026-07-04 at 9.44.51 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.52 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.52 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.52 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.52 PM (3).jpeg',
      'WhatsApp Image 2026-07-04 at 9.44.53 PM.jpeg',
    ],
  },
  {
    id: 'cmr8x561400051jgdgi7l6pvy',
    name: 'Coach Mini Vanity Box Bag',
    folder: 'tees-collection/coach-mini-vanity',
    files: [
      'WhatsApp Image 2026-07-04 at 9.46.30 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.30 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.30 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.31 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.31 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.31 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.32 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.32 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.32 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.32 PM (3).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.33 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.33 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.33 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.34 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.34 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.34 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.46.34 PM (3).jpeg',
    ],
  },
  {
    id: 'cmr8x5dgh00061jgdpm31cjdi',
    name: 'Coach Drawstring Bucket Bag',
    folder: 'tees-collection/coach-bucket-bag',
    files: [
      'WhatsApp Image 2026-07-04 at 9.51.09 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.09 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.10 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.10 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.11 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.11 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.11 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.11 PM (3).jpeg',
    ],
  },
  {
    id: 'cmr8x5jhk00071jgdmwcqker3',
    name: 'LV Style Boston Handbag',
    folder: 'tees-collection/lv-boston-bag',
    files: [
      'WhatsApp Image 2026-07-04 at 9.51.17 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.18 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.18 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.18 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.18 PM (3).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.19 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.19 PM (1).jpeg',
    ],
  },
  {
    id: 'cmr8x5p4o00081jgd5vwkt27j',
    name: 'Chanel Style Multi-Pocket Shoulder Bag',
    folder: 'tees-collection/chanel-multi-pocket',
    files: [
      'WhatsApp Image 2026-07-04 at 9.51.24 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.24 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.24 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.25 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.25 PM (1).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.25 PM (2).jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.26 PM.jpeg',
      'WhatsApp Image 2026-07-04 at 9.51.26 PM (1).jpeg',
    ],
  },
]

function uploadToCloudinary(filePath, folder) {
  return new Promise((resolve, reject) => {
    const buffer = fs.readFileSync(filePath)
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err)
      else resolve(result.secure_url)
    })
    Readable.from(buffer).pipe(stream)
  })
}

async function login() {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  if (!res.ok) throw new Error(`Login failed: ${res.status} ${await res.text()}`)
  const { token } = await res.json()
  return token
}

async function updateProduct(token, id, imageUrls) {
  const body = new FormData()
  body.append('imageUrls', JSON.stringify(imageUrls))

  const res = await fetch(`${API_BASE}/api/v1/products/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) throw new Error(`Update failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function main() {
  console.log('Logging in...')
  const token = await login()
  console.log('Logged in ✓\n')

  for (const product of PRODUCTS) {
    console.log(`\n━━ ${product.name} ━━`)
    const imageUrls = []

    for (const file of product.files) {
      const filePath = path.join(STOCK_DIR, file)
      if (!fs.existsSync(filePath)) {
        console.warn(`  ⚠ File not found: ${file}`)
        continue
      }
      process.stdout.write(`  Uploading ${file}... `)
      const url = await uploadToCloudinary(filePath, product.folder)
      imageUrls.push(url)
      console.log('✓')
    }

    if (imageUrls.length === 0) {
      console.warn(`  ⚠ No images uploaded, skipping update.`)
      continue
    }

    console.log(`  Updating product ${product.id} with ${imageUrls.length} images...`)
    await updateProduct(token, product.id, imageUrls)
    console.log(`  ✓ Updated`)
  }

  console.log('\n\n✅ All products updated with images!')
}

main().catch(e => { console.error('\n❌ Error:', e.message); process.exit(1) })
