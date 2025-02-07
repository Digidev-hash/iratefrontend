"use client"

import type React from "react"
import { useState } from "react"
import { API_BASE_URL } from "../../config/api"
import { toast } from "react-hot-toast"

interface AddPersonModalProps {
  onClose: () => void
  onAddPerson: (newChat: any) => void
}

const AddPersonModal: React.FC<AddPersonModalProps> = ({ onClose, onAddPerson }) => {
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/conversations/create_or_get/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const newChat = await response.json()
        onAddPerson(newChat)
        onClose()
        toast.success("New conversation created")
      } else if (response.status === 404) {
        toast.error("User does not exist")
      } else {
        toast.error("Failed to add person")
      }
    } catch (error) {
      console.error("Error adding person:", error)
      toast.error("An error occurred while adding the person")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Start a New Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Start Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddPersonModal

