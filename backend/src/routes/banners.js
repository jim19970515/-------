const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/banners')

router.get('/', getBanners)            // 公開：顧客前台用
router.get('/all', auth, getAllBanners) // 需驗證：後台管理用
router.post('/', auth, createBanner)
router.put('/:id', auth, updateBanner)
router.delete('/:id', auth, deleteBanner)

module.exports = router
