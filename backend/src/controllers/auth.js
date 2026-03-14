const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const login = async (req, res) => {
  const { email, password } = req.body

  // 1. 找使用者
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ message: '帳號或密碼錯誤' })
  }

  // 2. 比對密碼
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return res.status(401).json({ message: '帳號或密碼錯誤' })
  }

  // 3. 產生 JWT
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.json({ token, role: user.role })
}

module.exports = { login }
