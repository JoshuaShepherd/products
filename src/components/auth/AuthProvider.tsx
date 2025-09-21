'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

type AuthContextType = {
  user: User | null
  session: Session | null
  userRole: string | null
  userPermissions: string[]
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  userPermissions: [],
  loading: true,
  signOut: async () => {},
  hasPermission: () => false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()
  const userRole = user?.user_metadata?.role || 'user'
  const userPermissions = user?.user_metadata?.permissions || []

  const hasPermission = (permission: string) => {
    // Simplified permission check - admins have all permissions
    if (userRole === 'admin') return true
    return userPermissions.includes(permission)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        }
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Session error:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <AuthContext.Provider value={{ user, session, userRole, userPermissions, loading, signOut, hasPermission }}>
      {children}
    </AuthContext.Provider>
  )
}
