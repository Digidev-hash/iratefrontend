import { WS_BASE_URL } from "../config/api"

export function createWebSocket(conversationId: string) {
  const token = localStorage.getItem("token")
  const socket = new WebSocket(`${WS_BASE_URL}/chat/${conversationId}/?token=${token}`)

  socket.onopen = () => {
    console.log("WebSocket connection established")
  }

  socket.onclose = (event) => {
    console.log("WebSocket connection closed", event)
  }

  socket.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  return socket
}

