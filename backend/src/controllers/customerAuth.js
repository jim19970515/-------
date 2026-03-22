const { OAuth2Client } = require('google-auth-library')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// POST /api/customer/auth/google
const googleLogin = async (req, res) => {
  const { credential } = req.body
  if (!credential) return res.status(400).json({ message: '缺少 credential' })

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
  const { sub: googleId, email, name, picture } = ticket.getPayload()

  let customer = await prisma.customer.findUnique({ where: { googleId } })
  const isNew = !customer

  if (!customer) {
    customer = await prisma.customer.create({
      data: { googleId, email, name, avatar: picture },
    })
  }

  const token = jwt.sign(
    { customerId: customer.id, email: customer.email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

  res.json({ token, customer, isNew })
}

// PUT /api/customer/profile
const updateProfile = async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ message: '請填入手機號碼' })

  const customer = await prisma.customer.update({
    where: { id: req.customerId },
    data: { phone },
  })
  res.json(customer)
}

// GET /api/customer/me
const getMe = async (req, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.customerId } })
  if (!customer) return res.status(404).json({ message: '找不到會員' })
  res.json(customer)
}

// GET /api/customers (admin)
const getCustomers = async (req, res) => {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })
  res.json(customers)
}

module.exports = { googleLogin, updateProfile, getMe, getCustomers }
