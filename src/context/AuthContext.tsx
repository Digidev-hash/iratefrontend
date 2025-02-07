

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"

import type { AuthState, LoginCredentials, SignupCredentials } from "../types/auth"
import { API_BASE_URL } from "../config/api"


interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (credentials: SignupCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
}

type AuthAction = 
  | { type: "LOGIN_SUCCESS"; payload: any }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload?: boolean }

  function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
      case "LOGIN_SUCCESS":
        return {
          ...state,
          isAuthenticated: true,
          user: action.payload,
          loading: false,
        }
      case "LOGOUT":
        return {
          ...state,
          isAuthenticated: false,
          user: null,
          loading: false,
        }
      case "SET_LOADING":
        return {
          ...state,
          loading: action.payload !== undefined ? action.payload : true,
        }
      default:
        return state
    }
  }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
 
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/user/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const user = await response.json()
            dispatch({ type: "LOGIN_SUCCESS", payload: user })
          } else {
            dispatch({ type: "LOGOUT" })
          }
        } catch (error) {
          console.error("Error checking auth:", error)
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.access)
        const userResponse = await fetch(`${API_BASE_URL}/auth/user/`, {
          headers: {
            Authorization: `Bearer ${data.access}`,
          },
        })
        if (userResponse.ok) {
          const user = await userResponse.json()
          dispatch({ type: "LOGIN_SUCCESS", payload: user })
        }
      } else {
        throw new Error("Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        throw new Error("Signup failed")
      }

      const data = await response.json()
      localStorage.setItem("token", data.token)
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user })
      window.location.href="/"
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    dispatch({ type: "LOGOUT" })
    window.location.href="/login"
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/user/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            const user = await response.json()
            dispatch({ type: "LOGIN_SUCCESS", payload: user })
          } else {
            dispatch({ type: "LOGOUT" })
          }
        } catch (error) {
          console.error("Error checking auth:", error)
          dispatch({ type: "LOGOUT" })
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false })
      }
    }
    checkAuth()
  }, [])

  return <AuthContext.Provider value={{ ...state, login, signup, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

