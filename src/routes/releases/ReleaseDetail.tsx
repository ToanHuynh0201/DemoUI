import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { CheckCircle2, Download, FileText, Paperclip, Send, Undo2 } from 'lucide-react'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { AiPanel } from '@/components/common/AiPanel'
import { DocCode, MetaItem, PageHeader } from '@/components/common/PageHeader'
import { ProcessTimeline } from '@/components/common/ProcessTimeline'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { accessAction, releaseStatus, scopeType, securityLevel } from '@/lib/enums'
import { formatBytes, formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { attachmentsOf, journalistName, orgName, releaseTimeline, topicName, userName } from '@/mock/selectors'

export function ReleaseDetail() {
  const { id = '' } = useParams()
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()
  const navigate = useNavigate()

  const release = db.press_releases.find((item) => item.id === id)
  const [note, setNote] = useState('')
  const [correctionContent, setCorrectionContent] = useState('')
  const [withdrawReason, setWithdrawReason] = useState('')

  useEffect(() => {
    if (release) setCorrectionContent(release.content)
  }, [release?.id, release?.content])

  useEffect(() => {
    if (!release || !user) return
    // Ghi nhận lượt xem của người đọc (không tính chính người soạn/duyệt)
    if (release.status === 'PUBLISHED' && release.drafted_by_id !== user.id) {
      store.logReleaseAccess(release.id, 'VIEW')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [release?.id, user?.id])

  if (!release || !user) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy thông cáo.</p>
  }

  const scopes = db.release_scopes.filter((item) => item.release_id === release.id)
  const attachments = attachmentsOf(db, 'PRESS_RELEASE', release.id)
  const timeline = releaseTimeline(db, release.id)
  const correction = db.press_releases.find((item) => item.original_release_id === release.id)
  const original = release.original_release_id
    ? db.press_releases.find((item) => item.id === release.original_release_id)
    : null
  const accesses = db.release_accesses.filter((item) => item.release_id === release.id)

  // Không còn RBAC — tài khoản duy nhất thao tác được mọi bước của luồng.
  const canApprove = true
  const canSubmit = true
  const isJournalistReader = user.role === 'JOURNALIST' || user.role === 'MEDIA_ORG'

  const isEditable = release.status === 'DRAFT' || release.status === 'NEEDS_REVISION'

  const scopeLabel = () => {
    if (scopes.length === 0) return 'Toàn bộ báo chí'
    const scope = scopes[0]
    if (scope.scope_type === 'ALL') return 'Toàn bộ báo chí'
    if (scope.scope_type === 'TOPIC') return `Theo lĩnh vực: ${topicName(db, scope.topic_id)}`
    if (scope.scope_type === 'ORGANIZATION') {
      const orgNames = scopes
        .filter((item) => item.scope_type === 'ORGANIZATION')
        .map((item) => orgName(db, item.org_id))
      return `Theo cơ quan: ${orgNames.join(', ')}`
    }
    return `Theo phóng viên: ${journalistName(db, scope.journalist_profile_id)}`
  }

  return (
    <div className="space-y-5">
      <PageHeader
        module="E2"
        backTo="/thong-cao"
        backLabel="Danh sách thông cáo"
        title={release.title}
        description={`${orgName(db, release.publishing_org_id)} · ${topicName(db, release.topic_id)}`}
        actions={
          <>
            <StatusBadge meta={securityLevel[release.security_level]} />
            <StatusBadge meta={releaseStatus[release.status]} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Nội dung thông cáo</CardTitle>
              <div className="flex items-center gap-2">
                <DocCode>{release.release_code}</DocCode>
                {isEditable && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/thong-cao/${release.id}/sua`)}>
                    Sửa
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {release.summary && (
                <p className="bg-muted/40 rounded border p-3 text-sm leading-6 font-medium text-pretty">
                  {release.summary}
                </p>
              )}
              <p className="text-sm leading-7 whitespace-pre-line text-pretty">{release.content}</p>

              {attachments.length > 0 && (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-muted-foreground text-xs font-medium">Tài liệu đính kèm</p>
                  {attachments.map(({ attachment, asset }) => (
                    <button
                      key={attachment.id}
                      type="button"
                      onClick={() => {
                        if (isJournalistReader) store.logReleaseAccess(release.id, 'DOWNLOAD', asset.id)
                        toast.success(`Đã tải "${asset.display_name}" (giả lập).`)
                      }}
                      className="hover:bg-accent flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-sm"
                    >
                      <Paperclip className="text-muted-foreground size-4 shrink-0" aria-hidden />
                      <span className="flex-1 truncate">{asset.display_name}</span>
                      <span className="text-muted-foreground shrink-0">{attachment.attachment_role}</span>
                      <span className="text-muted-foreground font-mono text-xs tabular">
                        {formatBytes(asset.size_bytes)}
                      </span>
                      <Download className="text-muted-foreground size-4 shrink-0" aria-hidden />
                    </button>
                  ))}
                </div>
              )}

              {original && (
                <div className="rounded border border-[#b3cbe6] bg-[#f5f9ff] p-3 text-sm">
                  Đây là bản đính chính của <DocCode>{original.release_code}</DocCode> — {original.title}
                </div>
              )}
              {correction && (
                <div className="rounded border border-[#e4c68a] bg-[#fdf3e2] p-3 text-sm">
                  Đã có bản đính chính <DocCode>{correction.release_code}</DocCode>.{' '}
                  <button className="underline" onClick={() => navigate(`/thong-cao/${correction.id}`)}>
                    Xem bản đính chính
                  </button>
                </div>
              )}
              {release.withdrawal_reason && (
                <div className="rounded border border-[#efb3bd] bg-[#fdeaed] p-3 text-sm text-[#8f0e22]">
                  <p className="font-medium">Lý do thu hồi</p>
                  <p className="mt-0.5">{release.withdrawal_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cán bộ soạn thảo: hỗ trợ AI + trình duyệt */}
          {canSubmit && release.status !== 'PUBLISHED' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Công cụ hỗ trợ soạn thảo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AiPanel kind="summarize" inputId={release.id} />
                <AiPanel kind="suggest_title" inputId={release.id} />
                <AiPanel kind="suggest_qa" inputId={release.id} />
                {(release.status === 'DRAFT' || release.status === 'NEEDS_REVISION') && (
                  <Button
                    onClick={() => {
                      store.submitRelease(release.id)
                      toast.success('Đã trình lãnh đạo duyệt thông cáo.')
                    }}
                  >
                    <Send className="size-4" />
                    Trình lãnh đạo duyệt
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Lãnh đạo: duyệt phát hành */}
          {canApprove && release.status === 'PENDING_APPROVAL' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phê duyệt phát hành</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AiPanel kind="check_sensitive" inputId={release.id} autoRun />
                <div className="flex flex-wrap gap-2">
                  <ActionDialog
                    trigger={
                      <Button>
                        <CheckCircle2 className="size-4" />
                        Duyệt và phát hành
                      </Button>
                    }
                    title="Duyệt và phát hành thông tin nguồn"
                    description="Thông cáo sẽ được gửi ngay tới các cơ quan báo chí trong phạm vi phát hành."
                    confirmLabel="Duyệt và phát hành"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      store.decideRelease(release.id, 'APPROVE', note || 'Đồng ý phát hành.')
                      toast.success('Đã phát hành thông cáo tới báo chí.')
                    }}
                  >
                    <Field label="Ghi chú phê duyệt">
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
                    title="Trả lại thông cáo để chỉnh sửa"
                    confirmLabel="Trả lại"
                    onOpen={() => setNote('')}
                    onConfirm={() => {
                      if (!note.trim()) {
                        toast.error('Nêu rõ nội dung cần chỉnh sửa.')
                        return false
                      }
                      store.decideRelease(release.id, 'RETURN', note)
                      toast.success('Đã trả lại thông cáo để chỉnh sửa.')
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

          {/* Lãnh đạo: đính chính / thu hồi thông cáo đã phát hành */}
          {canApprove && (release.status === 'PUBLISHED' || release.status === 'CORRECTED') && !correction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Đính chính hoặc thu hồi</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <ActionDialog
                  trigger={<Button variant="outline">Tạo bản đính chính</Button>}
                  title={`Đính chính thông cáo ${release.release_code}`}
                  description="Bản đính chính là một thông cáo mới, tham chiếu tới bản gốc, cần được duyệt lại trước khi phát hành."
                  confirmLabel="Tạo bản đính chính"
                  onOpen={() => setCorrectionContent(release.content)}
                  onConfirm={() => {
                    const id = store.createCorrection(release.id, correctionContent)
                    toast.success('Đã tạo bản đính chính, đang chờ duyệt.')
                    navigate(`/thong-cao/${id}`)
                  }}
                >
                  <Field label="Nội dung đính chính">
                    <Textarea
                      value={correctionContent}
                      onChange={(event) => setCorrectionContent(event.target.value)}
                      rows={10}
                    />
                  </Field>
                </ActionDialog>
                <ActionDialog
                  trigger={<Button variant="destructive">Thu hồi thông cáo</Button>}
                  title="Thu hồi thông cáo đã phát hành"
                  description="Mọi phóng viên đã xem hoặc tải thông cáo sẽ nhận được thông báo thu hồi."
                  confirmLabel="Thu hồi"
                  confirmVariant="destructive"
                  onOpen={() => setWithdrawReason('')}
                  onConfirm={() => {
                    if (!withdrawReason.trim()) {
                      toast.error('Nhập lý do thu hồi.')
                      return false
                    }
                    store.withdrawRelease(release.id, withdrawReason)
                    toast.success('Đã thu hồi thông cáo.')
                  }}
                >
                  <Field label="Lý do thu hồi">
                    <Textarea value={withdrawReason} onChange={(event) => setWithdrawReason(event.target.value)} rows={4} />
                  </Field>
                </ActionDialog>
              </CardContent>
            </Card>
          )}

          {/* Phóng viên: tải tài liệu, xem hiệu quả khai thác nếu là người duyệt */}
          {isJournalistReader && release.status === 'PUBLISHED' && attachments.length === 0 && (
            <Card>
              <CardContent className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
                <FileText className="size-4" aria-hidden />
                Thông cáo này chưa đính kèm tài liệu.
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin phát hành</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <MetaItem label="Người soạn">{userName(db, release.drafted_by_id)}</MetaItem>
              <MetaItem label="Người duyệt">
                {release.approved_by_id ? userName(db, release.approved_by_id) : '—'}
              </MetaItem>
              <MetaItem label="Phạm vi phát hành">{scopeLabel()}</MetaItem>
              <MetaItem label="Mức bảo mật">{securityLevel[release.security_level].label}</MetaItem>
              {scopes[0] && (
                <MetaItem label="Loại phạm vi">{scopeType[scopes[0].scope_type].label}</MetaItem>
              )}
            </CardContent>
          </Card>

          {canApprove && accesses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Lượt truy cập ({accesses.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {accesses.slice(0, 8).map((access) => (
                  <div key={access.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{userName(db, access.user_id)}</span>
                    <span className="text-muted-foreground shrink-0 font-mono text-xs tabular">
                      {accessAction[access.action].label} · {formatDateTime(access.occurred_at)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dòng thời gian phát hành</CardTitle>
            </CardHeader>
            <CardContent>
              <ProcessTimeline entries={timeline} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
