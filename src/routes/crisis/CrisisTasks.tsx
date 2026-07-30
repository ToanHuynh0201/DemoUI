import { useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { DocCode, PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { crisisTaskStatus, severity as severityLabels } from '@/lib/enums'
import { formatDate } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import type { CrisisTaskStatus } from '@/mock/types'

/** E8 — nhiệm vụ ứng phó của đơn vị phối hợp (Sở, ban, ngành). */
export function CrisisTasks() {
  const db = useDb()
  const user = useCurrentUser()
  const updateTask = useStore((state) => state.updateCrisisTask)

  const [status, setStatus] = useState<CrisisTaskStatus>('IN_PROGRESS')
  const [note, setNote] = useState('')

  const tasks = db.crisis_tasks
    .filter((task) => task.assigned_org_id === user?.org_id)
    .sort((left, right) => left.due_at.localeCompare(right.due_at))

  return (
    <div className="space-y-5">
      <PageHeader
        module="E8"
        title="Nhiệm vụ ứng phó khủng hoảng"
        description="Nhiệm vụ được Sở Văn hóa, Thể thao và Du lịch giao trong quy trình phối hợp xử lý khủng hoảng truyền thông."
      />

      {tasks.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Chưa có nhiệm vụ nào được giao" />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const alert = db.crisis_alerts.find((item) => item.id === task.alert_id)
            return (
              <Card key={task.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 py-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    {alert && (
                      <Link to={`/canh-bao/${alert.id}`} className="flex flex-wrap items-center gap-2 text-xs">
                        <DocCode>{alert.alert_code}</DocCode>
                        <StatusBadge meta={severityLabels[alert.severity]} />
                      </Link>
                    )}
                    <p className="font-medium">{task.title}</p>
                    <p className="text-muted-foreground text-xs">Hạn hoàn thành: {formatDate(task.due_at)}</p>
                    {task.progress_note && <p className="text-sm text-pretty">{task.progress_note}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge meta={crisisTaskStatus[task.status]} />
                    {task.status !== 'DONE' && (
                      <ActionDialog
                        trigger={
                          <Button size="sm" variant="outline">
                            Cập nhật tiến độ
                          </Button>
                        }
                        title="Cập nhật tiến độ nhiệm vụ"
                        confirmLabel="Cập nhật"
                        onOpen={() => {
                          setStatus(task.status === 'ASSIGNED' ? 'IN_PROGRESS' : 'SUBMITTED')
                          setNote(task.progress_note ?? '')
                        }}
                        onConfirm={() => {
                          if (!note.trim()) {
                            toast.error('Nhập nội dung tiến độ.')
                            return false
                          }
                          updateTask(task.id, status, note)
                          toast.success('Đã cập nhật tiến độ.')
                        }}
                      >
                        <Field label="Trạng thái">
                          <Select value={status} onValueChange={(value) => setStatus(value as CrisisTaskStatus)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="IN_PROGRESS">Đang thực hiện</SelectItem>
                              <SelectItem value="SUBMITTED">Đã báo cáo, chờ duyệt</SelectItem>
                              <SelectItem value="DONE">Hoàn thành</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                        <Field label="Nội dung tiến độ">
                          <Textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
                        </Field>
                      </ActionDialog>
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
