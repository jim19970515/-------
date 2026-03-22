const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getCustomers } = require('../controllers/customerAuth')

router.get('/', authenticate, getCustomers)

module.exports = router
