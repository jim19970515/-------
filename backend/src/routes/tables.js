const express = require('express')
const router = express.Router()
const { authenticate } = require('../middleware/auth')
const { getTables, getAllTables, createTable, updateTable, deleteTable } = require('../controllers/tables')

router.get('/', getTables)
router.get('/all', authenticate, getAllTables)
router.post('/', authenticate, createTable)
router.put('/:id', authenticate, updateTable)
router.delete('/:id', authenticate, deleteTable)

module.exports = router
