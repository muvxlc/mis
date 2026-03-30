declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name: string
    role: 'superadmin' | 'admin' | 'user'
  }

  interface UserSession {
    user: User
  }
}

export {}
