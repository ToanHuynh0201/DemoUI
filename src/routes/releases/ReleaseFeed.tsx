import { useMemo } from 'react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/common/PageHeader'
import { DocCode } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { releaseStatus, securityLevel } from '@/lib/enums'
import { formatDate } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { orgName, profileOfUser, topicName } from '@/mock/selectors'

/** Feed thông tin nguồn dành cho phóng viên và cơ quan báo chí — chỉ xem bản đã phát hành. */
export function ReleaseFeed() {
  const db = useDb()
  const user = useCurrentUser()
  const profile = profileOfUser(db, user?.id)

  const releases = useMemo(() => {
    const published = db.press_releases.filter((release) =>
      ['PUBLISHED', 'CORRECTED'].includes(release.status),
    )
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
    return published
      .filter((release) => {
        if (isAdmin) return true
        const scope = db.release_scopes.find((item) => item.release_id === release.id)
        if (!scope || scope.scope_type === 'ALL') return true
        if (scope.scope_type === 'ORGANIZATION') {
          if (user?.role === 'MEDIA_ORG') return scope.org_id === user.org_id
          return scope.org_id === profile?.press_agency_id
        }
        if (scope.scope_type === 'TOPIC') {
          return db.journalist_topics.some(
            (link) => link.profile_id === profile?.id && link.topic_id === scope.topic_id,
          )
        }
        if (scope.scope_type === 'JOURNALIST') return scope.journalist_profile_id === profile?.id
        return true
      })
      .sort((left, right) => (right.published_at ?? '').localeCompare(left.published_at ?? ''))
  }, [db, user, profile])

  return (
    <div className="space-y-5">
      <PageHeader
        module="E2"
        title="Thông tin nguồn"
        description="Thông cáo, tài liệu, ảnh và video do các cơ quan phát ngôn cung cấp qua kênh chính thống."
      />

      {releases.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState title="Chưa có thông tin nguồn nào phù hợp" />
        </div>
      ) : (
        <ul className="space-y-3">
          {releases.map((release) => (
            <li key={release.id}>
              <Link
                to={`/thong-cao/${release.id}`}
                className="bg-card hover:border-primary/40 block rounded-md border p-4 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <DocCode>{release.release_code}</DocCode>
                  <StatusBadge meta={releaseStatus[release.status]} />
                  <StatusBadge meta={securityLevel[release.security_level]} />
                </div>
                <p className="mt-1.5 font-medium">{release.title}</p>
                {release.summary && (
                  <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">{release.summary}</p>
                )}
                <p className="text-muted-foreground mt-2 text-xs">
                  {orgName(db, release.publishing_org_id)} · {topicName(db, release.topic_id)} · phát hành{' '}
                  {formatDate(release.published_at)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
