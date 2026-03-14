const { Server } = require('socket.io')

let io = null

function init(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })

  return io
}

function getIO() {
  return io
}

module.exports = { init, getIO }
