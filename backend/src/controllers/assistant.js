const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function chat(req, res) {
  try {
    const { message } = req.body
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: '請輸入訊息' })
    }

    const items = await prisma.menuItem.findMany({
      where: { isAvailable: true },
      include: { category: true },
    })

    const suggestedItems = mockParse(message.trim(), items)

    let reply
    if (suggestedItems.length === 0) {
      reply = '抱歉，找不到符合的品項，可以試試說「推薦我一份早餐」或直接說品項名稱喔！'
    } else if (suggestedItems.length === 1) {
      reply = `好的！幫你找到「${suggestedItems[0].name}」，要加入購物車嗎？`
    } else {
      const names = suggestedItems.map((i) => `「${i.name}」`).join('、')
      reply = `以下幾項符合你的需求：${names}，要一起加入購物車嗎？`
    }

    res.json({ reply, suggestedItems })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: '伺服器錯誤' })
  }
}

function mockParse(message, items) {
  // 1. 直接比對品項名稱
  const nameMatches = items.filter((i) => message.includes(i.name))
  if (nameMatches.length > 0) return toResult(nameMatches)

  // 2. 比對分類名稱
  const catMatches = items.filter((i) => message.includes(i.category.name))
  if (catMatches.length > 0) return toResult(catMatches.slice(0, 3))

  // 3. 推薦語
  const recommendKeywords = ['推薦', '招牌', '好吃', '有什麼', '點什麼', '來一份', '隨便', '不知道', '幫我選']
  if (recommendKeywords.some((k) => message.includes(k))) {
    const shuffled = [...items].sort(() => Math.random() - 0.5)
    return toResult(shuffled.slice(0, 3))
  }

  // 4. 飲料關鍵字
  const drinkKeywords = ['飲料', '喝', '咖啡', '茶', '果汁', '奶茶', '飲品']
  if (drinkKeywords.some((k) => message.includes(k))) {
    const drinkItems = items.filter(
      (i) => drinkKeywords.some((k) => i.name.includes(k)) || i.category.name.includes('飲'),
    )
    if (drinkItems.length > 0) return toResult(drinkItems.slice(0, 2))
  }

  // 5. 餐點關鍵字
  const mealKeywords = ['早餐', '早午餐', '套餐', '主食', '吃', '餐點', '肚子餓']
  if (mealKeywords.some((k) => message.includes(k))) {
    const mealItems = items.filter((i) => !i.category.name.includes('飲'))
    if (mealItems.length > 0) return toResult(mealItems.slice(0, 2))
  }

  return []
}

function toResult(items) {
  return items.map((i) => ({
    menuItemId: i.id,
    quantity: 1,
    name: i.name,
    price: i.price.toString(),
  }))
}

module.exports = { chat }
