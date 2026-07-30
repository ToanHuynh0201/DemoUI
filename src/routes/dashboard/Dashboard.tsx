import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { AiPanel } from '@/components/common/AiPanel'
import { PageHeader } from '@/components/common/PageHeader'
import { SimpleBarChart } from '@/components/common/SimpleBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { questionStatus, severity as severityLabels } from '@/lib/enums'
import { formatNumber, formatPercent } from '@/lib/format'
import { useDb } from '@/mock/store'
import { onTimeRate, orgName } from '@/mock/selectors'

/** E9 — dashboard thời gian thực, có bộ lọc theo lĩnh vực và địa phương. */
export function Dashboard() {
  const db = useDb()
  const [topicFilter, setTopicFilter] = useState('__all__')
  const [localityFilter, setLocalityFilter] = useState('__all__')

  const questions = useMemo(
    () => db.questions.filter((question) => topicFilter === '__all__' || question.topic_id === topicFilter),
    [db, topicFilter],
  )

  const releases = useMemo(
    () =>
      db.press_releases.filter((release) => {
        if (topicFilter !== '__all__' && release.topic_id !== topicFilter) return false
        if (localityFilter === '__all__') return true
        const org = db.organizations.find((item) => item.id === release.publishing_org_id)
        return org?.locality_id === localityFilter
      }),
    [db, topicFilter, localityFilter],
  )

  const stats = {
    questionsTotal: questions.length,
    questionsOpen: questions.filter((q) => !['ANSWERED', 'CANCELLED', 'REJECTED'].includes(q.status)).length,
    questionsOverdue: questions.filter((q) => q.status === 'OVERDUE').length,
    onTime: onTimeRate(db),
    releasesPublished: releases.filter((r) => ['PUBLISHED', 'CORRECTED'].includes(r.status)).length,
    eventsOngoing: db.events.filter((e) => ['ONGOING', 'INVITATIONS_SENT'].includes(e.status)).length,
    badgesIssued: db.press_badges.length,
    activeCrises: db.crisis_alerts.filter((a) => !['RESOLVED', 'DISMISSED'].includes(a.status)).length,
  }

  const byOrg = useMemo(() => {
    const counts = new Map<string, number>()
    questions.forEach((question) => {
      if (!question.handling_org_id) return
      const key = orgName(db, question.handling_org_id)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return Array.from(counts, ([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value)
  }, [db, questions])

  const byStatus = useMemo(() => {
    const counts = new Map<string, number>()
    questions.forEach((question) => {
      const label = questionStatus[question.status].label
      counts.set(label, (counts.get(label) ?? 0) + 1)
    })
    return Array.from(counts, ([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value)
  }, [questions])

  return (
    <div className="space-y-5">
      <PageHeader
        module="E9"
        title="Dashboard điều hành"
        description="Số liệu thời gian thực về câu hỏi báo chí, thông tin nguồn, sự kiện và thẻ tác nghiệp."
        actions={
          <div className="flex gap-2">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="h-9 w-auto min-w-36 bg-card">
                <SelectValue placeholder="Lĩnh vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Lĩnh vực: tất cả</SelectItem>
                {db.topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={localityFilter} onValueChange={setLocalityFilter}>
              <SelectTrigger className="h-9 w-auto min-w-36 bg-card">
                <SelectValue placeholder="Địa phương" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Địa phương: tất cả</SelectItem>
                {db.localities
                  .filter((item) => item.level === 'WARD')
                  .map((locality) => (
                    <SelectItem key={locality.id} value={locality.id}>
                      {locality.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Câu hỏi đang xử lý', value: stats.questionsOpen, sub: `/ ${stats.questionsTotal} tổng` },
          { label: 'Tỷ lệ trả lời đúng hạn', value: formatPercent(stats.onTime), sub: null },
          { label: 'Thông tin nguồn đã phát hành', value: stats.releasesPublished, sub: null },
          { label: 'Sự kiện đang diễn ra', value: stats.eventsOngoing, sub: null },
          { label: 'Thẻ tác nghiệp đã cấp', value: stats.badgesIssued, sub: null },
          { label: 'Câu hỏi quá hạn', value: stats.questionsOverdue, sub: null, critical: stats.questionsOverdue > 0 },
          { label: 'Cảnh báo đang theo dõi', value: stats.activeCrises, sub: null, critical: stats.activeCrises > 0 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p
                className="mt-1 font-mono text-2xl font-semibold tabular"
                style={{ color: stat.critical ? '#8f0e22' : undefined }}
              >
                {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                {stat.sub && <span className="text-muted-foreground ml-1 text-sm font-normal">{stat.sub}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Câu hỏi theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byStatus} valueLabel="Câu hỏi" height={280} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Câu hỏi theo đơn vị xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleBarChart data={byOrg} valueLabel="Câu hỏi" height={280} color="var(--chart-2)" />
          </CardContent>
        </Card>
      </div>

      {stats.activeCrises > 0 && (
        <Card className="border-[#efb3bd] bg-[#fdeaed]">
          <CardContent className="flex items-center justify-between gap-3 py-4">
            <p className="text-sm text-[#8f0e22]">
              <span className="font-semibold">{stats.activeCrises} cảnh báo</span> đang được theo dõi hoặc xử lý.
            </p>
            <Link to="/canh-bao" className="text-sm font-medium text-[#8f0e22] underline">
              Xem cảnh báo
            </Link>
          </CardContent>
        </Card>
      )}

      <AiPanel kind="forecast" autoRun />

      {db.crisis_alerts.some((alert) => alert.severity === 'CRITICAL') && (
        <p className="text-muted-foreground text-xs">
          Mức nghiêm trọng nhất hiện tại:{' '}
          <span className="font-medium">{severityLabels.CRITICAL.label}</span>
        </p>
      )}
    </div>
  )
}
