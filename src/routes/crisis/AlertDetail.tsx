import { useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { AiPanel } from '@/components/common/AiPanel'
import { DocCode, MetaItem, PageHeader } from '@/components/common/PageHeader'
import { SimpleLineChart } from '@/components/common/SimpleLineChart'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { can } from '@/lib/permissions'
import { alertStatus, crisisTaskStatus, fakeNewsFlag, sentiment, severity as severityLabels } from '@/lib/enums'
import { formatDate, formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { localityName, orgName, topicName } from '@/mock/selectors'

export function AlertDetail() {
  const { id = '' } = useParams()
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()

  const [taskTitle, setTaskTitle] = useState('')
  const [taskOrg, setTaskOrg] = useState('')
  const [taskDue, setTaskDue] = useState('')

  const alert = db.crisis_alerts.find((item) => item.id === id)
  if (!alert || !user) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy cảnh báo.</p>
  }

  const canManage = can(user.role, 'e8.response.manage')
  const relatedArticles = db.media_articles.filter((article) => alert.article_ids.includes(article.id))
  const tasks = db.crisis_tasks.filter((task) => task.alert_id === alert.id)
  const coordinationOrgs = db.organizations.filter(
    (org) => org.org_type === 'GOVERNMENT_DEPARTMENT' || org.org_type === 'SPOKESPERSON_AGENCY',
  )

  return (
    <div className="space-y-5">
      <PageHeader
        module="E8"
        backTo="/canh-bao"
        backLabel="Dashboard cảnh báo"
        title={alert.title}
        description={`${topicName(db, alert.topic_id)} · ${localityName(db, alert.locality_id)}`}
        actions={
          <>
            <StatusBadge meta={severityLabels[alert.severity]} />
            <StatusBadge meta={alertStatus[alert.status]} />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Diễn biến</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-pretty">{alert.description}</p>
              <SimpleLineChart
                data={alert.trend.map((value, index) => ({ label: `Ngày ${index - 13}`, value }))}
                valueLabel="Số bài/ngày"
                color="#b3122b"
              />
            </CardContent>
          </Card>

          <AiPanel kind="fake_news" inputId={alert.id} autoRun />

          {canManage && alert.status !== 'RESOLVED' && alert.status !== 'DISMISSED' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Khởi tạo quy trình ứng phó</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {alert.status === 'NEW' && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        store.setAlertStatus(alert.id, 'ACKNOWLEDGED')
                        toast.success('Đã tiếp nhận cảnh báo.')
                      }}
                    >
                      Tiếp nhận cảnh báo
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      store.setAlertStatus(alert.id, 'RESOLVED')
                      toast.success('Đã đánh dấu xử lý xong.')
                    }}
                  >
                    Đánh dấu đã xử lý xong
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      store.setAlertStatus(alert.id, 'DISMISSED')
                      toast.success('Đã bỏ qua cảnh báo.')
                    }}
                  >
                    Bỏ qua
                  </Button>
                </div>

                <ActionDialog
                  trigger={<Button>Giao nhiệm vụ ứng phó</Button>}
                  title="Giao nhiệm vụ ứng phó cho đơn vị phối hợp"
                  description="Đơn vị được giao sẽ nhận thông báo ngay và cập nhật tiến độ trên hệ thống."
                  confirmLabel="Giao nhiệm vụ"
                  onOpen={() => {
                    setTaskTitle('')
                    setTaskOrg('')
                    setTaskDue('')
                  }}
                  onConfirm={() => {
                    if (!taskTitle.trim() || !taskOrg || !taskDue) {
                      toast.error('Nhập đầy đủ nội dung, đơn vị và hạn hoàn thành.')
                      return false
                    }
                    store.createCrisisTask(alert.id, {
                      title: taskTitle.trim(),
                      assignedOrgId: taskOrg,
                      dueAt: new Date(taskDue).toISOString(),
                    })
                    toast.success(`Đã giao nhiệm vụ cho ${orgName(db, taskOrg)}.`)
                  }}
                >
                  <Field label="Nội dung nhiệm vụ">
                    <Textarea value={taskTitle} onChange={(event) => setTaskTitle(event.target.value)} rows={3} />
                  </Field>
                  <Field label="Đơn vị phối hợp">
                    <Select value={taskOrg} onValueChange={setTaskOrg}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Chọn đơn vị" />
                      </SelectTrigger>
                      <SelectContent>
                        {coordinationOrgs.map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.org_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Hạn hoàn thành">
                    <Input type="datetime-local" value={taskDue} onChange={(event) => setTaskDue(event.target.value)} />
                  </Field>
                </ActionDialog>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nhiệm vụ ứng phó ({tasks.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa giao nhiệm vụ nào.</p>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="border-b pb-3 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{task.title}</p>
                      <StatusBadge meta={crisisTaskStatus[task.status]} />
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {orgName(db, task.assigned_org_id)} · hạn {formatDate(task.due_at)}
                    </p>
                    {task.progress_note && <p className="mt-1 text-sm text-pretty">{task.progress_note}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {relatedArticles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tin bài liên quan ({relatedArticles.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedArticles.map((article) => (
                  <div key={article.id} className="border-b pb-2 last:border-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{article.title}</p>
                      <StatusBadge meta={sentiment[article.sentiment]} />
                    </div>
                    <p className="text-muted-foreground text-xs">{formatDateTime(article.published_at)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin cảnh báo</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <MetaItem label="Mã cảnh báo">
                <DocCode>{alert.alert_code}</DocCode>
              </MetaItem>
              <MetaItem label="Điểm rủi ro">{alert.risk_score}/100</MetaItem>
              <MetaItem label="Dấu hiệu tin giả">
                <StatusBadge meta={fakeNewsFlag[alert.fake_news_flag]} />
              </MetaItem>
              <MetaItem label="Phát hiện lúc">
                <span className="font-mono text-xs tabular">{formatDateTime(alert.detected_at)}</span>
              </MetaItem>
              {alert.acknowledged_at && (
                <MetaItem label="Tiếp nhận lúc">
                  <span className="font-mono text-xs tabular">{formatDateTime(alert.acknowledged_at)}</span>
                </MetaItem>
              )}
              {alert.resolved_at && (
                <MetaItem label="Xử lý xong lúc">
                  <span className="font-mono text-xs tabular">{formatDateTime(alert.resolved_at)}</span>
                </MetaItem>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
