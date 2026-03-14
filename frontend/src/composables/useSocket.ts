import { io, type Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? 'http://localhost:3000', {
      autoConnect: true,
      reconnectionAttempts: 5,
    })
  }
  return socket
}
