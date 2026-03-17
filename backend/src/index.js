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

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/banners', require('./routes/banners'))
app.use('/api/tables', require('./routes/tables'))

app.get('/', (req, res) => {
  res.json({ message: 'Brunch API is running' })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
