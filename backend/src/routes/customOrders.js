const router = require('express').Router()
const multer = require('multer')
const prisma = require('../lib/prisma')
const { requireAdmin } = require('../middleware/auth')
const { sendCustomOrderAlert } = require('../lib/email')

const upload = multer({ dest: 'uploads/custom-orders/' })

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { description, category, quantity, contact_method, contact_value, name, city } = req.body
    if (!description || !contact_method || !contact_value || !name) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const customOrder = await prisma.customOrder.create({
      data: {
        description,
        category: category || null,
        quantity: quantity ? +quantity : null,
        contact_method,
        contact_value,
        name,
        city: city || null,
        image_url: req.file ? `/uploads/custom-orders/${req.file.filename}` : null,
      },
    })
    sendCustomOrderAlert(customOrder).catch(console.error)
    res.status(201).json(customOrder)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/', requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.customOrder.findMany({ orderBy: { created_at: 'desc' } })
    res.json(orders)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status, admin_notes } = req.body
    const order = await prisma.customOrder.update({
      where: { id: req.params.id },
      data: { ...(status && { status }), ...(admin_notes !== undefined && { admin_notes }) },
    })
    res.json(order)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
