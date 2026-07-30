import { useMemo } from 'react'
import { AiPanel } from '@/components/common/AiPanel'
import { PageHeader } from '@/components/common/PageHeader'
import { SimpleBarChart } from '@/components/common/SimpleBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import { useDb } from '@/mock/store'
import { topicName } from '@/mock/selectors'
import { cn } from '@/lib/utils'

/** E7 — phân tích xu hướng, mức lan tỏa và bản đồ truyền thông theo lĩnh vực. */
export function TrendAnalysis() {
  const db = useDb()

  const byTopic = useMemo(() => {
    const totals = new Map<string, number>()
    db.media_articles.forEach((article) => {
      const key = topicName(db, article.topic_id)
      totals.set(key, (totals.get(key) ?? 0) + article.reach_score)
    })
    return Array.from(totals, ([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value).slice(0, 8)
  }, [db])

  /** Bản đồ truyền thông: lĩnh vực × địa phương, ô đậm màu = nhiều tin bài hơn */
  const heatmap = useMemo(() => {
    const topics = db.topics.slice(0, 8)
    const localities = db.localities.filter((item) => item.level === 'WARD').slice(0, 8)
    const counts = new Map<string, number>()
    let max = 0
    db.media_articles.forEach((article) => {
      if (!article.topic_id || !article.locality_id) return
      const key = `${article.topic_id}|${article.locality_id}`
      const next = (counts.get(key) ?? 0) + 1
      counts.set(key, next)
      if (next > max) max = next
    })
    return { topics, localities, counts, max: max || 1 }
  }, [db])

  const overallSentiment = useMemo(() => {
    const totals = { POSITIVE: 0, NEUTRAL: 0, NEGATIVE: 0 }
    db.media_articles.forEach((article) => {
      totals[article.sentiment] += 1
    })
    return totals
  }, [db])

  return (
    <div className="space-y-5">
      <PageHeader
        module="E7"
        title="Xu hướng và mức độ lan tỏa"
        description="Phân tích xu hướng thông tin theo thời gian thực và bản đồ truyền thông theo lĩnh vực."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Tin tích cực', value: overallSentiment.POSITIVE, tone: '#157f4d' },
          { label: 'Tin trung lập', value: overallSentiment.NEUTRAL, tone: '#5a6b80' },
          { label: 'Tin tiêu cực', value: overallSentiment.NEGATIVE, tone: '#b3122b' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular" style={{ color: stat.tone }}>
                {formatNumber(stat.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AiPanel kind="trend" autoRun />
      <AiPanel kind="sentiment" autoRun />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mức lan tỏa theo lĩnh vực</CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={byTopic} valueLabel="Điểm lan tỏa" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bản đồ truyền thông theo lĩnh vực</CardTitle>
          <p className="text-muted-foreground text-sm">Số tin bài theo lĩnh vực và địa phương — màu đậm hơn nghĩa là nhiều tin hơn.</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-1 text-left font-medium"></th>
                  {heatmap.localities.map((locality) => (
                    <th key={locality.id} className="text-muted-foreground p-1 text-center font-medium whitespace-nowrap">
                      {locality.name.replace(/^(Phường|Xã) /, '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.topics.map((topic) => (
                  <tr key={topic.id}>
                    <td className="text-muted-foreground p-1 pr-3 text-right font-medium whitespace-nowrap">{topic.name}</td>
                    {heatmap.localities.map((locality) => {
                      const count = heatmap.counts.get(`${topic.id}|${locality.id}`) ?? 0
                      const intensity = count / heatmap.max
                      return (
                        <td key={locality.id} className="p-1">
                          <div
                            className={cn(
                              'flex size-9 items-center justify-center rounded text-[11px] font-medium tabular',
                              intensity === 0 ? 'text-muted-foreground/40' : 'text-white',
                            )}
                            style={{
                              backgroundColor:
                                intensity === 0
                                  ? 'var(--muted)'
                                  : `color-mix(in srgb, var(--chart-1) ${20 + intensity * 80}%, white)`,
                            }}
                          >
                            {count || ''}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
