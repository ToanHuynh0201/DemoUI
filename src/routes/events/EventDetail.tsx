import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { CalendarX2, Send } from 'lucide-react'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { MetaItem, PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { badgeStatus, eventStatus, interviewRequestStatus, invitationStatus } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { journalistAgency, journalistName, orgName, userName } from '@/mock/selectors'

export function EventDetail() {
  const { id = '' } = useParams()
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()

  const event = db.events.find((item) => item.id === id)
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [orgFilter, setOrgFilter] = useState<string>('all')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [note, setNote] = useState('')

  if (!event || !user) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy sự kiện.</p>
  }

  // Không còn RBAC — tài khoản duy nhất quản lý mọi sự kiện.
  const canManage = true
  const invitations = db.invitations.filter((item) => item.event_id === event.id)
  const notInvited = db.journalist_profiles.filter(
    (profile) => profile.status === 'APPROVED' && !invitations.some((invite) => invite.journalist_profile_id === profile.id),
  )
  const notInvitedOrgIds = [...new Set(notInvited.map((profile) => profile.press_agency_id).filter(Boolean))] as string[]
  const visibleNotInvited = orgFilter === 'all' ? notInvited : notInvited.filter((profile) => profile.press_agency_id === orgFilter)
  const badges = db.press_badges.filter((item) => item.event_id === event.id)
  const checkins = db.event_checkins.filter((item) => item.event_id === event.id)
  const interviews = db.interview_requests.filter((item) => item.event_id === event.id)

  const stats = {
    accepted: invitations.filter((item) => item.status === 'ACCEPTED').length,
    declined: invitations.filter((item) => item.status === 'DECLINED').length,
    pending: invitations.filter((item) => item.status === 'SENT' || item.status === 'NO_RESPONSE').length,
    checkedIn: checkins.filter((item) => item.result === 'SUCCESS').length,
  }

  return (
    <div className="space-y-5">
      <PageHeader
        module="E5"
        backTo="/su-kien"
        backLabel="Danh sách sự kiện"
        title={event.event_name}
        description={`${orgName(db, event.org_id)} · ${event.venue}`}
        actions={<StatusBadge meta={eventStatus[event.status]} />}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin sự kiện</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-6 text-pretty">{event.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <MetaItem label="Bắt đầu">
                  <span className="font-mono text-sm tabular">{formatDateTime(event.start_time)}</span>
                </MetaItem>
                <MetaItem label="Kết thúc">
                  <span className="font-mono text-sm tabular">{formatDateTime(event.end_time)}</span>
                </MetaItem>
                <MetaItem label="Hạn phản hồi">
                  <span className="font-mono text-sm tabular">{formatDateTime(event.rsvp_deadline)}</span>
                </MetaItem>
                <MetaItem label="Người tạo">{userName(db, event.created_by_id)}</MetaItem>
              </div>
              {event.reschedule_note && (
                <div className="rounded border border-[#e4c68a] bg-[#fdf3e2] p-3 text-sm">
                  <span className="font-medium">Ghi chú dời lịch: </span>
                  {event.reschedule_note}
                </div>
              )}
              {event.cancellation_reason && (
                <div className="rounded border border-[#efb3bd] bg-[#fdeaed] p-3 text-sm text-[#8f0e22]">
                  <span className="font-medium">Lý do hủy: </span>
                  {event.cancellation_reason}
                </div>
              )}
            </CardContent>
          </Card>

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quản lý sự kiện</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {notInvited.length > 0 && event.status !== 'CANCELLED' && (
                  <ActionDialog
                    trigger={
                      <Button>
                        <Send className="size-4" />
                        Gửi giấy mời
                      </Button>
                    }
                    title="Gửi giấy mời điện tử"
                    description={`Chọn phóng viên trong ${notInvited.length} hồ sơ đã duyệt chưa được mời.`}
                    confirmLabel="Gửi giấy mời"
                    onOpen={() => {
                      setSelectedProfiles([])
                      setOrgFilter('all')
                    }}
                    onConfirm={() => {
                      if (selectedProfiles.length === 0) {
                        toast.error('Chọn ít nhất một phóng viên.')
                        return false
                      }
                      store.sendInvitations(event.id, selectedProfiles)
                      toast.success(`Đã gửi giấy mời tới ${selectedProfiles.length} phóng viên.`)
                    }}
                  >
                    <Select value={orgFilter} onValueChange={setOrgFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Lọc theo cơ quan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả cơ quan</SelectItem>
                        {notInvitedOrgIds.map((orgId) => (
                          <SelectItem key={orgId} value={orgId}>
                            {orgName(db, orgId)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <label className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-sm font-medium">
                      <Checkbox
                        checked={visibleNotInvited.length > 0 && visibleNotInvited.every((profile) => selectedProfiles.includes(profile.id))}
                        onCheckedChange={(checked) => {
                          const visibleIds = visibleNotInvited.map((profile) => profile.id)
                          setSelectedProfiles((previous) =>
                            checked
                              ? [...new Set([...previous, ...visibleIds])]
                              : previous.filter((id) => !visibleIds.includes(id)),
                          )
                        }}
                      />
                      <span>Chọn tất cả</span>
                    </label>
                    <div className="max-h-64 space-y-1 overflow-y-auto">
                      {visibleNotInvited.map((profile) => (
                        <label key={profile.id} className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-sm">
                          <Checkbox
                            checked={selectedProfiles.includes(profile.id)}
                            onCheckedChange={(checked) =>
                              setSelectedProfiles((previous) =>
                                checked ? [...previous, profile.id] : previous.filter((item) => item !== profile.id),
                              )
                            }
                          />
                          <span>{journalistName(db, profile.id)}</span>
                          <span className="text-muted-foreground text-xs">{journalistAgency(db, profile.id)}</span>
                        </label>
                      ))}
                    </div>
                  </ActionDialog>
                )}

                {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
                  <ActionDialog
                    trigger={<Button variant="outline">Dời lịch</Button>}
                    title="Dời lịch sự kiện"
                    description="Toàn bộ phóng viên đã phản hồi sẽ được yêu cầu xác nhận lại."
                    confirmLabel="Dời lịch"
                    onOpen={() => {
                      setRescheduleTime(event.start_time.slice(0, 16))
                      setNote('')
                    }}
                    onConfirm={() => {
                      if (!rescheduleTime || !note.trim()) {
                        toast.error('Chọn thời gian mới và nhập lý do.')
                        return false
                      }
                      store.rescheduleEvent(event.id, new Date(rescheduleTime).toISOString(), note)
                      toast.success('Đã dời lịch sự kiện.')
                    }}
                  >
                    <Field label="Thời gian mới">
                      <Input type="datetime-local" value={rescheduleTime} onChange={(event) => setRescheduleTime(event.target.value)} />
                    </Field>
                    <Field label="Lý do dời lịch">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>
                )}

                {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
                  <ActionDialog
                    trigger={
                      <Button variant="destructive">
                        <CalendarX2 className="size-4" />
                        Hủy sự kiện
                      </Button>
                    }
                    title="Hủy sự kiện"
                    confirmLabel="Hủy sự kiện"
                    confirmVariant="destructive"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      if (!note.trim()) {
                        toast.error('Nhập lý do hủy.')
                        return false
                      }
                      store.cancelEvent(event.id, note)
                      toast.success('Đã hủy sự kiện.')
                    }}
                  >
                    <Field label="Lý do hủy">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>
                )}

                {event.status === 'ONGOING' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      store.sendPostEventPackage(event.id)
                      toast.success('Đã gửi tài liệu sau sự kiện và đánh dấu hoàn thành.')
                    }}
                  >
                    Gửi tài liệu sau sự kiện
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Danh sách giấy mời ({invitations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
                  <div>
                    <p className="font-medium">
                      {invitation.journalist_profile_id ? journalistName(db, invitation.journalist_profile_id) : orgName(db, invitation.press_agency_id)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {invitation.journalist_profile_id && journalistAgency(db, invitation.journalist_profile_id)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {invitation.requires_reconfirmation && (
                      <span className="text-xs text-[#8a4f06]">Cần xác nhận lại</span>
                    )}
                    <StatusBadge meta={invitationStatus[invitation.status]} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {interviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Yêu cầu phỏng vấn tại sự kiện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {interviews.map((request) => (
                  <div key={request.id} className="flex items-center justify-between border-b py-2 text-sm last:border-0">
                    <div>
                      <p className="font-medium">{request.subject}</p>
                      <p className="text-muted-foreground text-xs">{journalistName(db, request.journalist_profile_id)}</p>
                    </div>
                    <StatusBadge meta={interviewRequestStatus[request.status]} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thống kê tham dự</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <MetaItem label="Đã xác nhận">
                <span className="font-mono text-lg tabular">{stats.accepted}</span>
              </MetaItem>
              <MetaItem label="Từ chối">
                <span className="font-mono text-lg tabular">{stats.declined}</span>
              </MetaItem>
              <MetaItem label="Chưa phản hồi">
                <span className="font-mono text-lg tabular">{stats.pending}</span>
              </MetaItem>
              <MetaItem label="Đã check-in">
                <span className="font-mono text-lg tabular">{stats.checkedIn}</span>
              </MetaItem>
            </CardContent>
          </Card>

          {badges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thẻ tác nghiệp đã cấp ({badges.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{journalistName(db, badge.journalist_profile_id)}</span>
                    <StatusBadge meta={badgeStatus[badge.status]} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
