const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getTodayReport } = require('../controllers/reports')

router.get('/today', authenticate, getTodayReport)

module.exports = router
