const express = require('express')
const router = express.Router()
const { authenticate, optionalCustomerAuth } = require('../middleware/auth')
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orders')

router.post('/', optionalCustomerAuth, createOrder)        // 公開，但有登入則帶入 customerId
router.get('/', authenticate, getOrders)                   // 需登入
router.patch('/:id/status', authenticate, updateOrderStatus) // 需登入

module.exports = router