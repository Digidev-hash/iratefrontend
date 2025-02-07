export interface User {
    id: string
    email: string
    username?: string
  }
  
  export interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    loading: boolean;
  }
  
  export interface LoginCredentials {
    username: string
    password: string
  }
  
  export interface SignupCredentials extends LoginCredentials {
    password2?:string,
    email:string
  }
  
  