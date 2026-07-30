import { toast } from 'sonner'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { profileRequestType } from '@/lib/enums'
import { formatDate, formatRelative } from '@/lib/format'
import { useDb, useStore } from '@/mock/store'
import { orgName, userById } from '@/mock/selectors'
import { useState } from 'react'

/** E1 — hàng đợi duyệt hồ sơ phóng viên: đăng ký mới, gia hạn, cập nhật thông tin. */
export function ProfileApprovals() {
  const db = useDb()
  const store = useStore()
  const [note, setNote] = useState('')

  const pending = db.profile_requests
    .filter((request) => request.status === 'PENDING_APPROVAL')
    .sort((left, right) => left.submitted_at.localeCompare(right.submitted_at))

  return (
    <div className="space-y-5">
      <PageHeader
        module="E1"
        title="Duyệt hồ sơ phóng viên"
        description="Yêu cầu đăng ký mới, gia hạn hoặc cập nhật thông tin hồ sơ nhà báo đang chờ phê duyệt."
      />

      {pending.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Không có yêu cầu nào chờ duyệt" />
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((request) => {
            const profile = db.journalist_profiles.find((item) => item.id === request.profile_id)
            const account = profile ? userById(db, profile.user_id) : null
            return (
              <Card key={request.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{account?.full_name}</p>
                      <StatusBadge meta={profileRequestType[request.request_type]} dot={false} />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {profile ? orgName(db, profile.press_agency_id) : '—'}
                    </p>
                    <p className="text-sm">{request.changed_summary}</p>
                    <p className="text-muted-foreground text-xs">
                      Gửi {formatRelative(request.submitted_at)} · {formatDate(request.submitted_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <ActionDialog
                      trigger={<Button size="sm">Duyệt</Button>}
                      title="Phê duyệt yêu cầu hồ sơ"
                      confirmLabel="Duyệt"
                      onOpen={() => setNote('')}
                      onConfirm={() => {
                        store.decideProfileRequest(request.id, true, note)
                        toast.success('Đã phê duyệt hồ sơ.')
                      }}
                    >
                      <Field label="Ghi chú (không bắt buộc)">
                        <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                      </Field>
                    </ActionDialog>
                    <ActionDialog
                      trigger={
                        <Button size="sm" variant="outline">
                          Từ chối
                        </Button>
                      }
                      title="Từ chối yêu cầu hồ sơ"
                      confirmLabel="Từ chối"
                      confirmVariant="destructive"
                      onOpen={() => setNote('')}
                      onConfirm={() => {
                        if (!note.trim()) {
                          toast.error('Nhập lý do từ chối.')
                          return false
                        }
                        store.decideProfileRequest(request.id, false, note)
                        toast.success('Đã từ chối yêu cầu.')
                      }}
                    >
                      <Field label="Lý do từ chối">
                        <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                      </Field>
                    </ActionDialog>
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
