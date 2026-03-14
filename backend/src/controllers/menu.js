const prisma = require('../lib/prisma')

// GET /api/menu - 取得所有菜單（含分類）
const getMenu = async (req, res) => {
  const categories = await prisma.category.findMany({
    include: {
      items: {
        where: { isAvailable: true },
      },
    },
  })
  res.json(categories)
}

// POST /api/menu/categories - 新增分類
const createCategory = async (req, res) => {
  const { name } = req.body
  const category = await prisma.category.create({ data: { name } })
  res.status(201).json(category)
}

// POST /api/menu/items - 新增品項
const createItem = async (req, res) => {
  const { name, price, description, image, categoryId } = req.body
  const item = await prisma.menuItem.create({
    data: { name, price, description, image, categoryId },
  })
  res.status(201).json(item)
}

// PUT /api/menu/items/:id - 修改品項
const updateItem = async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, price, description, image, isAvailable, categoryId } = req.body
  const item = await prisma.menuItem.update({
    where: { id },
    data: { name, price, description, image, isAvailable, categoryId },
  })
  res.json(item)
}

// DELETE /api/menu/items/:id - 刪除品項
const deleteItem = async (req, res) => {
  const id = parseInt(req.params.id)
  await prisma.menuItem.delete({ where: { id } })
  res.status(204).send()
}

module.exports = { getMenu, createCategory, createItem, updateItem, deleteItem }
