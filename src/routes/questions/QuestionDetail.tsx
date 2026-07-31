import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { CheckCircle2, FileSignature, Paperclip, Send, Undo2 } from 'lucide-react'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { AiPanel } from '@/components/common/AiPanel'
import { DocCode, MetaItem, PageHeader } from '@/components/common/PageHeader'
import { ProcessTimeline } from '@/components/common/ProcessTimeline'
import { StatusBadge, ToneText } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  answerStatus,
  extensionStatus,
  priority as priorityLabels,
  questionStatus,
} from '@/lib/enums'
import { deadlineInfo, formatBytes, formatDate, formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import {
  answersOf,
  attachmentsOf,
  journalistAgency,
  journalistName,
  orgName,
  questionTimeline,
  topicName,
  userName,
} from '@/mock/selectors'

const toLocalInput = (iso?: string | null) => (iso ? iso.slice(0, 16) : '')
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : '')

export function QuestionDetail() {
  const { id = '' } = useParams()
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()

  const question = db.questions.find((item) => item.id === id)
  const answers = useMemo(() => (question ? answersOf(db, question.id) : []), [db, question])
  const editableAnswer = answers.find((item) => item.status === 'DRAFT' || item.status === 'NEEDS_REVISION')
  const pendingAnswer = answers.find((item) => item.status === 'PENDING_APPROVAL')
  const sentAnswer = answers.find((item) => item.status === 'SENT')

  const [draft, setDraft] = useState('')
  const [routeOrg, setRouteOrg] = useState('')
  const [routeDue, setRouteDue] = useState('')
  const [routeReason, setRouteReason] = useState('')
  const [assignee, setAssignee] = useState('')
  const [assignDue, setAssignDue] = useState('')
  const [assignReason, setAssignReason] = useState('')
  const [note, setNote] = useState('')
  const [clarify, setClarify] = useState('')
  const [clarifyResponse, setClarifyResponse] = useState('')
  const [extensionDue, setExtensionDue] = useState('')
  const [extensionReason, setExtensionReason] = useState('')

  useEffect(() => {
    setDraft(editableAnswer?.content ?? '')
  }, [editableAnswer?.id, editableAnswer?.content])

  if (!question || !user) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy câu hỏi.</p>
  }

  const timeline = questionTimeline(db, question.id)
  const attachments = attachmentsOf(db, 'QUESTION', question.id)
  const clarifications = db.clarification_requests.filter((item) => item.question_id === question.id)
  const extensions = db.extension_requests.filter((item) => item.question_id === question.id)
  const isClosed = ['ANSWERED', 'CANCELLED', 'REJECTED'].includes(question.status)
  const pendingExtension = isClosed ? undefined : extensions.find((item) => item.status === 'PENDING_APPROVAL')
  const routings = db.question_routings.filter((item) => item.question_id === question.id)
  const assignments = db.question_assignments.filter((item) => item.question_id === question.id)
  const duplicateOf = db.questions.find((item) => item.id === question.duplicate_of_question_id)

  // Không còn RBAC — tài khoản duy nhất thao tác được mọi bước của luồng.
  const isOwner = true
  const openStatuses = ['SUBMITTED', 'ROUTING', 'ROUTED']
  const deadline = deadlineInfo(question.due_at)

  const canRoute = !['ANSWERED', 'CANCELLED', 'REJECTED'].includes(question.status)
  const canAssign = !['ANSWERED', 'CANCELLED', 'REJECTED'].includes(question.status)
  const canDraft = !['ANSWERED', 'CANCELLED', 'REJECTED'].includes(question.status)
  const canApprove = true
  const canCancel = openStatuses.includes(question.status)

  const orgOptions = db.organizations.filter(
    (org) => org.org_type === 'SPOKESPERSON_AGENCY' || org.org_type === 'GOVERNMENT_DEPARTMENT' || org.org_type === 'DEPT_CULTURE_SPORTS_TOURISM',
  )
  const staffOptions = db.users.filter((item) => item.org_id === question.handling_org_id && (item.role === 'STAFF' || item.role === 'ADMIN' || item.role === 'SUPERADMIN'))
  /** Đếm việc đang mở của từng cán bộ, để lãnh đạo thấy ai đang quá tải khi phân công */
  const workload = (userId: string) =>
    db.questions.filter(
      (item) => item.assignee_id === userId && ['ASSIGNED', 'IN_PROGRESS', 'AWAITING_CLARIFICATION', 'PENDING_APPROVAL'].includes(item.status),
    ).length

  return (
    <div className="space-y-5">
      <PageHeader
        module="E3·E4"
        backTo={isOwner ? '/cau-hoi-cua-toi' : '/cau-hoi'}
        backLabel="Danh sách câu hỏi"
        title={question.title}
        description={`${journalistName(db, question.journalist_profile_id)} · ${journalistAgency(db, question.journalist_profile_id)}`}
        actions={
          <>
            <StatusBadge meta={priorityLabels[question.priority]} />
            <StatusBadge meta={questionStatus[question.status]} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Nội dung câu hỏi</CardTitle>
              <DocCode>{question.question_code}</DocCode>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 whitespace-pre-line text-pretty">{question.content}</p>

              {attachments.length > 0 && (
                <div className="space-y-1.5 border-t pt-3">
                  <p className="text-muted-foreground text-xs font-medium">Tài liệu phóng viên gửi kèm</p>
                  {attachments.map(({ attachment, asset }) => (
                    <div key={attachment.id} className="flex items-center gap-2 text-sm">
                      <Paperclip className="text-muted-foreground size-4 shrink-0" aria-hidden />
                      <span className="truncate">{asset.display_name}</span>
                      <span className="text-muted-foreground font-mono text-xs tabular">
                        {formatBytes(asset.size_bytes)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {duplicateOf && (
                <div className="rounded border border-[#e4c68a] bg-[#fdf3e2] p-3 text-sm text-[#8a4f06]">
                  Câu hỏi này được đánh dấu trùng với <DocCode>{duplicateOf.question_code}</DocCode> —{' '}
                  {duplicateOf.title}
                </div>
              )}
              {question.rejection_reason && (
                <div className="rounded border border-[#efb3bd] bg-[#fdeaed] p-3 text-sm text-[#8f0e22]">
                  <p className="font-medium">Lý do không tiếp nhận</p>
                  <p className="mt-0.5">{question.rejection_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Điều phối viên: phân luồng câu hỏi tới đúng cơ quan phát ngôn */}
          {canRoute && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Điều phối câu hỏi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AiPanel kind="classify_question" inputId={question.id} />
                <AiPanel kind="detect_duplicate" inputId={question.id} />
                <div className="flex flex-wrap gap-2">
                  <ActionDialog
                    trigger={<Button>{question.handling_org_id ? 'Định tuyến lại' : 'Chuyển đơn vị xử lý'}</Button>}
                    title={question.handling_org_id ? 'Định tuyến lại câu hỏi' : 'Chuyển câu hỏi tới cơ quan phát ngôn'}
                    description="Đơn vị nhận sẽ được thông báo ngay và bắt đầu tính hạn xử lý."
                    confirmLabel="Chuyển câu hỏi"
                    onOpen={() => {
                      setRouteOrg(question.handling_org_id ?? '')
                      setRouteDue(toLocalInput(question.due_at) || toLocalInput(new Date(Date.now() + 5 * 86400000).toISOString()))
                      setRouteReason('')
                    }}
                    onConfirm={() => {
                      if (!routeOrg || !routeDue) {
                        toast.error('Chọn đơn vị xử lý và hạn trả lời trước khi chuyển.')
                        return false
                      }
                      store.routeQuestion(question.id, routeOrg, fromLocalInput(routeDue), routeReason)
                      toast.success(`Đã chuyển câu hỏi tới ${orgName(db, routeOrg)}.`)
                    }}
                  >
                    <Field label="Đơn vị xử lý">
                      <Select value={routeOrg} onValueChange={setRouteOrg}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Chọn cơ quan phát ngôn" />
                        </SelectTrigger>
                        <SelectContent>
                          {orgOptions.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.org_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Hạn trả lời" hint="Câu hỏi ưu tiên Khẩn phải trả lời trong 24 giờ theo quy chế.">
                      <Input type="datetime-local" value={routeDue} onChange={(event) => setRouteDue(event.target.value)} />
                    </Field>
                    <Field label="Lý do, ghi chú">
                      <Textarea value={routeReason} onChange={(event) => setRouteReason(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>

                  <ActionDialog
                    trigger={<Button variant="outline">Từ chối tiếp nhận</Button>}
                    title="Từ chối tiếp nhận câu hỏi"
                    description="Phóng viên sẽ nhận được thông báo kèm lý do."
                    confirmLabel="Từ chối"
                    confirmVariant="destructive"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      if (!note.trim()) {
                        toast.error('Nhập lý do từ chối.')
                        return false
                      }
                      store.rejectQuestion(question.id, note)
                      toast.success('Đã từ chối tiếp nhận và thông báo tới phóng viên.')
                    }}
                  >
                    <Field label="Lý do từ chối">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
                    </Field>
                  </ActionDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lãnh đạo đơn vị: phân công cán bộ xử lý */}
          {canAssign && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân công xử lý</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  Người đang xử lý:{' '}
                  <span className="text-foreground font-medium">
                    {question.assignee_id ? userName(db, question.assignee_id) : 'chưa phân công'}
                  </span>
                </p>
                <ActionDialog
                  trigger={<Button>{question.assignee_id ? 'Phân công lại' : 'Phân công cán bộ'}</Button>}
                  title={question.assignee_id ? 'Phân công lại cán bộ xử lý' : 'Phân công cán bộ xử lý'}
                  description="Số việc đang mở của từng cán bộ hiển thị kèm tên để tránh phân công quá tải."
                  confirmLabel="Phân công"
                  onOpen={() => {
                    setAssignee(question.assignee_id ?? '')
                    setAssignDue(toLocalInput(question.due_at))
                    setAssignReason('')
                  }}
                  onConfirm={() => {
                    if (!assignee || !assignDue) {
                      toast.error('Chọn cán bộ và hạn xử lý.')
                      return false
                    }
                    store.assignQuestion(question.id, assignee, fromLocalInput(assignDue), assignReason)
                    toast.success(`Đã phân công ${userName(db, assignee)}.`)
                  }}
                >
                  <Field label="Cán bộ xử lý">
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn cán bộ" />
                      </SelectTrigger>
                      <SelectContent>
                        {staffOptions.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.full_name} — đang xử lý {workload(item.id)} việc
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Hạn xử lý">
                    <Input type="datetime-local" value={assignDue} onChange={(event) => setAssignDue(event.target.value)} />
                  </Field>
                  <Field label="Ghi chú, lý do phân công lại">
                    <Textarea value={assignReason} onChange={(event) => setAssignReason(event.target.value)} rows={3} />
                  </Field>
                </ActionDialog>
              </CardContent>
            </Card>
          )}

          {/* Cán bộ được phân công: soạn nội dung trả lời */}
          {canDraft && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Soạn nội dung trả lời</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editableAnswer?.status === 'NEEDS_REVISION' && (
                  <div className="rounded border border-[#e4c68a] bg-[#fdf3e2] p-3 text-sm text-[#8a4f06]">
                    Bản trả lời đã bị trả lại để chỉnh sửa. Xem ghi chú của lãnh đạo trong dòng thời gian bên phải.
                  </div>
                )}
                <AiPanel
                  kind="draft_answer"
                  inputId={question.id}
                  acceptLabel="Đưa vào ô soạn thảo"
                  onAccept={(result) => {
                    setDraft(result.body ?? '')
                    toast.success('Đã đưa bản nháp của AI vào ô soạn thảo. Kiểm tra lại trước khi trình duyệt.')
                  }}
                />
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={14}
                  placeholder="Nhập nội dung trả lời chính thức gửi cơ quan báo chí..."
                  className="font-sans text-sm leading-6"
                />
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!draft.trim()) {
                        toast.error('Nội dung trả lời đang trống.')
                        return
                      }
                      store.saveAnswerDraft(question.id, draft)
                      toast.success('Đã lưu bản nháp.')
                    }}
                  >
                    Lưu nháp
                  </Button>
                  <Button
                    onClick={() => {
                      if (!draft.trim()) {
                        toast.error('Nội dung trả lời đang trống.')
                        return
                      }
                      const answerId = store.saveAnswerDraft(question.id, draft)
                      store.submitAnswer(answerId)
                      toast.success('Đã trình lãnh đạo duyệt bản trả lời.')
                    }}
                  >
                    <Send className="size-4" />
                    Trình lãnh đạo duyệt
                  </Button>

                  <ActionDialog
                    trigger={<Button variant="outline">Yêu cầu phóng viên làm rõ</Button>}
                    title="Yêu cầu làm rõ nội dung câu hỏi"
                    description="Câu hỏi chuyển sang trạng thái Chờ làm rõ cho đến khi phóng viên phản hồi."
                    confirmLabel="Gửi yêu cầu"
                    onOpen={() => setClarify('')}
                    onConfirm={() => {
                      if (!clarify.trim()) {
                        toast.error('Nhập nội dung cần làm rõ.')
                        return false
                      }
                      store.requestClarification(question.id, clarify)
                      toast.success('Đã gửi yêu cầu làm rõ tới phóng viên.')
                    }}
                  >
                    <Field label="Nội dung cần phóng viên làm rõ">
                      <Textarea value={clarify} onChange={(event) => setClarify(event.target.value)} rows={4} />
                    </Field>
                  </ActionDialog>

                  <ActionDialog
                    trigger={<Button variant="outline">Xin gia hạn</Button>}
                    title="Đề nghị gia hạn thời gian xử lý"
                    description="Đề nghị được gửi tới lãnh đạo đơn vị để phê duyệt."
                    confirmLabel="Gửi đề nghị"
                    onOpen={() => {
                      setExtensionDue(toLocalInput(question.due_at))
                      setExtensionReason('')
                    }}
                    onConfirm={() => {
                      if (!extensionDue || !extensionReason.trim()) {
                        toast.error('Nhập hạn đề xuất và lý do gia hạn.')
                        return false
                      }
                      store.requestExtension(question.id, fromLocalInput(extensionDue), extensionReason)
                      toast.success('Đã gửi đề nghị gia hạn.')
                    }}
                  >
                    <Field label="Hạn hiện tại">
                      <Input value={formatDateTime(question.due_at)} readOnly className="bg-muted" />
                    </Field>
                    <Field label="Hạn đề xuất">
                      <Input type="datetime-local" value={extensionDue} onChange={(event) => setExtensionDue(event.target.value)} />
                    </Field>
                    <Field label="Lý do">
                      <Textarea value={extensionReason} onChange={(event) => setExtensionReason(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lãnh đạo: duyệt bản trả lời đang chờ */}
          {canApprove && pendingAnswer && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Duyệt bản trả lời</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/40 rounded border p-3">
                  <p className="text-muted-foreground mb-2 text-xs">
                    Phiên bản {pendingAnswer.version} · soạn bởi {userName(db, pendingAnswer.drafted_by_id)} ·{' '}
                    {formatDateTime(pendingAnswer.submitted_at)}
                  </p>
                  <p className="text-sm leading-6 whitespace-pre-line text-pretty">{pendingAnswer.content}</p>
                </div>

                <AiPanel kind="check_sensitive" inputId={pendingAnswer.id} autoRun />

                <div className="flex flex-wrap gap-2">
                  <ActionDialog
                    trigger={
                      <Button>
                        <CheckCircle2 className="size-4" />
                        Duyệt và gửi phản hồi
                      </Button>
                    }
                    title="Duyệt và gửi phản hồi chính thức"
                    description="Bản trả lời sẽ được ký số và gửi tới phóng viên qua nền tảng."
                    confirmLabel="Duyệt và gửi"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      store.decideAnswer(pendingAnswer.id, 'APPROVE', note || 'Đồng ý phát hành.')
                      toast.success('Đã duyệt, ký số và gửi phản hồi tới phóng viên.')
                    }}
                  >
                    <Field label="Ghi chú phê duyệt" hint="Ghi chú được lưu vào hồ sơ xử lý câu hỏi.">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>

                  <ActionDialog
                    trigger={
                      <Button variant="outline">
                        <Undo2 className="size-4" />
                        Trả lại chỉnh sửa
                      </Button>
                    }
                    title="Trả lại bản trả lời để chỉnh sửa"
                    confirmLabel="Trả lại"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      if (!note.trim()) {
                        toast.error('Nêu rõ nội dung cần chỉnh sửa.')
                        return false
                      }
                      store.decideAnswer(pendingAnswer.id, 'RETURN', note)
                      toast.success('Đã trả lại bản trả lời cho cán bộ soạn thảo.')
                    }}
                  >
                    <Field label="Nội dung cần chỉnh sửa">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
                    </Field>
                  </ActionDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lãnh đạo: quyết định đề nghị gia hạn */}
          {canApprove && pendingExtension && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Đề nghị gia hạn đang chờ quyết định</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <MetaItem label="Người đề nghị">{userName(db, pendingExtension.requested_by_id)}</MetaItem>
                  <MetaItem label="Hạn hiện tại">{formatDateTime(pendingExtension.current_due_at)}</MetaItem>
                  <MetaItem label="Hạn đề xuất">{formatDateTime(pendingExtension.proposed_due_at)}</MetaItem>
                </div>
                <p className="text-sm">{pendingExtension.reason}</p>
                <div className="flex flex-wrap gap-2">
                  <ActionDialog
                    trigger={<Button>Duyệt gia hạn</Button>}
                    title="Duyệt đề nghị gia hạn"
                    confirmLabel="Duyệt"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      store.decideExtension(pendingExtension.id, true, note || 'Đồng ý gia hạn.')
                      toast.success('Đã duyệt gia hạn và cập nhật hạn xử lý.')
                    }}
                  >
                    <Field label="Ghi chú quyết định">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>
                  <ActionDialog
                    trigger={<Button variant="outline">Từ chối gia hạn</Button>}
                    title="Từ chối đề nghị gia hạn"
                    confirmLabel="Từ chối"
                    confirmVariant="destructive"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      if (!note.trim()) {
                        toast.error('Nhập lý do từ chối.')
                        return false
                      }
                      store.decideExtension(pendingExtension.id, false, note)
                      toast.success('Đã từ chối đề nghị gia hạn.')
                    }}
                  >
                    <Field label="Lý do từ chối">
                      <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                    </Field>
                  </ActionDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phóng viên: phản hồi yêu cầu làm rõ và rút câu hỏi */}
          {isOwner && (
            <>
              {clarifications
                .filter((item) => !item.responded_at)
                .map((item) => (
                  <Card key={item.id} className="border-[#e4c68a] bg-[#fffcf5]">
                    <CardHeader>
                      <CardTitle className="text-base">Cơ quan xử lý đề nghị bạn làm rõ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm leading-6">{item.request_content}</p>
                      <Textarea
                        value={clarifyResponse}
                        onChange={(event) => setClarifyResponse(event.target.value)}
                        rows={4}
                        placeholder="Nhập nội dung làm rõ..."
                      />
                      <Button
                        onClick={() => {
                          if (!clarifyResponse.trim()) {
                            toast.error('Nhập nội dung phản hồi.')
                            return
                          }
                          store.respondClarification(item.id, clarifyResponse)
                          setClarifyResponse('')
                          toast.success('Đã gửi nội dung làm rõ tới cơ quan xử lý.')
                        }}
                      >
                        Gửi nội dung làm rõ
                      </Button>
                    </CardContent>
                  </Card>
                ))}

              {canCancel && (
                <ActionDialog
                  trigger={<Button variant="outline">Rút câu hỏi</Button>}
                  title="Rút câu hỏi"
                  description="Chỉ rút được khi câu hỏi chưa được cơ quan xử lý tiếp nhận."
                  confirmLabel="Rút câu hỏi"
                  confirmVariant="destructive"
                  onOpen={() => setNote('')}
                  onConfirm={() => {
                    store.cancelQuestion(question.id, note || 'Phóng viên chủ động rút câu hỏi.')
                    toast.success('Đã rút câu hỏi.')
                  }}
                >
                  <Field label="Lý do rút câu hỏi">
                    <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} />
                  </Field>
                </ActionDialog>
              )}
            </>
          )}

          {/* Phản hồi chính thức đã gửi */}
          {sentAnswer && (
            <Card className="border-[#a8d6bd]">
              <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="text-base">Phản hồi chính thức</CardTitle>
                <StatusBadge meta={answerStatus[sentAnswer.status]} />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-6 whitespace-pre-line text-pretty">{sentAnswer.content}</p>
                <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs">
                  <span>Duyệt bởi {userName(db, sentAnswer.approved_by_id)}</span>
                  <span className="font-mono tabular">{formatDateTime(sentAnswer.sent_at)}</span>
                  {sentAnswer.is_digitally_signed && (
                    <span className="flex items-center gap-1">
                      <FileSignature className="size-3.5" aria-hidden />
                      Đã ký số · <span className="font-mono">{sentAnswer.signature_transaction_id}</span>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Các phiên bản trả lời trước đó */}
          {answers.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Các phiên bản bản trả lời</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {answers.map((answer) => (
                  <details key={answer.id} className="rounded border">
                    <summary className="flex cursor-pointer flex-wrap items-center gap-2 px-3 py-2 text-sm">
                      <span className="font-mono text-xs font-medium tabular">Phiên bản {answer.version}</span>
                      <StatusBadge meta={answerStatus[answer.status]} />
                      <span className="text-muted-foreground text-xs">
                        {userName(db, answer.drafted_by_id)} · {formatDateTime(answer.created_at)}
                      </span>
                    </summary>
                    <p className="border-t px-3 py-2 text-sm leading-6 whitespace-pre-line">{answer.content}</p>
                  </details>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Cột phải: thông tin tóm tắt và dòng thời gian lưu vết */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin xử lý</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <MetaItem label="Lĩnh vực">{topicName(db, question.topic_id)}</MetaItem>
              <MetaItem label="Ưu tiên">{priorityLabels[question.priority].label}</MetaItem>
              <MetaItem label="Đơn vị xử lý">{orgName(db, question.handling_org_id)}</MetaItem>
              <MetaItem label="Người xử lý">
                {question.assignee_id ? userName(db, question.assignee_id) : 'Chưa phân công'}
              </MetaItem>
              <MetaItem label="Điều phối viên">
                {question.coordinator_id ? userName(db, question.coordinator_id) : '—'}
              </MetaItem>
              <MetaItem label="Ngày gửi">
                <span className="font-mono text-sm tabular">{formatDate(question.submitted_at)}</span>
              </MetaItem>
              <MetaItem label="Hạn phóng viên đề nghị">
                <span className="font-mono text-sm tabular">{formatDate(question.requested_deadline)}</span>
              </MetaItem>
              <MetaItem label="Hạn hệ thống ấn định">
                {deadline ? (
                  <span className="space-y-0.5">
                    <span className="block font-mono text-sm tabular">{formatDateTime(question.due_at)}</span>
                    <ToneText tone={deadline.tone}>
                      <span className="text-xs">{deadline.label}</span>
                    </ToneText>
                  </span>
                ) : (
                  <span className="text-muted-foreground">Chưa ấn định</span>
                )}
              </MetaItem>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dòng thời gian xử lý</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessTimeline entries={timeline} />
            </CardContent>
          </Card>

          {(routings.length > 0 || assignments.length > 0 || extensions.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hồ sơ phân luồng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {routings.map((item) => (
                  <div key={item.id} className="border-l-2 pl-3">
                    <p className="font-medium">
                      {item.is_rerouting ? 'Định tuyến lại' : 'Định tuyến'} → {orgName(db, item.target_org_id)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {userName(db, item.coordinator_id)} · hạn {formatDate(item.due_at)}
                    </p>
                  </div>
                ))}
                {assignments.map((item) => (
                  <div key={item.id} className="border-l-2 pl-3">
                    <p className="font-medium">
                      {item.is_reassignment ? 'Phân công lại' : 'Phân công'} → {userName(db, item.assignee_id)}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Giao bởi {userName(db, item.assigned_by_id)} · hạn {formatDate(item.due_at)}
                    </p>
                  </div>
                ))}
                {extensions.map((item) => (
                  <div key={item.id} className="border-l-2 pl-3">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      Gia hạn tới {formatDate(item.proposed_due_at)}
                      <StatusBadge meta={extensionStatus[item.status]} />
                    </p>
                    <p className="text-muted-foreground text-xs">{item.reason}</p>
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
