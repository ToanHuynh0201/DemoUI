import { Navigate } from 'react-router'
import { useCurrentUser } from '@/mock/store'
import { canAny, type Capability } from '@/lib/permissions'
import { NoAccess } from './AppShell'

/** Chặn route theo quyền. Chưa đăng nhập thì đưa về màn hình đăng nhập. */
export function RequireCapability({
  capabilities,
  children,
}: {
  capabilities: Capability[]
  children: React.ReactNode
}) {
  const user = useCurrentUser()
  if (!user) return <Navigate to="/dang-nhap" replace />
  if (capabilities.length > 0 && !canAny(user.role, capabilities)) return <NoAccess />
  return <>{children}</>
}
