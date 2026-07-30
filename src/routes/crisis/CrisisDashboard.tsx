import { useMemo } from 'react'
import { Link } from 'react-router'
import { AiPanel } from '@/components/common/AiPanel'
import { DocCode, PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { SimpleLineChart } from '@/components/common/SimpleLineChart'
import { Card, CardContent } from '@/components/ui/card'
import { alertStatus, fakeNewsFlag, severity as severityLabels } from '@/lib/enums'
import { formatRelative } from '@/lib/format'
import { useDb } from '@/mock/store'
import { localityName, topicName } from '@/mock/selectors'

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 } as const

/** E8 — dashboard theo dõi chủ đề nóng và cảnh báo khủng hoảng truyền thông. */
export function CrisisDashboard() {
  const db = useDb()

  const alerts = useMemo(
    () =>
      [...db.crisis_alerts].sort((left, right) => {
        const activeLeft = left.status !== 'RESOLVED' && left.status !== 'DISMISSED' ? 0 : 1
        const activeRight = right.status !== 'RESOLVED' && right.status !== 'DISMISSED' ? 0 : 1
        if (activeLeft !== activeRight) return activeLeft - activeRight
        return SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
      }),
    [db],
  )

  const active = alerts.filter((alert) => !['RESOLVED', 'DISMISSED'].includes(alert.status))

  return (
    <div className="space-y-5">
      <PageHeader
        module="E8"
        title="Cảnh báo và xử lý khủng hoảng truyền thông"
        description="Theo dõi chủ đề nóng theo thời gian thực; AI phát hiện tin giả và phân loại mức độ rủi ro."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Đang theo dõi', value: active.length, tone: '#b3122b' },
          {
            label: 'Nghiêm trọng / Cao',
            value: active.filter((item) => item.severity === 'CRITICAL' || item.severity === 'HIGH').length,
            tone: '#8a4f06',
          },
          { label: 'Đã xử lý xong', value: alerts.filter((item) => item.status === 'RESOLVED').length, tone: '#157f4d' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular" style={{ color: stat.tone }}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {alerts.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Chưa có cảnh báo nào" />
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Link key={alert.id} to={`/canh-bao/${alert.id}`}>
              <Card className="hover:border-primary/40 transition-colors">
                <CardContent className="flex flex-wrap items-center gap-4 py-4">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <DocCode>{alert.alert_code}</DocCode>
                      <StatusBadge meta={severityLabels[alert.severity]} />
                      <StatusBadge meta={alertStatus[alert.status]} />
                      {alert.fake_news_flag !== 'NONE' && <StatusBadge meta={fakeNewsFlag[alert.fake_news_flag]} />}
                    </div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {topicName(db, alert.topic_id)} · {localityName(db, alert.locality_id)} · phát hiện{' '}
                      {formatRelative(alert.detected_at)} · điểm rủi ro {alert.risk_score}/100
                    </p>
                  </div>
                  <div className="w-40 shrink-0">
                    <SimpleLineChart
                      data={alert.trend.map((value, index) => ({ label: String(index), value }))}
                      height={40}
                      compact
                      color={alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? '#b3122b' : '#0b4f9e'}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AiPanel kind="forecast" autoRun />
    </div>
  )
}
