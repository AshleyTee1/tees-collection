require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/auth')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/orders')
const customOrderRoutes = require('./routes/customOrders')
const settingsRoutes = require('./routes/settings')

const app = express()

app.use(cors({ origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5173' }))
app.use(express.json())

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
