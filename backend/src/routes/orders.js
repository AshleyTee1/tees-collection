const router = require('express').Router()
const multer = require('multer')
const { Readable } = require('stream')
const cloudinary = require('cloudinary').v2
const prisma = require('../lib/prisma')
const { requireAuth, requireAdmin } = require('../middleware/auth')
const { sendOrderConfirmation, sendAdminAlert } = require('../lib/email')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({ storage: multer.memoryStorage() })

function uploadReceiptToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'tees-collection/receipts', public_id: filename, resource_type: 'image' },
      (err, result) => { if (err) reject(err); else resolve(result.secure_url) }
    )
    Readable.from(buffer).pipe(stream)
  })
}

function generateRef() {
  const yr = new Date().getFullYear()
  const n = String(Math.floor(Math.random() * 90000) + 10000)
  return `TC-${yr}-${n}`
}

// Place order (auth or guest)
router.post('/', upload.single('ecocash_receipt'), async (req, res) => {
  try {
    const { guest_email, guest_name, whatsapp, city, payment_method, items, subtotal_usd, shipping_cost } = req.body
    const parsedItems = typeof items === 'string' ? JSON.parse(items) : items

    // Determine auth user
    let user_id = null
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET)
        user_id = decoded.id
      } catch {}
    }

    const order = await prisma.order.create({
      data: {
        reference_number: generateRef(),
        user_id,
        guest_email: user_id ? null : guest_email,
        guest_name: user_id ? null : guest_name,
        whatsapp,
        city,
        subtotal_usd: +subtotal_usd,
        shipping_method: 'air',
        shipping_cost: +shipping_cost,
        payment_method: payment_method === 'eco' ? 'ecocash' : 'cash',
        payment_status: payment_method === 'eco' ? 'pending' : 'pending',
        order_status: payment_method === 'eco' ? 'payment_pending' : 'reserved',
        ecocash_receipt_url: req.file ? await uploadReceiptToCloudinary(req.file.buffer, `receipt-${Date.now()}`) : null,
        items: {
          create: parsedItems.map(item => ({
            product_id: item.id || null,
            name: item.name,
            price_usd: item.price_usd,
            qty: item.qty || 1,
            size: item.size || null,
            colour: item.colour || null,
            shipping: item.shipping || 'air',
          })),
        },
      },
      include: { items: true },
    })

    // Decrement stock for in-stock products
    for (const item of parsedItems) {
      if (item.id) {
        await prisma.product.updateMany({
          where: { id: item.id, availability: 'in_stock', stock_qty: { not: null } },
          data: { stock_qty: { decrement: item.qty || 1 } },
        })
      }
    }

    // Send emails (non-blocking)
    const email = user_id
      ? (await prisma.user.findUnique({ where: { id: user_id } }))?.email
      : guest_email
    if (email) sendOrderConfirmation(email, order).catch(console.error)
    sendAdminAlert(order).catch(console.error)

    res.status(201).json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin: list all orders
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query
    const orders = await prisma.order.findMany({
      where: status ? { order_status: status } : undefined,
      include: { items: true, user: { select: { name: true, email: true } } },
      orderBy: { created_at: 'desc' },
    })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Track by reference number (public)
router.get('/:ref', async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { reference_number: req.params.ref },
      include: { items: true },
    })
    if (!order) return res.status(404).json({ error: 'Order not found' })
    // Redact sensitive data for public view
    const { ecocash_receipt_url, user_id, ...safe } = order
    res.json(safe)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Admin: update order status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { order_status, payment_status } = req.body
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...(order_status && { order_status }),
        ...(payment_status && { payment_status }),
      },
    })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.orderItem.deleteMany({ where: { order_id: req.params.id } })
    await prisma.order.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
