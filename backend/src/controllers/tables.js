const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getTables(req, res) {
  const tables = await prisma.table.findMany({
    where: { isActive: true },
    orderBy: { label: 'asc' },
  })
  res.json(tables)
}

async function getAllTables(req, res) {
  const tables = await prisma.table.findMany({ orderBy: { label: 'asc' } })
  res.json(tables)
}

async function createTable(req, res) {
  const { label } = req.body
  if (!label) return res.status(400).json({ error: '桌號不能為空' })
  try {
    const table = await prisma.table.create({ data: { label } })
    res.status(201).json(table)
  } catch {
    res.status(409).json({ error: '桌號已存在' })
  }
}

async function updateTable(req, res) {
  const { id } = req.params
  const { isActive } = req.body
  const table = await prisma.table.update({
    where: { id: Number(id) },
    data: { isActive },
  })
  res.json(table)
}

async function deleteTable(req, res) {
  const { id } = req.params
  await prisma.table.delete({ where: { id: Number(id) } })
  res.json({ ok: true })
}

module.exports = { getTables, getAllTables, createTable, updateTable, deleteTable }
