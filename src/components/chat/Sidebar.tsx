import type React from "react"
import { useAuth } from "../../context/AuthContext"
import { Home, MessageSquare, LogOut } from "lucide-react"

const Sidebar: React.FC = () => {
  const { logout } = useAuth()

  return (
    <div className="w-16 bg-[#0A4D68] h-screen flex flex-col items-center py-4">
      <div className="mb-8">
        <Home className="h-6 w-6 text-white" />
      </div>

      <nav className="flex-1">
        <button className="p-3 rounded-lg mb-2 bg-blue-800">
          <MessageSquare className="h-6 w-6 text-white" />
        </button>
      </nav>

      <button onClick={logout} className="p-3 rounded-lg hover:bg-blue-800">
        <LogOut className="h-6 w-6 text-white" />
      </button>
    </div>
  )
}

export default Sidebar

