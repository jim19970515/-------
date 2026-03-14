const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const {
  getMenu,
  createCategory,
  createItem,
  updateItem,
  deleteItem,
} = require('../controllers/menu')

router.get('/', getMenu)                              // 公開
router.post('/categories', authenticate, createCategory)  // 需登入
router.post('/items', authenticate, createItem)           // 需登入
router.put('/items/:id', authenticate, updateItem)        // 需登入
router.delete('/items/:id', authenticate, deleteItem)     // 需登入

module.exports = router