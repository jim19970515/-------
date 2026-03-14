const http = require('http')
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { init: initSocket } = require('./lib/socket')

const app = express()
const server = http.createServer(app)

initSocket(server)

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/menu', require('./routes/menu'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/reports', require('./routes/reports'))
app.use('/api/banners', require('./routes/banners'))

app.get('/', (req, res) => {
  res.json({ message: 'Brunch API is running' })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
