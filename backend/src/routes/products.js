const router = require('express').Router()
const multer = require('multer')
const prisma = require('../lib/prisma')
const { requireAdmin } = require('../middleware/auth')
const { uploadStream } = require('../lib/cloudinary')

const upload = multer({ storage: multer.memoryStorage() })

let productsCache = null
let cacheTime = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
function clearCache() { productsCache = null; cacheTime = 0 }

router.get('/', async (req, res) => {
  try {
    const hasFilters = req.query.category || req.query.availability || req.query.origin || req.query.minPrice || req.query.maxPrice
    if (!hasFilters) {
      if (productsCache && Date.now() - cacheTime < CACHE_TTL) {
        return res.set('Cache-Control', 'public, max-age=300').json(productsCache)
      }
      productsCache = await prisma.product.findMany({ orderBy: { created_at: 'desc' } })
      cacheTime = Date.now()
      return res.set('Cache-Control', 'public, max-age=300').json(productsCache)
    }
    const { category, availability, origin, minPrice, maxPrice } = req.query
    const where = {}
    if (category) where.category = category
    if (availability) where.availability = availability
    if (origin) where.origin = origin
    if (minPrice || maxPrice) where.price_usd = { gte: minPrice ? +minPrice : undefined, lte: maxPrice ? +maxPrice : undefined }
    const products = await prisma.product.findMany({ where, orderBy: { created_at: 'desc' } })
    res.json(products)
  } catch (e) {
    console.error('PRODUCTS ERROR:', e.code, e.meta, e.stack)
    res.status(500).json({ error: e.message, code: e.code, meta: e.meta })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!product) return res.status(404).json({ error: 'Product not found' })
    res.json(product)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.post('/', requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, origin, price_usd, price_air, price_sea, sizes, colours, availability, shipping, min_order_qty_sea, stock_qty } = req.body
    const product = await prisma.product.create({
      data: {
        name, description, category, origin,
        price_usd: +price_usd,
        price_air: price_air ? +price_air : null,
        price_sea: price_sea ? +price_sea : null,
        sizes: sizes ? JSON.parse(sizes) : [],
        colours: colours ? JSON.parse(colours) : [],
        images: req.files?.length ? await Promise.all(req.files.map(f => uploadStream(f.buffer, 'tees-collection/products'))) : [],
        availability: availability || 'in_stock',
        shipping: shipping || 'both',
        min_order_qty_sea: min_order_qty_sea ? +min_order_qty_sea : null,
        stock_qty: stock_qty !== undefined && stock_qty !== '' ? +stock_qty : null,
      },
    })
    clearCache()
    res.status(201).json(product)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.put('/:id', requireAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, origin, price_usd, price_air, price_sea, sizes, colours, availability, shipping, min_order_qty_sea, stock_qty } = req.body
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(category && { category }),
        ...(origin && { origin }),
        ...(price_usd && { price_usd: +price_usd }),
        ...(price_air !== undefined && { price_air: price_air ? +price_air : null }),
        ...(price_sea !== undefined && { price_sea: price_sea ? +price_sea : null }),
        ...(sizes && { sizes: JSON.parse(sizes) }),
        ...(colours && { colours: JSON.parse(colours) }),
        ...(availability && { availability }),
        ...(shipping && { shipping }),
        ...(min_order_qty_sea !== undefined && { min_order_qty_sea: min_order_qty_sea ? +min_order_qty_sea : null }),
        ...(stock_qty !== undefined && { stock_qty: stock_qty !== '' ? +stock_qty : null }),
        ...(req.files?.length && { images: await Promise.all(req.files.map(f => uploadStream(f.buffer, 'tees-collection/products'))) }),
      },
    })
    clearCache()
    res.json(product)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    clearCache()
    res.status(204).end()
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

module.exports = router
