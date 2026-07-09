const express = require('express')
const router = express.Router()
const prisma = require('../lib/prisma')
const { requireAuth, requireAdmin } = require('../middleware/auth')

// POST /api/v1/analytics/pageview — no auth, called by frontend on every page visit
router.post('/pageview', async (req, res) => {
  try {
    const { path } = req.body
    if (!path || typeof path !== 'string' || path.length > 500) return res.status(400).json({ error: 'Invalid path' })

    await prisma.pageView.create({
      data: {
        path,
        referrer: req.headers['referer']?.slice(0, 500) || null,
        user_agent: req.headers['user-agent']?.slice(0, 500) || null,
      },
    })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'Failed to record view' })
  }
})

// GET /api/v1/analytics — admin only
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const now = new Date()
    const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0)
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 6); startOfWeek.setHours(0, 0, 0, 0)
    const startOfMonth = new Date(now); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)

    const [totalAll, totalToday, totalWeek, totalMonth, topPages, daily] = await Promise.all([
      prisma.pageView.count(),
      prisma.pageView.count({ where: { created_at: { gte: startOfToday } } }),
      prisma.pageView.count({ where: { created_at: { gte: startOfWeek } } }),
      prisma.pageView.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.pageView.groupBy({
        by: ['path'],
        _count: { path: true },
        orderBy: { _count: { path: 'desc' } },
        take: 10,
      }),
      // Last 30 days, one row per day
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, COUNT(*)::int as views
        FROM "PageView"
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ])

    res.json({ totalAll, totalToday, totalWeek, totalMonth, topPages, daily })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to load analytics' })
  }
})

module.exports = router
