require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const customOrderRoutes = require('./routes/customOrders')
const settingsRoutes = require('./routes/settings')

const app = express()

// Security headers
app.use(helmet())

const allowedOrigins = [
  'http://localhost:5173',
  'https://tees-collection.vercel.app',
  'https://tees-collection-ashleytee1s-projects.vercel.app',
]
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.some(o => origin.startsWith(o))) }))
app.use(express.json({ limit: '5mb' }))

// Rate limiting — max 100 requests per 15 min per IP
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}))

// Stricter limit on login — 10 attempts per 15 min per IP
app.use('/api/v1/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again in 15 minutes.' },
}))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/products', productRoutes)
app.use('/api/v1/orders', orderRoutes)
app.use('/api/v1/custom-orders', customOrderRoutes)
app.use('/api/v1/settings', settingsRoutes)

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }))

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
