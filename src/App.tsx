import type React from "react"
import { useState } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import LoginForm from "./components/auth/LoginForm"
import SignupForm from "./components/auth/SignupForm"
import Sidebar from "./components/chat/Sidebar"
import ChatList from "./components/chat/ChatList"
import ChatInterface from "./components/chat/ChatInterface"

const App: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [selectedChatId, setSelectedChatId] = useState<string>("default")
  return (
    <Router basename="/">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginForm /> : <Navigate to="/" />} />
        <Route path="/signup" element={!isAuthenticated ? <SignupForm /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="flex h-screen bg-white">
      <Sidebar />
      <ChatList onSelectChat={setSelectedChatId} selectedChatId={selectedChatId} />
      <main className="flex-1">
        <ChatInterface conversationId={selectedChatId} />
      </main>
    </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App

