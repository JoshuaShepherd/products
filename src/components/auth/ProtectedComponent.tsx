'use client'

import { useAuth } from './AuthProvider'

interface ProtectedComponentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  allowedRoles?: string[]
  requiredPermission?: string
}

export function ProtectedComponent({ 
  children, 
  fallback = null, 
  allowedRoles = [],
  requiredPermission
}: ProtectedComponentProps) {
  const { user, userRole, hasPermission } = useAuth()
  
  if (!user) {
    return <>{fallback}</>
  }
  
  // Check permission first if provided
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>
  }
  
  // Then check roles if no permission specified
  if (!requiredPermission && allowedRoles.length > 0 && !allowedRoles.includes(userRole || '')) {
    return <>{fallback}</>
  }
  
  return <>{children}</>
}

// Convenience components for specific roles
export function AdminOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent allowedRoles={['admin']} fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

export function EditorOrAdmin({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  return (
    <ProtectedComponent allowedRoles={['admin', 'editor']} fallback={fallback}>
      {children}
    </ProtectedComponent>
  )
}

export function LabelMakerOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  // Allow all authenticated users for now
  const { user } = useAuth()
  return user ? <>{children}</> : <>{fallback}</>
}

// Permission-based components for specific features
export function CSSEditorOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  // Allow all authenticated users for now
  const { user } = useAuth()
  return user ? <>{children}</> : <>{fallback}</>
}

export function BatchEditorOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  // Allow all authenticated users for now  
  const { user } = useAuth()
  return user ? <>{children}</> : <>{fallback}</>
}

export function ProductsOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  // Allow all authenticated users for now
  const { user } = useAuth()
  return user ? <>{children}</> : <>{fallback}</>
}