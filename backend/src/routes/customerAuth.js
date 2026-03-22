const express = require('express')
const router = express.Router()
const { authenticateCustomer } = require('../middleware/auth')
const { googleLogin, updateProfile, getMe } = require('../controllers/customerAuth')

router.post('/google', googleLogin)
router.put('/profile', authenticateCustomer, updateProfile)
router.get('/me', authenticateCustomer, getMe)

module.exports = router
