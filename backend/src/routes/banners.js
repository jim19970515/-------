const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/banners')

router.get('/', getBanners)
router.get('/all', authenticate, getAllBanners)
router.post('/', authenticate, createBanner)
router.put('/:id', authenticate, updateBanner)
router.delete('/:id', authenticate, deleteBanner)

module.exports = router
