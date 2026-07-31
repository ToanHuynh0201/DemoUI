import { useState } from 'react'
import { toast } from 'sonner'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { interviewRequestStatus } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { journalistName, profileOfUser, userName } from '@/mock/selectors'
import type { InterviewRequestStatus } from '@/mock/types'

/** E5 — yêu cầu phỏng vấn: phóng viên gửi, Sở tiếp nhận và phân công. */
export function InterviewRequests() {
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()
  const profile = profileOfUser(db, user?.id)

  // Không còn RBAC — tài khoản duy nhất vừa tiếp nhận vừa gửi được yêu cầu.
  const canHandle = Boolean(user)
  const canRequest = Boolean(user)

  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [slot, setSlot] = useState('')
  const [status, setStatus] = useState<InterviewRequestStatus>('ASSIGNED')
  const [note, setNote] = useState('')

  const requests = canHandle
    ? db.interview_requests
    : db.interview_requests.filter((item) => item.journalist_profile_id === profile?.id)

  return (
    <div className="space-y-5">
      <PageHeader
        module="E5"
        title="Yêu cầu phỏng vấn"
        description={canHandle ? 'Tiếp nhận và phân công người trả lời phỏng vấn.' : 'Gửi yêu cầu phỏng vấn tới Sở.'}
        actions={
          canRequest ? (
            <ActionDialog
              trigger={<Button>Gửi yêu cầu phỏng vấn</Button>}
              title="Gửi yêu cầu phỏng vấn"
              confirmLabel="Gửi yêu cầu"
              onOpen={() => {
                setSubject('')
                setContent('')
                setSlot('')
              }}
              onConfirm={() => {
                if (!subject.trim()) {
                  toast.error('Nhập chủ đề phỏng vấn.')
                  return false
                }
                store.createInterviewRequest({
                  eventId: null,
                  subject: subject.trim(),
                  content,
                  proposedIntervieweeId: null,
                  slotStart: slot ? new Date(slot).toISOString() : null,
                  slotEnd: null,
                })
                toast.success('Đã gửi yêu cầu phỏng vấn.')
              }}
            >
              <Field label="Chủ đề phỏng vấn">
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} />
              </Field>
              <Field label="Nội dung chi tiết">
                <Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={4} />
              </Field>
              <Field label="Khung giờ đề xuất">
                <Input type="datetime-local" value={slot} onChange={(event) => setSlot(event.target.value)} />
              </Field>
            </ActionDialog>
          ) : null
        }
      />

      {requests.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Chưa có yêu cầu phỏng vấn nào" />
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{request.subject}</p>
                  <p className="text-muted-foreground text-sm">{request.content}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {journalistName(db, request.journalist_profile_id)} · đề xuất{' '}
                    {formatDateTime(request.slot_start)}
                    {request.proposed_interviewee_id && ` · đề nghị phỏng vấn ${userName(db, request.proposed_interviewee_id)}`}
                  </p>
                  {request.note && <p className="mt-1 text-sm text-pretty">{request.note}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge meta={interviewRequestStatus[request.status]} />
                  {canHandle && request.status === 'NEW' && (
                    <ActionDialog
                      trigger={
                        <Button size="sm" variant="outline">
                          Xử lý
                        </Button>
                      }
                      title="Xử lý yêu cầu phỏng vấn"
                      confirmLabel="Cập nhật"
                      onOpen={() => {
                        setStatus('ASSIGNED')
                        setNote('')
                      }}
                      onConfirm={() => {
                        store.handleInterviewRequest(request.id, status, note)
                        toast.success('Đã cập nhật yêu cầu phỏng vấn.')
                      }}
                    >
                      <Field label="Kết quả xử lý">
                        <Select value={status} onValueChange={(value) => setStatus(value as InterviewRequestStatus)}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ASSIGNED">Phân công người trả lời</SelectItem>
                            <SelectItem value="CONFIRMED">Xác nhận lịch phỏng vấn</SelectItem>
                            <SelectItem value="REJECTED">Từ chối</SelectItem>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="Ghi chú">
                        <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                      </Field>
                    </ActionDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
