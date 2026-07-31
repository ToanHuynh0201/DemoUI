import { useMemo } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SimpleBarChart } from '@/components/common/SimpleBarChart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { orgName } from '@/mock/selectors'

/** E2 — hiệu quả khai thác: lượt xem/tải theo cơ quan báo chí và theo thông cáo. */
export function ReleaseAnalytics() {
  const db = useDb()
  const user = useCurrentUser()

  const scoped = useMemo(() => {
    const releaseIds = new Set(
      db.press_releases
        .filter(
          (release) =>
            user?.role === 'ADMIN' ||
            user?.role === 'SUPERADMIN' ||
            release.publishing_org_id === user?.org_id,
        )
        .map((release) => release.id),
    )
    return db.release_accesses.filter((access) => releaseIds.has(access.release_id))
  }, [db, user])

  const byAgency = useMemo(() => {
    const counts = new Map<string, number>()
    scoped.forEach((access) => {
      const key = orgName(db, access.org_id)
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return Array.from(counts, ([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value)
  }, [db, scoped])

  const byRelease = useMemo(() => {
    const counts = new Map<string, { title: string; views: number; downloads: number }>()
    scoped.forEach((access) => {
      const release = db.press_releases.find((item) => item.id === access.release_id)
      if (!release) return
      const entry = counts.get(release.id) ?? { title: release.title, views: 0, downloads: 0 }
      if (access.action === 'VIEW') entry.views += 1
      else entry.downloads += 1
      counts.set(release.id, entry)
    })
    return Array.from(counts.values()).sort((left, right) => right.views + right.downloads - (left.views + left.downloads))
  }, [db, scoped])

  const totalViews = scoped.filter((item) => item.action === 'VIEW').length
  const totalDownloads = scoped.filter((item) => item.action === 'DOWNLOAD').length

  return (
    <div className="space-y-5">
      <PageHeader
        module="E2"
        title="Hiệu quả khai thác thông tin nguồn"
        description="Đo lường lượt tiếp cận và tái khai thác thông cáo đã phát hành."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Tổng lượt xem', value: totalViews },
          { label: 'Tổng lượt tải', value: totalDownloads },
          { label: 'Cơ quan báo chí đã tiếp cận', value: byAgency.length },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-5">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-1 font-mono text-2xl font-semibold tabular">{formatNumber(stat.value)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lượt tiếp cận theo cơ quan báo chí</CardTitle>
        </CardHeader>
        <CardContent>
          {byAgency.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">Chưa có dữ liệu truy cập.</p>
          ) : (
            <SimpleBarChart data={byAgency} valueLabel="Lượt truy cập" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Chi tiết theo thông cáo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-left text-xs">
                  <th className="pb-2 font-medium">Thông cáo</th>
                  <th className="pb-2 text-right font-medium">Lượt xem</th>
                  <th className="pb-2 text-right font-medium">Lượt tải</th>
                </tr>
              </thead>
              <tbody>
                {byRelease.map((item) => (
                  <tr key={item.title} className="border-b last:border-0">
                    <td className="max-w-md truncate py-2 pr-3">{item.title}</td>
                    <td className="py-2 text-right font-mono tabular">{formatNumber(item.views)}</td>
                    <td className="py-2 text-right font-mono tabular">{formatNumber(item.downloads)}</td>
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
