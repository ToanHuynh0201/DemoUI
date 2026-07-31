import { useMemo } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocCode, PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge, ToneText } from '@/components/common/StatusBadge'
import { priority as priorityLabels, questionStatus } from '@/lib/enums'
import { deadlineInfo, formatDateTime, formatRelative } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { isOverdue, journalistAgency, journalistName, orgName, topicName } from '@/mock/selectors'
import type { Question } from '@/mock/types'

/** Thẻ tóm tắt một câu hỏi trong hàng đợi công việc. */
function QueueCard({ question, actionLabel }: { question: Question; actionLabel: string }) {
  const db = useDb()
  const deadline = deadlineInfo(question.due_at)
  return (
    <li className="bg-card hover:border-primary/40 rounded-md border p-4 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <DocCode>{question.question_code}</DocCode>
            <StatusBadge meta={questionStatus[question.status]} />
            {question.priority !== 'NORMAL' && <StatusBadge meta={priorityLabels[question.priority]} />}
          </div>
          <p className="font-medium">{question.title}</p>
          <p className="text-muted-foreground text-xs">
            {journalistName(db, question.journalist_profile_id)} ·{' '}
            {journalistAgency(db, question.journalist_profile_id)} · {topicName(db, question.topic_id)} · gửi{' '}
            {formatRelative(question.submitted_at)}
          </p>
          {deadline && (
            <p className="text-xs">
              Hạn {formatDateTime(question.due_at)} —{' '}
              <ToneText tone={deadline.tone}>{deadline.label}</ToneText>
            </p>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/cau-hoi/${question.id}`}>
            {actionLabel}
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </li>
  )
}

function Section({
  title,
  description,
  questions,
  actionLabel,
  emptyText,
}: {
  title: string
  description?: string
  questions: Question[]
  actionLabel: string
  emptyText: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {title}
          <span className="bg-muted text-muted-foreground rounded px-1.5 text-xs font-medium tabular">
            {questions.length}
          </span>
        </CardTitle>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </CardHeader>
      <CardContent>
        {questions.length === 0 ? (
          <EmptyState title={emptyText} />
        ) : (
          <ul className="space-y-2.5">
            {questions.map((question) => (
              <QueueCard key={question.id} question={question} actionLabel={actionLabel} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

/** E3 — Hàng đợi của điều phối viên. */
export function CoordinatorQueue() {
  const db = useDb()
  const incoming = db.questions.filter((question) => ['SUBMITTED', 'ROUTING'].includes(question.status))
  const routed = db.questions.filter((question) => question.status === 'ROUTED')
  const overdue = db.questions.filter((question) => isOverdue(question))

  return (
    <div className="space-y-5">
      <PageHeader
        module="E3"
        title="Hàng đợi điều phối"
        description="Tiếp nhận câu hỏi mới và chuyển tới đúng cơ quan phát ngôn. Câu hỏi ưu tiên Khẩn phải chuyển trong ngày."
      />
      <Section
        title="Chờ điều phối"
        description="Câu hỏi phóng viên vừa gửi, chưa xác định đơn vị xử lý."
        questions={incoming}
        actionLabel="Điều phối"
        emptyText="Không còn câu hỏi nào chờ điều phối"
      />
      <Section
        title="Đã chuyển, chờ đơn vị phân công"
        questions={routed}
        actionLabel="Xem"
        emptyText="Các đơn vị đã phân công hết"
      />
      <Section
        title="Đang quá hạn"
        description="Cần đôn đốc đơn vị xử lý hoặc xem xét định tuyến lại."
        questions={overdue}
        actionLabel="Xem"
        emptyText="Không có câu hỏi quá hạn"
      />
    </div>
  )
}

/** E4 — Việc của cán bộ xử lý. */
export function MyTasks() {
  const db = useDb()
  const user = useCurrentUser()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
  const mine = useMemo(
    () => db.questions.filter((question) => isAdmin || question.assignee_id === user?.id),
    [db, user, isAdmin],
  )
  const todo = mine.filter((question) => ['ASSIGNED', 'IN_PROGRESS'].includes(question.status))
  const waiting = mine.filter((question) =>
    ['AWAITING_CLARIFICATION', 'PENDING_APPROVAL'].includes(question.status),
  )
  const overdue = mine.filter((question) => isOverdue(question))
  const done = mine.filter((question) => question.status === 'ANSWERED')

  const drafts = db.press_releases.filter(
    (release) =>
      (isAdmin || release.drafted_by_id === user?.id) &&
      ['DRAFT', 'NEEDS_REVISION'].includes(release.status),
  )

  return (
    <div className="space-y-5">
      <PageHeader
        module="E4"
        title="Việc của tôi"
        description="Câu hỏi báo chí bạn được phân công xử lý và các bản thảo thông tin nguồn đang soạn."
      />

      {overdue.length > 0 && (
        <Section
          title="Quá hạn, cần xử lý ngay"
          questions={overdue}
          actionLabel="Xử lý"
          emptyText="Không có việc quá hạn"
        />
      )}
      <Section
        title="Đang xử lý"
        description="Soạn nội dung trả lời, yêu cầu làm rõ hoặc xin gia hạn nếu cần."
        questions={todo}
        actionLabel="Soạn trả lời"
        emptyText="Bạn không có câu hỏi nào đang chờ xử lý"
      />
      <Section
        title="Đang chờ bên khác"
        description="Chờ phóng viên làm rõ hoặc chờ lãnh đạo duyệt bản trả lời."
        questions={waiting}
        actionLabel="Xem"
        emptyText="Không có việc nào đang chờ"
      />

      {drafts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bản thảo thông tin nguồn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {drafts.map((release) => (
                <li key={release.id} className="bg-card flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <DocCode>{release.release_code}</DocCode>
                    <p className="truncate font-medium">{release.title}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/thong-cao/${release.id}`}>Tiếp tục soạn</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Section title="Đã hoàn thành" questions={done} actionLabel="Xem lại" emptyText="Chưa có việc hoàn thành" />
    </div>
  )
}

/** E4 — Hàng đợi phê duyệt của lãnh đạo cơ quan phát ngôn. */
export function ApprovalQueue() {
  const db = useDb()
  const user = useCurrentUser()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
  const inOrg = db.questions.filter((question) => isAdmin || question.handling_org_id === user?.org_id)
  const awaitingApproval = inOrg.filter((question) => question.status === 'PENDING_APPROVAL')
  const unassigned = inOrg.filter((question) => question.status === 'ROUTED')
  const overdue = inOrg.filter((question) => isOverdue(question))

  const pendingExtensions = db.extension_requests.filter((request) => {
    if (request.status !== 'PENDING_APPROVAL') return false
    const question = db.questions.find((item) => item.id === request.question_id)
    if (!question || (!isAdmin && question.handling_org_id !== user?.org_id)) return false
    return !['ANSWERED', 'CANCELLED', 'REJECTED'].includes(question.status)
  })
  const pendingReleases = db.press_releases.filter(
    (release) =>
      (isAdmin || release.publishing_org_id === user?.org_id) && release.status === 'PENDING_APPROVAL',
  )

  return (
    <div className="space-y-5">
      <PageHeader
        module="E4"
        title="Chờ bạn phê duyệt"
        description={`Việc cần quyết định của ${orgName(db, user?.org_id)}: phân công, duyệt trả lời, duyệt gia hạn và duyệt thông tin nguồn.`}
      />

      <Section
        title="Bản trả lời chờ duyệt"
        description="Kiểm tra nội dung và cảnh báo rủi ro của AI trước khi phát hành."
        questions={awaitingApproval}
        actionLabel="Duyệt"
        emptyText="Không có bản trả lời nào chờ duyệt"
      />
      <Section
        title="Câu hỏi chưa phân công"
        questions={unassigned}
        actionLabel="Phân công"
        emptyText="Đã phân công hết câu hỏi của đơn vị"
      />
      <Section title="Câu hỏi quá hạn" questions={overdue} actionLabel="Xem" emptyText="Không có câu hỏi quá hạn" />

      {pendingExtensions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đề nghị gia hạn chờ quyết định</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {pendingExtensions.map((request) => {
                const question = db.questions.find((item) => item.id === request.question_id)
                return (
                  <li key={request.id} className="bg-card flex items-center justify-between gap-3 rounded-md border p-3">
                    <div className="min-w-0">
                      <DocCode>{question?.question_code}</DocCode>
                      <p className="truncate font-medium">{question?.title}</p>
                      <p className="text-muted-foreground text-xs">{request.reason}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/cau-hoi/${request.question_id}`}>Quyết định</Link>
                    </Button>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {pendingReleases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin nguồn chờ duyệt phát hành</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {pendingReleases.map((release) => (
                <li key={release.id} className="bg-card flex items-center justify-between gap-3 rounded-md border p-3">
                  <div className="min-w-0">
                    <DocCode>{release.release_code}</DocCode>
                    <p className="truncate font-medium">{release.title}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/thong-cao/${release.id}`}>Duyệt</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
