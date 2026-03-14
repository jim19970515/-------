const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orders')

router.post('/', createOrder)                              // 公開（顧客點餐）
router.get('/', authenticate, getOrders)                   // 需登入
router.patch('/:id/status', authenticate, updateOrderStatus) // 需登入

module.exports = router