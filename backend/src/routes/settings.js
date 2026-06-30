const router = require('express').Router()
const prisma = require('../lib/prisma')
const { requireAdmin } = require('../middleware/auth')

router.get('/public', async (req, res) => {
  try {
    const keys = ['whatsapp', 'ecocash_number', 'ecocash_name', 'office_address', 'office_hours']
    const rows = await prisma.setting.findMany({ where: { key: { in: keys } } })
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])))
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/', requireAdmin, async (req, res) => {
  try {
    const rows = await prisma.setting.findMany()
    const settings = Object.fromEntries(rows.map(r => [r.key, r.value]))
    res.json(settings)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/', requireAdmin, async (req, res) => {
  try {
    const updates = Object.entries(req.body)
    await Promise.all(updates.map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    ))
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
