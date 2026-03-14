const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// GET /api/banners — 公開，只回傳啟用中且依 sortOrder 排序
async function getBanners(req, res) {
  const banners = await prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  res.json(banners)
}

// GET /api/banners/all — 後台用，回傳全部
async function getAllBanners(req, res) {
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  res.json(banners)
}

// POST /api/banners
async function createBanner(req, res) {
  const { imageUrl, title, subtitle, sortOrder, isActive } = req.body
  if (!imageUrl) return res.status(400).json({ message: '圖片網址為必填' })

  const count = await prisma.banner.count()
  if (count >= 4) return res.status(400).json({ message: '最多只能有 4 個 Banner' })

  const banner = await prisma.banner.create({
    data: {
      imageUrl,
      title: title || null,
      subtitle: subtitle || null,
      sortOrder: sortOrder ?? count,
      isActive: isActive !== undefined ? isActive : true,
    },
  })
  res.status(201).json(banner)
}

// PUT /api/banners/:id
async function updateBanner(req, res) {
  const id = Number(req.params.id)
  const { imageUrl, title, subtitle, sortOrder, isActive } = req.body

  const banner = await prisma.banner.update({
    where: { id },
    data: {
      ...(imageUrl !== undefined && { imageUrl }),
      ...(title !== undefined && { title: title || null }),
      ...(subtitle !== undefined && { subtitle: subtitle || null }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive }),
    },
  })
  res.json(banner)
}

// DELETE /api/banners/:id
async function deleteBanner(req, res) {
  const id = Number(req.params.id)
  await prisma.banner.delete({ where: { id } })
  res.status(204).send()
}

module.exports = { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner }
