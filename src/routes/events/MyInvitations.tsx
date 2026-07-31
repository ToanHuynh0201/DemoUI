import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { eventStatus, invitationStatus } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { orgName, profileOfUser } from '@/mock/selectors'

/** E5 — giấy mời của tôi: phóng viên xác nhận hoặc từ chối tham dự sự kiện. */
export function MyInvitations() {
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()
  const profile = profileOfUser(db, user?.id)
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'

  const invitations = db.invitations
    .filter((item) => isAdmin || item.journalist_profile_id === profile?.id)
    .map((item) => ({ invitation: item, event: db.events.find((event) => event.id === item.event_id) }))
    .filter((item): item is { invitation: typeof item.invitation; event: NonNullable<typeof item.event> } => Boolean(item.event))
    .sort((left, right) => left.event.start_time.localeCompare(right.event.start_time))

  return (
    <div className="space-y-5">
      <PageHeader module="E5" title="Giấy mời của tôi" description="Xác nhận tham dự để nhận thẻ tác nghiệp điện tử." />

      {invitations.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Chưa có giấy mời nào" />
        </div>
      ) : (
        <div className="space-y-3">
          {invitations.map(({ invitation, event }) => (
            <Card key={invitation.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0">
                  <p className="font-medium">{event.event_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {orgName(db, event.org_id)} · {event.venue} · {formatDateTime(event.start_time)}
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    <StatusBadge meta={eventStatus[event.status]} />
                    <StatusBadge meta={invitationStatus[invitation.status]} />
                    {invitation.requires_reconfirmation && invitation.status === 'ACCEPTED' && (
                      <span className="text-xs font-medium text-[#8a4f06]">Cần xác nhận lại</span>
                    )}
                  </div>
                </div>
                {(invitation.status === 'SENT' || invitation.status === 'NO_RESPONSE' || invitation.requires_reconfirmation) &&
                  event.status !== 'CANCELLED' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          store.respondInvitation(invitation.id, true)
                          toast.success('Đã xác nhận tham dự. Thẻ tác nghiệp điện tử đã được cấp.')
                        }}
                      >
                        Xác nhận tham dự
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          store.respondInvitation(invitation.id, false)
                          toast.success('Đã từ chối tham dự.')
                        }}
                      >
                        Từ chối
                      </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
