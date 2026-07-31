import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { DataTable } from '@/components/common/DataTable'
import { DocCode, PageHeader } from '@/components/common/PageHeader'
import { StatusBadge, ToneText } from '@/components/common/StatusBadge'
import { priority as priorityLabels, questionStatus } from '@/lib/enums'
import { deadlineInfo, formatDate } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { isOverdue, journalistAgency, journalistName, orgName, topicName, userName } from '@/mock/selectors'
import type { Question } from '@/mock/types'

interface Row {
  id: string
  code: string
  title: string
  journalist: string
  agency: string
  topic: string
  handlingOrg: string
  assignee: string
  status: Question['status']
  statusLabel: string
  priority: Question['priority']
  priorityLabel: string
  dueAt: string | null
  submittedAt: string
  overdue: boolean
}

/**
 * Danh sách câu hỏi trong phạm vi đơn vị. Cùng một bảng phục vụ Quản trị viên Sở
 * (toàn hệ thống), Lãnh đạo và Cán bộ (câu hỏi của đơn vị mình).
 */
export function QuestionsList() {
  const db = useDb()
  const user = useCurrentUser()
  const navigate = useNavigate()

  const scoped = useMemo(() => {
    if (!user) return []
    const all = db.questions
    // Quản trị viên Sở và điều phối viên nhìn toàn hệ thống; đơn vị khác chỉ thấy việc của mình
    if (user.role === 'ADMIN' || user.role === 'SUPERADMIN' || user.role === 'COORDINATOR') return all
    return all.filter((question) => question.handling_org_id === user.org_id)
  }, [db, user])

  const rows: Row[] = useMemo(
    () =>
      scoped
        .map((question) => ({
          id: question.id,
          code: question.question_code,
          title: question.title,
          journalist: journalistName(db, question.journalist_profile_id),
          agency: journalistAgency(db, question.journalist_profile_id),
          topic: topicName(db, question.topic_id),
          handlingOrg: orgName(db, question.handling_org_id),
          assignee: question.assignee_id ? userName(db, question.assignee_id) : 'Chưa phân công',
          status: question.status,
          statusLabel: questionStatus[question.status].label,
          priority: question.priority,
          priorityLabel: priorityLabels[question.priority].label,
          dueAt: question.due_at ?? null,
          submittedAt: question.submitted_at,
          overdue: isOverdue(question),
        }))
        .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    [db, scoped],
  )

  const columns: ColumnDef<Row, unknown>[] = [
    {
      accessorKey: 'code',
      header: 'Mã câu hỏi',
      cell: ({ row }) => <DocCode>{row.original.code}</DocCode>,
    },
    {
      accessorKey: 'title',
      header: 'Nội dung',
      cell: ({ row }) => (
        <div className="max-w-md space-y-0.5">
          <p className="line-clamp-2 font-medium">{row.original.title}</p>
          <p className="text-muted-foreground text-xs">
            {row.original.journalist} · {row.original.agency}
          </p>
        </div>
      ),
    },
    { accessorKey: 'topic', header: 'Lĩnh vực' },
    { accessorKey: 'handlingOrg', header: 'Đơn vị xử lý' },
    { accessorKey: 'assignee', header: 'Người xử lý' },
    {
      accessorKey: 'priorityLabel',
      header: 'Ưu tiên',
      cell: ({ row }) => <StatusBadge meta={priorityLabels[row.original.priority]} />,
    },
    {
      accessorKey: 'statusLabel',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge meta={questionStatus[row.original.status]} />,
    },
    {
      accessorKey: 'dueAt',
      header: 'Hạn xử lý',
      cell: ({ row }) => {
        const info = deadlineInfo(row.original.dueAt)
        if (!info) return <span className="text-muted-foreground">Chưa ấn định</span>
        return (
          <div className="space-y-0.5">
            <div className="font-mono text-xs tabular">{formatDate(row.original.dueAt)}</div>
            <ToneText tone={info.tone}>
              <span className="text-xs">{info.label}</span>
            </ToneText>
          </div>
        )
      },
    },
  ]

  const facets = [
    {
      columnId: 'statusLabel',
      label: 'Trạng thái',
      options: Array.from(new Set(rows.map((row) => row.statusLabel))).map((value) => ({
        value,
        label: value,
      })),
    },
    {
      columnId: 'topic',
      label: 'Lĩnh vực',
      options: db.topics.map((topic) => ({ value: topic.name, label: topic.name })),
    },
    {
      columnId: 'priorityLabel',
      label: 'Ưu tiên',
      options: Object.values(priorityLabels).map((meta) => ({ value: meta.label, label: meta.label })),
    },
  ]

  const overdueCount = rows.filter((row) => row.overdue).length

  return (
    <div className="space-y-5">
      <PageHeader
        module="E3·E4"
        title="Câu hỏi báo chí"
        description={
          user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || user?.role === 'COORDINATOR'
            ? 'Toàn bộ câu hỏi báo chí trên hệ thống, kèm đơn vị xử lý và hạn trả lời.'
            : `Câu hỏi báo chí đã chuyển tới ${orgName(db, user?.org_id)}.`
        }
      />

      {overdueCount > 0 && (
        <div className="rounded-md border border-[#efb3bd] bg-[#fdeaed] px-4 py-2.5 text-sm text-[#8f0e22]">
          <span className="font-medium">{overdueCount} câu hỏi đang quá hạn.</span> Lọc theo trạng thái
          &quot;Quá hạn&quot; để xử lý trước.
        </div>
      )}

      <DataTable
        data={rows}
        columns={columns}
        searchColumn="title"
        searchPlaceholder="Tìm theo nội dung câu hỏi..."
        facets={facets}
        onRowClick={(row) => navigate(`/cau-hoi/${row.id}`)}
        onExport={() => toast.success('Đã xuất danh sách câu hỏi ra tệp Excel (giả lập).')}
        emptyTitle="Chưa có câu hỏi nào"
        emptyDescription="Câu hỏi của phóng viên sau khi được điều phối sẽ hiển thị tại đây."
      />
    </div>
  )
}
