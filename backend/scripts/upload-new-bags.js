/**
 * Upload all new bag products from the new stock folder to Cloudinary,
 * then create them via the admin API.
 *
 * Run from backend folder:
 *   node scripts/upload-new-bags.js
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

// ── Product definitions ──────────────────────────────────────────────────────

const PRODUCTS = [
  {
    name: 'Coach Double Pocket Shoulder Bag',
    description: 'Crescent-shaped shoulder bag with two front buckle pockets and gold hardware. Comes with a long crossbody strap. Multiple colours available. By order from China — air shipping standard, sea shipping available for bulk orders (MOQ 3).',
    folder: 'tees-collection/coach-double-pocket',
    colours: ['Beige/Brown', 'Brown/Orange', 'Brown', 'Pink', 'White', 'Black'],
    price_usd: 35, price_air: 35, price_sea: 17, min_order_qty_sea: 3,
    availability: 'by_order', shipping: 'air',
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
    name: 'Coach Mini Barrel Bag',
    description: 'Compact barrel-shaped bag with gold "C" charm keychain, dual top handles and removable crossbody strap. Multiple colours and prints available. By order from China — sea shipping available for bulk orders (MOQ 10).',
    folder: 'tees-collection/coach-mini-barrel',
    colours: ['Rainbow Print', 'Pink', 'Black', 'Tan Hearts Print', 'Red', 'Navy Denim'],
    price_usd: 25, price_air: 25, price_sea: 12, min_order_qty_sea: 10,
    availability: 'by_order', shipping: 'air',
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
    name: 'Coach Embossed Leather Backpack',
    description: 'Full-size backpack in embossed signature leather with front zip pocket and gold hardware. Roomy and elegant — perfect for everyday use. Multiple colours available. By order from China — sea shipping available for bulk orders (MOQ 5).',
    folder: 'tees-collection/coach-embossed-backpack',
    colours: ['White', 'Brown', 'Red', 'Tan', 'Pink', 'Mint Green', 'Black'],
    price_usd: 35, price_air: 35, price_sea: 17, min_order_qty_sea: 5,
    availability: 'by_order', shipping: 'air',
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
    name: 'Coach Signature Canvas Backpack',
    description: 'Classic backpack in Coach signature canvas print with front zip pocket and leather trim. Light, stylish, and spacious. Multiple colours available. By order from China — sea shipping available.',
    folder: 'tees-collection/coach-canvas-backpack',
    colours: ['Pink', 'Baby Blue', 'Cream/White', 'Tan', 'Black', 'Brown Canvas', 'Dark Brown'],
    price_usd: 35, price_air: 35, price_sea: 17, min_order_qty_sea: 0,
    availability: 'by_order', shipping: 'air',
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
    name: 'Coach Signature Belt Bag',
    description: 'Oval-shaped belt/crossbody bag with branded COACH strap and front zip pocket. Wear as a fanny pack or crossbody. Multiple colours available. By order from China — sea shipping available.',
    folder: 'tees-collection/coach-belt-bag',
    colours: ['Black', 'Brown', 'Blue', 'White', 'Pink', 'Cream/Beige'],
    price_usd: 15, price_air: 15, price_sea: 9, min_order_qty_sea: 0,
    availability: 'by_order', shipping: 'air',
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
    // IN STOCK — 17 designs, 1 of each. Also available by sea bulk order.
    name: 'Coach Mini Vanity Box Bag',
    description: '17 unique designs available now at our Harare office — 1 of each. Adorable mini cylinder vanity bag with top handle, gold chain strap, and gold "C" charm. Comes gift-boxed. Also available by bulk sea order at $10 each (MOQ 10). Enquire via WhatsApp.',
    folder: 'tees-collection/coach-mini-vanity',
    colours: ['Pink Hearts Canvas', 'White Hearts Canvas', 'Rainbow Multicolor', 'Caramel', 'Navy Denim', 'White Embossed', 'Black Embossed', 'Dark Grey Canvas', 'Brown Embossed', 'Red Embossed', 'Hot Pink', 'Tan/Orange Trim', 'Classic Canvas', 'Pink Canvas', 'Black & White', 'Dark Brown Canvas', 'Mixed Design'],
    price_usd: 25, price_air: 25, price_sea: 10, min_order_qty_sea: 10,
    availability: 'in_stock', shipping: 'air', stock_qty: 17,
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
    name: 'Coach Drawstring Bucket Bag',
    description: 'Chic drawstring bucket bag in pastel rainbow signature canvas. Light and roomy — perfect for everyday use. Dimensions: 17×11×18cm. Multiple gradient colours available. By order from China — sea shipping available.',
    folder: 'tees-collection/coach-bucket-bag',
    colours: ['White/Pastel', 'Blue/Lavender', 'Pink/Lilac', 'Purple', 'Pink/Blue', 'Lilac', 'Multicolor', 'Pastel Mix'],
    price_usd: 25, price_air: 25, price_sea: 13, min_order_qty_sea: 0,
    availability: 'by_order', shipping: 'air',
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
    name: 'LV Style Boston Handbag',
    description: 'Elegant Boston-style handbag with signature monogram pattern, gold zipper with logo pull, inner pocket, and matching shoulder strap. L22×H15×W11cm. Multiple prints available. By order from China — sea shipping available for bulk orders (MOQ 10).',
    folder: 'tees-collection/lv-boston-bag',
    colours: ['Brown Monogram', 'Dark Brown Checker', 'Black Monogram', 'White Multicolor', 'Tan Monogram', 'Black Multicolor', 'White Checker'],
    price_usd: 27, price_air: 27, price_sea: 15, min_order_qty_sea: 10,
    availability: 'by_order', shipping: 'air',
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
    name: 'Chanel Style Multi-Pocket Shoulder Bag',
    description: 'Quilted leather shoulder bag with multiple front pockets, vintage chain strap, and CC logo clasp. Soft and spacious. 28×21×14cm. 8 colours available. By order from China — sea shipping available for bulk orders (MOQ 3).',
    folder: 'tees-collection/chanel-multi-pocket',
    colours: ['Beige', 'Red', 'Black', 'Dark Navy', 'Caramel', 'Chocolate', 'White', 'Pink'],
    price_usd: 35, price_air: 35, price_sea: 17, min_order_qty_sea: 3,
    availability: 'by_order', shipping: 'air',
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

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Login failed: ${res.status} ${txt}`)
  }
  const { token } = await res.json()
  return token
}

async function createProduct(token, data) {
  const body = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (Array.isArray(v)) body.append(k, JSON.stringify(v))
    else if (v !== undefined && v !== null) body.append(k, String(v))
  })

  const res = await fetch(`${API_BASE}/api/v1/products`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Create product failed: ${res.status} ${txt}`)
  }
  return res.json()
}

// ── Main ─────────────────────────────────────────────────────────────────────

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

    console.log(`  Creating product with ${imageUrls.length} images...`)
    const created = await createProduct(token, {
      name: product.name,
      description: product.description,
      category: 'handbags',
      origin: 'china',
      availability: product.availability,
      shipping: product.shipping,
      price_usd: product.price_usd,
      price_air: product.price_air,
      price_sea: product.price_sea,
      min_order_qty_sea: product.min_order_qty_sea,
      stock_qty: product.stock_qty,
      colours: product.colours,
      sizes: [],
      unit: 'bag',
      imageUrls,
    })
    console.log(`  ✓ Created: ${created.id}`)
  }

  console.log('\n\n✅ All products uploaded successfully!')
}

main().catch(e => { console.error('\n❌ Error:', e.message); process.exit(1) })
