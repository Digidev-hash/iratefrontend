"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { UserPlus } from "lucide-react"
import AddPersonModal from "./AddPersonModal"
import { API_BASE_URL } from "../../config/api"
import { useAuth } from "../../context/AuthContext"
import { toast } from "react-hot-toast"

interface Chat {
  id: string
  participants: Array<{
    id: string
    username: string
    email: string
  }>
  last_message: {
    content: string
    timestamp: string
    is_read: boolean
  } | null
  unread_count: number
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void
  selectedChatId?: string
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, selectedChatId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const { user } = useAuth()

  useEffect(() => {
    fetchChats()
  }, [])

  const fetchChats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setChats(data)
        console.log("chats",chats)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const handleAddPerson = () => {
    setIsModalOpen(true)
  }

  const handleAddPersonSuccess = (newChat: Chat) => {
    setChats((prevChats) => [...prevChats, newChat])
    toast.success("New conversation created")
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getOtherParticipant = (chat: Chat) => {
    return chat.participants.find((p) => p.id !== user?.id)
  }

  const getAvatarUrl = (name: string) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=40`
  }

  return (
    <div className="w-80 h-screen bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chats</h2>
        <button onClick={handleAddPerson} className="p-2 text-gray-600 hover:text-gray-900">
          <UserPlus size={20} />
        </button>
      </div>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)]">
          <p className="text-gray-500 mb-4">No Chats</p>
          <p className="text-gray-400 text-sm mb-4">Start a new conversation</p>
        </div>
      ) : (
        <div className="overflow-y-auto h-[calc(100vh-73px)]">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat)
            if (!otherParticipant) return null

            return (
              <div
                key={chat.id}
                className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedChatId === chat.id ? "bg-gray-50" : ""
                }`}
                onClick={() => onSelectChat(chat.id)}
              >
                <img
                  src={getAvatarUrl(otherParticipant.username) || "/placeholder.svg"}
                  alt={otherParticipant.username}
                  className="w-10 h-10 rounded-full mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-medium text-gray-900">{otherParticipant.username}</h3>
                    <div className="flex items-center">
                      {chat.last_message && (
                        <span className="text-xs text-gray-500">{formatTimestamp(chat.last_message.timestamp)}</span>
                      )}
                      {chat.unread_count > 0 && (
                        <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                  {chat.last_message ? (
                    <p className="text-sm text-gray-500 truncate pr-8">{chat.last_message.content}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No messages yet</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isModalOpen && <AddPersonModal onClose={() => setIsModalOpen(false)} onAddPerson={handleAddPersonSuccess} />}
    </div>
  )
}

export default ChatList

