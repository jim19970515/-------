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
        { name: '班尼迪克蛋', price: 280, description: '水波蛋、荷蘭醬、火腿，搭配烤英式馬芬', isAvailable: true, image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80' },
        { name: '法式鄉村歐姆蛋', price: 240, description: '蓬鬆歐姆蛋包裹起司與時蔬，法式風情', isAvailable: true, image: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80' },
        { name: '心心招牌早午餐', price: 320, description: '主廚精選：炒蛋、培根、烤麵包、沙拉、湯品', isAvailable: true, image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80' },
        { name: '美式大份量早午餐', price: 350, description: '煎蛋、香腸、培根、薯餅、炒蘑菇、烤番茄', isAvailable: true, image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80' },
      ],
    },
    {
      name: '輕食沙拉',
      items: [
        { name: '凱薩沙拉', price: 180, description: '羅馬生菜、帕瑪森起司、脆麵包丁、凱薩醬', isAvailable: true, image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&q=80' },
        { name: '尼斯沙拉', price: 220, description: '鮪魚、水煮蛋、橄欖、四季豆、法式油醋醬', isAvailable: true, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' },
        { name: '藜麥鮮蔬沙拉', price: 200, description: '三色藜麥、烤彩椒、酪梨、堅果、蜂蜜芥末醬', isAvailable: true, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&q=80' },
      ],
    },
    {
      name: '主食',
      items: [
        { name: '松露奶油義大利麵', price: 280, description: '手工寬麵、黑松露醬、帕瑪森起司', isAvailable: true, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80' },
        { name: '煙燻鮭魚貝果', price: 220, description: '奶油乳酪、煙燻鮭魚、酸豆、紫洋蔥', isAvailable: true, image: 'https://images.unsplash.com/photo-1559734840-f9509ee5677f?w=400&q=80' },
        { name: '培根起司三明治', price: 195, description: '手工厚吐司、培根、起司、番茄、美乃滋', isAvailable: true, image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80' },
        { name: '韓式辣炒豬肉飯', price: 250, description: '醃製豬頸肉、韓式辣醬、白飯、溫泉蛋', isAvailable: true, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&q=80' },
      ],
    },
    {
      name: '湯品',
      items: [
        { name: '法式洋蔥湯', price: 150, description: '焦糖洋蔥、牛高湯、格魯耶爾起司烤麵包', isAvailable: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' },
        { name: '番茄羅勒濃湯', price: 120, description: '新鮮番茄、羅勒葉、奶油，附法棍麵包片', isAvailable: true, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' },
        { name: '南瓜濃湯', price: 130, description: '奶油南瓜、肉荳蔻、鮮奶油，附麵包片', isAvailable: true, image: 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=400&q=80' },
      ],
    },
    {
      name: '甜點',
      items: [
        { name: '比利時鬆餅', price: 160, description: '外酥內軟，搭配新鮮草莓、楓糖漿、打發鮮奶油', isAvailable: true, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
        { name: '法式吐司', price: 150, description: '厚切雞蛋牛奶吐司，煎至金黃，佐楓糖漿與莓果', isAvailable: true, image: 'https://images.unsplash.com/photo-1484723091739-30990014a43e?w=400&q=80' },
        { name: '提拉米蘇', price: 180, description: '馬斯卡彭起司、義式濃縮咖啡、手指餅乾', isAvailable: true, image: 'https://images.unsplash.com/photo-1542124948-dc391252a940?w=400&q=80' },
      ],
    },
    {
      name: '飲品',
      items: [
        { name: '手沖精品咖啡', price: 150, description: '每日嚴選單品豆，展現產區風味', isAvailable: true, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80' },
        { name: '玫瑰拿鐵', price: 160, description: '義式濃縮、玫瑰糖漿、香醇鮮奶，浪漫花香', isAvailable: true, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80' },
        { name: '抹茶歐蕾', price: 155, description: '日本宇治抹茶粉、溫/冰鮮奶，可選甜度', isAvailable: true, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400&q=80' },
        { name: '鮮榨柳橙汁', price: 120, description: '當日現榨，清新自然甜', isAvailable: true, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80' },
        { name: '洛神玫瑰氣泡水', price: 110, description: '洛神花、玫瑰花瓣、天然氣泡水，無加糖', isAvailable: true, image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
      ],
    },
    {
      name: '附餐選項',
      items: [
        { name: '升級薯條', price: 60, description: '香酥金黃薯條，附番茄醬', isAvailable: true, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
        { name: '升級沙拉', price: 80, description: '時令生菜沙拉，附油醋醬或和風醬', isAvailable: true, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80' },
        { name: '加點水波蛋', price: 50, description: '半熟水波蛋一顆', isAvailable: true, image: 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=400&q=80' },
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
