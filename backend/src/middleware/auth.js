const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未提供 token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { userId, role }
    next()
  } catch {
    res.status(401).json({ message: 'token 無效或已過期' })
  }
}

// 顧客 JWT（選用，不擋請求）
const optionalCustomerAuth = (req, res, next) => {
  const authHeader = req.headers['x-customer-token']
  if (!authHeader) return next()
  try {
    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET)
    if (decoded.customerId) req.customerId = decoded.customerId
  } catch {}
  next()
}

// 顧客 JWT（必須）
const authenticateCustomer = (req, res, next) => {
  const token = req.headers['x-customer-token']
  if (!token) return res.status(401).json({ message: '未登入' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.customerId = decoded.customerId
    next()
  } catch {
    res.status(401).json({ message: 'token 無效或已過期' })
  }
}

module.exports = { authenticate, authenticateCustomer, optionalCustomerAuth }
