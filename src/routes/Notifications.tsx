import { useNavigate } from 'react-router'
import { CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { deliveryChannel, notificationType, severity as severityLabels } from '@/lib/enums'
import { formatDateTime, formatRelative } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import type { EntityType, ID } from '@/mock/types'
import { cn } from '@/lib/utils'

/** Đường dẫn tương ứng với thực thể được nhắc tới trong thông báo. */
function targetLink(targetType?: EntityType | null, targetId?: ID | null): string | null {
  if (!targetId) return null
  switch (targetType) {
    case 'QUESTION':
      return `/cau-hoi/${targetId}`
    case 'PRESS_RELEASE':
      return `/thong-cao/${targetId}`
    case 'EVENT':
      return `/su-kien/${targetId}`
    case 'MEDIA_ASSET':
      return `/kho-du-lieu/${targetId}`
    case 'JOURNALIST_PROFILE':
      return `/phong-vien/${targetId}`
    default:
      return null
  }
}

export function Notifications() {
  const db = useDb()
  const user = useCurrentUser()
  const navigate = useNavigate()
  const markRead = useStore((state) => state.markNotificationRead)
  const markAllRead = useStore((state) => state.markAllNotificationsRead)

  const items = db.notifications
    .filter((item) => item.recipient_id === user?.id)
    .sort((left, right) => right.created_at.localeCompare(left.created_at))
  const unreadCount = items.filter((item) => !item.read_at).length

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="Trung tâm thông báo"
        description="Toàn bộ thông báo hệ thống gửi tới bạn, kèm kênh gửi và trạng thái đã đọc."
        actions={
          unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="size-4" />
              Đánh dấu tất cả đã đọc ({unreadCount})
            </Button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState
            title="Chưa có thông báo"
            description="Thông báo sẽ xuất hiện khi có câu hỏi, thông cáo, giấy mời hoặc cảnh báo liên quan tới bạn."
          />
        </div>
      ) : (
        <ul className="bg-card divide-y overflow-hidden rounded-md border">
          {items.map((item) => {
            const link = targetLink(item.target_type, item.target_id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(item.id)
                    if (link) navigate(link)
                  }}
                  className={cn(
                    'hover:bg-accent/60 flex w-full gap-3 px-4 py-3 text-left',
                    !item.read_at && 'bg-[#f5f9ff]',
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      item.read_at ? 'bg-transparent' : 'bg-primary',
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{item.title}</span>
                      <StatusBadge meta={notificationType[item.notification_type]} dot={false} />
                      {item.severity && item.severity !== 'LOW' && (
                        <StatusBadge meta={severityLabels[item.severity]} />
                      )}
                    </span>
                    <span className="text-muted-foreground block text-sm text-pretty">{item.body}</span>
                    <span className="text-muted-foreground block font-mono text-xs tabular">
                      {formatDateTime(item.created_at)} · {formatRelative(item.created_at)} ·{' '}
                      {deliveryChannel[item.channel].label}
                      {item.delivery_status === 'FAILED' && ' · gửi thất bại'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
