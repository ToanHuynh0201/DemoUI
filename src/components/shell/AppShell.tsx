import { useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { Bell, RotateCcw } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { initials } from '@/lib/format'
import { roleCode as roleLabels } from '@/lib/enums'
import { COMMON_ITEMS, NAV } from '@/lib/nav'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { orgName, unreadNotifications } from '@/mock/selectors'

export function AppShell() {
  const user = useCurrentUser()
  const db = useDb()
  const navigate = useNavigate()
  const location = useLocation()
  const resetDemoData = useStore((state) => state.resetDemoData)
  const mainRef = useRef<HTMLElement>(null)

  // Vung cuon la <main>, khong phai window, nen chuyen trang khong tu ve dau —
  // phai tu dat lai vi tri cuon moi khi doi route.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname])

  if (!user) return null

  const sections = NAV
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPERADMIN'
  const unread = isAdmin
    ? db.notifications.filter((item) => !item.read_at).length
    : unreadNotifications(db, user.id).length

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded px-2.5 py-1.5 text-sm transition-colors',
      isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
        : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
    )

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="bg-sidebar border-sidebar-border flex h-full w-[268px] shrink-0 flex-col border-r">
        <Link to="/" className="border-sidebar-border flex h-14 items-center gap-2.5 border-b px-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded bg-white/10 font-mono text-[13px] font-bold text-white">
            PN
          </span>
          <span className="leading-tight">
            <span className="block text-[13px] font-semibold text-white">Kết nối báo chí</span>
            <span className="text-sidebar-foreground block text-[11px]">Nền tảng phát ngôn số</span>
          </span>
        </Link>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.code}>
              <div className="mb-1.5 flex items-baseline gap-1.5 px-2.5">
                <span className="text-sidebar-foreground/60 font-mono text-[10px] font-semibold">{section.code}</span>
                <span className="text-sidebar-foreground/70 text-[11px] tracking-wide uppercase">{section.title}</span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink key={item.to} to={item.to} className={linkClass}>
                    <item.icon className="size-4 shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className="border-sidebar-border space-y-0.5 border-t pt-4">
            {COMMON_ITEMS.map((item) => {
              const isNotification = item.to === '/thong-bao'
              const hasUnread = isNotification && unread > 0
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={linkClass}
                  aria-label={hasUnread ? `${item.label}, ${unread} chưa đọc` : undefined}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden />
                  <span className="flex-1 truncate" aria-hidden={hasUnread}>
                    {item.label}
                  </span>
                  {hasUnread && (
                    <span
                      aria-hidden
                      className="rounded-full bg-[#b3122b] px-1.5 text-[11px] font-semibold text-white tabular"
                    >
                      {unread}
                    </span>
                  )}
                </NavLink>
              )
            })}
          </div>
        </nav>

        <div className="border-sidebar-border text-sidebar-foreground/70 border-t px-4 py-3 text-[11px]">
          Bản demo giao diện · dữ liệu giả lập
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="bg-card z-20 flex h-14 shrink-0 items-center gap-3 border-b px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{orgName(db, user.org_id)}</p>
            <p className="text-muted-foreground truncate text-xs">{roleLabels[user.role].label}</p>
          </div>

          <Button variant="ghost" size="icon" aria-label="Thông báo" onClick={() => navigate('/thong-bao')}>
            <span className="relative">
              <Bell className="size-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-[#b3122b] text-[10px] font-semibold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="hover:bg-accent flex items-center gap-2 rounded px-1.5 py-1">
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                    {initials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-medium">{user.full_name}</span>
                  <span className="text-muted-foreground block text-xs">{user.job_title}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  resetDemoData()
                  navigate('/')
                }}
              >
                <RotateCcw className="size-4" />
                Đặt lại dữ liệu demo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
