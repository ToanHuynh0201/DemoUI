import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { sourceChannel, sourceStatus } from '@/lib/enums'
import { formatDateTime, formatNumber } from '@/lib/format'
import { useDb, useStore } from '@/mock/store'

/** E7 — cấu hình nguồn và từ khóa theo dõi. */
export function SourcesAdmin() {
  const db = useDb()
  const toggleSource = useStore((state) => state.toggleMonitoringSource)

  return (
    <div className="space-y-5">
      <PageHeader
        module="E7"
        title="Nguồn và từ khóa theo dõi"
        description="Cấu hình nguồn thu thập tin bài đa nền tảng: báo điện tử, mạng xã hội, phát thanh, truyền hình."
      />

      <div className="space-y-3">
        {db.monitoring_sources.map((source) => (
          <Card key={source.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{source.name}</p>
                  <StatusBadge meta={sourceChannel[source.channel]} dot={false} />
                  <StatusBadge meta={sourceStatus[source.status]} />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Từ khóa: {source.keywords.join(', ')}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatNumber(source.articles_last_7d)} tin bài trong 7 ngày · cập nhật lần cuối{' '}
                  {formatDateTime(source.last_fetched_at)}
                </p>
                {source.last_error && (
                  <p className="mt-1 text-xs font-medium text-[#8f0e22]">{source.last_error}</p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  toggleSource(source.id)
                  toast.success(source.status === 'ACTIVE' ? 'Đã tạm dừng thu thập.' : 'Đã bật thu thập.')
                }}
              >
                {source.status === 'ACTIVE' ? 'Tạm dừng' : 'Bật lại'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
