const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const sign = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' })

router.post('/register', async (req, res) => {
  try {
    const { name, email, whatsapp, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Missing required fields' })
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email already in use' })
    const password_hash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({ data: { name, email, whatsapp, password_hash } })
    res.status(201).json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
    res.json({ token: sign(user), user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
