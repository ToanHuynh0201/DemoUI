import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { fakeNewsFlag, sentiment, sourceChannel } from '@/lib/enums'
import { formatDateTime, formatNumber } from '@/lib/format'
import { useDb } from '@/mock/store'
import { localityName, topicName } from '@/mock/selectors'

/** E7 — dòng tin bài thu thập từ đa nền tảng, kèm nhãn sắc thái do AI gán. */
export function MonitoringFeed() {
  const db = useDb()

  const rows = useMemo(
    () =>
      db.media_articles
        .map((article) => ({
          ...article,
          sourceName: db.monitoring_sources.find((source) => source.id === article.source_id)?.name ?? '—',
          channel: db.monitoring_sources.find((source) => source.id === article.source_id)?.channel,
          topicLabel: topicName(db, article.topic_id),
          localityLabel: localityName(db, article.locality_id),
        }))
        .sort((left, right) => right.published_at.localeCompare(left.published_at)),
    [db],
  )

  const columns: ColumnDef<(typeof rows)[number], unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Tin bài',
      cell: ({ row }) => (
        <div className="max-w-lg space-y-0.5">
          <p className="line-clamp-2 font-medium">{row.original.title}</p>
          <p className="text-muted-foreground line-clamp-1 text-xs">{row.original.excerpt}</p>
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            {row.original.sourceName} · {row.original.author}
            {row.original.url && <ExternalLink className="size-3" aria-hidden />}
          </p>
        </div>
      ),
    },
    { accessorKey: 'topicLabel', header: 'Lĩnh vực' },
    { accessorKey: 'localityLabel', header: 'Địa phương' },
    {
      accessorKey: 'sentiment',
      header: 'Sắc thái',
      cell: ({ row }) => <StatusBadge meta={sentiment[row.original.sentiment]} />,
    },
    {
      accessorKey: 'reach_score',
      header: 'Mức lan tỏa',
      cell: ({ row }) => <span className="font-mono text-sm tabular">{formatNumber(row.original.reach_score)}</span>,
    },
    {
      accessorKey: 'fake_news_flag',
      header: 'Dấu hiệu tin giả',
      cell: ({ row }) =>
        row.original.fake_news_flag === 'NONE' ? (
          <span className="text-muted-foreground text-xs">—</span>
        ) : (
          <StatusBadge meta={fakeNewsFlag[row.original.fake_news_flag]} />
        ),
    },
    {
      accessorKey: 'published_at',
      header: 'Thời điểm',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular">{formatDateTime(row.original.published_at)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        module="E7"
        title="Dòng tin bài thu thập"
        description="Thu thập tự động từ báo điện tử, mạng xã hội, phát thanh, truyền hình; AI gắn nhãn sắc thái và phát hiện dấu hiệu tin giả."
      />
      <DataTable
        data={rows}
        columns={columns}
        searchColumn="title"
        searchPlaceholder="Tìm theo tiêu đề tin bài..."
        facets={[
          {
            columnId: 'sentiment',
            label: 'Sắc thái',
            options: Object.entries(sentiment).map(([value, meta]) => ({ value, label: meta.label })),
          },
          {
            columnId: 'topicLabel',
            label: 'Lĩnh vực',
            options: db.topics.map((topic) => ({ value: topic.name, label: topic.name })),
          },
          {
            columnId: 'channel',
            label: 'Kênh',
            options: Object.entries(sourceChannel).map(([value, meta]) => ({ value, label: meta.label })),
          },
        ]}
        pageSize={15}
        emptyTitle="Chưa thu thập được tin bài nào"
      />
    </div>
  )
}
