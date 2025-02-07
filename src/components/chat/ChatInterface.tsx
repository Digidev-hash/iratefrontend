"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../context/AuthContext"
import { API_BASE_URL } from "../../config/api"
import { createWebSocket } from "../../utils/websocket"

interface Message {
  id: string
  content: string
  sender: {
    id: string
    username: string
  }
  timestamp: string
}

interface ChatInterfaceProps {
  conversationId: string
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const { user } = useAuth()
  const socketRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (conversationId === "default") {
      setMessages([])
      return
    }

    socketRef.current = createWebSocket(conversationId)
console.log("ci",conversationId)
    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMessages((prevMessages) => [...prevMessages, data])
    }

    fetchMessages()
    markMessagesAsRead()

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, []) //Removed unnecessary dependency

  const fetchMessages = async () => {
    if (conversationId === "default") {
      setMessages([])
      return
    }
    try {
      const response = await fetch(`${API_BASE_URL}/messages/?conversation=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    }
  }

  const markMessagesAsRead = async () => {
    if (conversationId === "default") return
    try {
      await fetch(`${API_BASE_URL}/messages/mark_as_read/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ conversation_id: conversationId }),
      })
    } catch (error) {
      console.error("Error marking messages as read:", error)
    }
  }

  const sendMessage = () => {
    if (inputMessage.trim() && user && conversationId !== "default" && socketRef.current) {
      const message = {
        type: "chat_message",
        message: inputMessage,
        sender_id: user.id,
        sender_username: user.username,
        conversation_id: conversationId,
      }
      socketRef.current.send(JSON.stringify(message))
      setInputMessage("")
    }
  }
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (conversationId === "default") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-xl text-gray-500">Select a chat to start messaging</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender.id === user?.id ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender.id === user?.id ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 text-gray-500">{formatTimestamp(message.timestamp)}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatInterface

