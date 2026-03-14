const prisma = require('../lib/prisma')

// GET /api/reports/today - 今日營收與熱門品項
const getTodayReport = async (req, res) => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // 今日已結帳訂單
  const orders = await prisma.order.findMany({
    where: {
      status: 'PAID',
      createdAt: { gte: todayStart, lte: todayEnd },
    },
    include: {
      items: { include: { menuItem: true } },
    },
  })

  // 今日總營收
  const totalRevenue = orders.reduce(
    (sum, order) => sum + parseFloat(order.totalPrice),
    0
  )

  // 熱門品項（統計每個品項的銷售數量）
  const itemCount = {}
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const name = item.menuItem.name
      itemCount[name] = (itemCount[name] || 0) + item.quantity
    })
  })

  const popularItems = Object.entries(itemCount)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  res.json({
    totalRevenue,
    orderCount: orders.length,
    popularItems,
  })
}

module.exports = { getTodayReport }