const http = require('http')
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { init: initSocket } = require('./lib/socket')

const app = express()
const server = http.createServer(app)

initSocket(server)

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://app.localhost:8080', 'http://www.localhost:8080']

const corsOptions = { origin: allowedOrigins, credentials: true }
app.use(cors(corsOptions))
app.use(express.json())
app.use('/uploads', require('express').static(require('path').join(__dirname, '../public/uploads')))

app.use('/api/auth', require('./routes/auth'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/tables', require('./routes/tables'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/assistant', require('./routes/assistant'))
app.use('/api/customer', require('./routes/customerAuth'))
app.use('/api/customers', require('./routes/customers'))

app.get('/', (req, res) => {
  res.json({ message: 'Brunch API is running' })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
