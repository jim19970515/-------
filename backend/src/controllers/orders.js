const prisma = require('../lib/prisma')
const { getIO } = require('../lib/socket')

const STORE_PREFIX = '01'
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

async function generateOrderNo() {
  let orderNo
  let exists = true
  while (exists) {
    const random = Array.from({ length: 4 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
    orderNo = `${STORE_PREFIX}${random}`
    exists = !!(await prisma.order.findUnique({ where: { orderNo } }))
  }
  return orderNo
}

// POST /api/orders - 顧客建立訂單
const createOrder = async (req, res) => {
  const { tableNo, items } = req.body
  // items = [{ menuItemId: 1, quantity: 2 }, ...]

  // 1. 查出每個品項的價格
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
  })

  // 2. 計算總金額
  const totalPrice = items.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)
    return sum + parseFloat(menuItem.price) * item.quantity
  }, 0)

  // 3. 建立訂單與明細
  const orderNo = await generateOrderNo()

  const order = await prisma.order.create({
    data: {
      orderNo,
      tableNo,
      totalPrice,
      ...(req.customerId ? { customerId: req.customerId } : {}),
      items: {
        create: items.map((item) => {
          const menuItem = menuItems.find((m) => m.id === item.menuItemId)
          return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: menuItem.price,
          }
        }),
      },
    },
    include: { items: true },
  })

  getIO()?.emit('order:new', order)
  res.status(201).json(order)
}

// GET /api/orders - 取得所有訂單（需登入）
const getOrders = async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { menuItem: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders)
}

// PATCH /api/orders/:id/status - 更新訂單狀態（需登入）
const updateOrderStatus = async (req, res) => {
  const id = parseInt(req.params.id)
  const { status } = req.body

  const order = await prisma.order.update({
    where: { id },
    data: { status },
  })
  getIO()?.emit('order:updated', { id, status })
  res.json(order)
}

module.exports = { createOrder, getOrders, updateOrderStatus }