const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // ── 管理員帳號 ──────────────────────────────
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@brunch.com' },
    update: {},
    create: { email: 'admin@brunch.com', password: hashedPassword, role: 'ADMIN' },
  })

  // ── 清空舊資料（避免重複）────────────────────
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()

  // ── 桌號 ────────────────────────────────────
  const tableLabels = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2']
  await prisma.table.createMany({
    data: tableLabels.map((label) => ({ label, isActive: true })),
  })

  // ── 菜單分類 + 品項 ───────────────────────────
  const menuData = [
    {
      name: '招牌套餐',
      items: [
        { name: '班尼迪克蛋', price: 280, description: '水波蛋、荷蘭醬、火腿，搭配烤英式馬芬', isAvailable: true },
        { name: '法式鄉村歐姆蛋', price: 240, description: '蓬鬆歐姆蛋包裹起司與時蔬，法式風情', isAvailable: true },
        { name: '心心招牌早午餐', price: 320, description: '主廚精選：炒蛋、培根、烤麵包、沙拉、湯品', isAvailable: true },
        { name: '美式大份量早午餐', price: 350, description: '煎蛋、香腸、培根、薯餅、炒蘑菇、烤番茄', isAvailable: true },
      ],
    },
    {
      name: '輕食沙拉',
      items: [
        { name: '凱薩沙拉', price: 180, description: '羅馬生菜、帕瑪森起司、脆麵包丁、凱薩醬', isAvailable: true },
        { name: '尼斯沙拉', price: 220, description: '鮪魚、水煮蛋、橄欖、四季豆、法式油醋醬', isAvailable: true },
        { name: '藜麥鮮蔬沙拉', price: 200, description: '三色藜麥、烤彩椒、酪梨、堅果、蜂蜜芥末醬', isAvailable: true },
      ],
    },
    {
      name: '主食',
      items: [
        { name: '松露奶油義大利麵', price: 280, description: '手工寬麵、黑松露醬、帕瑪森起司', isAvailable: true },
        { name: '煙燻鮭魚貝果', price: 220, description: '奶油乳酪、煙燻鮭魚、酸豆、紫洋蔥', isAvailable: true },
        { name: '培根起司三明治', price: 195, description: '手工厚吐司、培根、起司、番茄、美乃滋', isAvailable: true },
        { name: '韓式辣炒豬肉飯', price: 250, description: '醃製豬頸肉、韓式辣醬、白飯、溫泉蛋', isAvailable: true },
      ],
    },
    {
      name: '湯品',
      items: [
        { name: '法式洋蔥湯', price: 150, description: '焦糖洋蔥、牛高湯、格魯耶爾起司烤麵包', isAvailable: true },
        { name: '番茄羅勒濃湯', price: 120, description: '新鮮番茄、羅勒葉、奶油，附法棍麵包片', isAvailable: true },
        { name: '南瓜濃湯', price: 130, description: '奶油南瓜、肉荳蔻、鮮奶油，附麵包片', isAvailable: true },
      ],
    },
    {
      name: '甜點',
      items: [
        { name: '比利時鬆餅', price: 160, description: '外酥內軟，搭配新鮮草莓、楓糖漿、打發鮮奶油', isAvailable: true },
        { name: '法式吐司', price: 150, description: '厚切雞蛋牛奶吐司，煎至金黃，佐楓糖漿與莓果', isAvailable: true },
        { name: '提拉米蘇', price: 180, description: '馬斯卡彭起司、義式濃縮咖啡、手指餅乾', isAvailable: true },
      ],
    },
    {
      name: '飲品',
      items: [
        { name: '手沖精品咖啡', price: 150, description: '每日嚴選單品豆，展現產區風味', isAvailable: true },
        { name: '玫瑰拿鐵', price: 160, description: '義式濃縮、玫瑰糖漿、香醇鮮奶，浪漫花香', isAvailable: true },
        { name: '抹茶歐蕾', price: 155, description: '日本宇治抹茶粉、溫/冰鮮奶，可選甜度', isAvailable: true },
        { name: '鮮榨柳橙汁', price: 120, description: '當日現榨，清新自然甜', isAvailable: true },
        { name: '洛神玫瑰氣泡水', price: 110, description: '洛神花、玫瑰花瓣、天然氣泡水，無加糖', isAvailable: true },
      ],
    },
    {
      name: '附餐選項',
      items: [
        { name: '升級薯條', price: 60, description: '香酥金黃薯條，附番茄醬', isAvailable: true },
        { name: '升級沙拉', price: 80, description: '時令生菜沙拉，附油醋醬或和風醬', isAvailable: true },
        { name: '加點水波蛋', price: 50, description: '半熟水波蛋一顆', isAvailable: true },
      ],
    },
  ]

  for (const cat of menuData) {
    await prisma.category.create({
      data: {
        name: cat.name,
        items: { create: cat.items },
      },
    })
  }

  const counts = menuData.reduce((sum, c) => sum + c.items.length, 0)
  console.log(`✅ Seed 完成`)
  console.log(`   帳號：admin@brunch.com / admin123`)
  console.log(`   桌號：${tableLabels.length} 桌`)
  console.log(`   分類：${menuData.length} 個，品項：${counts} 項`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
