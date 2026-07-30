import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { linkStatus, profileStatus } from '@/lib/enums'
import { formatDate, initials } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { userById } from '@/mock/selectors'

/** E1 — cơ quan báo chí quản lý danh sách phóng viên tòa soạn. */
export function AgencyJournalists() {
  const db = useDb()
  const user = useCurrentUser()
  const setJournalistLink = useStore((state) => state.setJournalistLink)

  const links = db.journalist_agency_links.filter((item) => item.press_agency_id === user?.org_id)

  return (
    <div className="space-y-5">
      <PageHeader
        module="E1"
        title="Phóng viên tòa soạn"
        description="Danh sách phóng viên đang liên kết với cơ quan báo chí của bạn."
      />

      {links.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Chưa có phóng viên nào liên kết" />
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => {
            const profile = db.journalist_profiles.find((item) => item.id === link.profile_id)
            const account = profile ? userById(db, profile.user_id) : null
            return (
              <Card key={link.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials(account?.full_name ?? '?')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{account?.full_name}</p>
                      <p className="text-muted-foreground text-xs">
                        Liên kết từ {formatDate(link.start_date)}
                        {link.end_date && ` đến ${formatDate(link.end_date)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {profile && <StatusBadge meta={profileStatus[profile.status]} />}
                    <StatusBadge meta={linkStatus[link.status]} />
                    {link.status === 'ACTIVE' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setJournalistLink(link.id, false, 'Tòa soạn chấm dứt liên kết.')
                          toast.success('Đã hủy liên kết với phóng viên.')
                        }}
                      >
                        Hủy liên kết
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setJournalistLink(link.id, true, 'Tòa soạn xác nhận lại liên kết.')
                          toast.success('Đã khôi phục liên kết.')
                        }}
                      >
                        Khôi phục
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
