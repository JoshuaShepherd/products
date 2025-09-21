'use client'

import { useAuth } from './AuthProvider'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function UserMenu() {
  const { user, userRole, userPermissions, signOut, loading } = useAuth()

  if (loading) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
            {user.email?.[0]?.toUpperCase()}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.email}</p>
            <p className="text-xs leading-none text-muted-foreground">
              Role: {userRole || 'viewer'}
            </p>
            {userPermissions?.length > 0 && (
              <p className="text-xs leading-none text-muted-foreground">
                Permissions: {userPermissions.join(', ')}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}