import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { DocCode } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { EmptyState } from '@/components/common/EmptyState'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { releaseStatus, securityLevel } from '@/lib/enums'
import { formatDate } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { orgName, profileOfUser, topicName } from '@/mock/selectors'

const ALL = '__all__'

/** Feed thông tin nguồn dành cho phóng viên và cơ quan báo chí — chỉ xem bản đã phát hành. */
export function ReleaseFeed() {
  const db = useDb()
  const user = useCurrentUser()
  const profile = profileOfUser(db, user?.id)
  const [search, setSearch] = useState('')
  const [topicFilter, setTopicFilter] = useState(ALL)
  const [orgFilter, setOrgFilter] = useState(ALL)

  const visibleReleases = useMemo(() => {
    const published = db.press_releases.filter((release) =>
      ['PUBLISHED', 'CORRECTED'].includes(release.status),
    )
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
    return published
      .filter((release) => {
        if (isAdmin) return true
        const scopes = db.release_scopes.filter((item) => item.release_id === release.id)
        if (scopes.length === 0) return true
        return scopes.some((scope) => {
          if (scope.scope_type === 'ALL') return true
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
          return false
        })
      })
      .sort((left, right) => (right.published_at ?? '').localeCompare(left.published_at ?? ''))
  }, [db, user, profile])

  const topicOptions = useMemo(() => {
    const ids = new Set(visibleReleases.map((release) => release.topic_id).filter(Boolean))
    return [...ids].map((id) => ({ value: id as string, label: topicName(db, id) }))
  }, [db, visibleReleases])

  const orgOptions = useMemo(() => {
    const ids = new Set(visibleReleases.map((release) => release.publishing_org_id).filter(Boolean))
    return [...ids].map((id) => ({ value: id as string, label: orgName(db, id) }))
  }, [db, visibleReleases])

  const hasActiveFilter = Boolean(search.trim()) || topicFilter !== ALL || orgFilter !== ALL

  const releases = useMemo(() => {
    const query = search.trim().toLowerCase()
    return visibleReleases.filter((release) => {
      if (topicFilter !== ALL && release.topic_id !== topicFilter) return false
      if (orgFilter !== ALL && release.publishing_org_id !== orgFilter) return false
      if (query) {
        const haystack = `${release.title} ${release.summary ?? ''}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      return true
    })
  }, [visibleReleases, search, topicFilter, orgFilter])

  return (
    <div className="space-y-5">
      <PageHeader
        module="E2"
        title="Thông tin nguồn"
        description="Thông cáo, tài liệu, ảnh và video do các cơ quan phát ngôn cung cấp qua kênh chính thống."
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tiêu đề, tóm tắt..."
            className="h-9 bg-card pl-8"
          />
        </div>
        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger className="h-9 w-auto min-w-40 bg-card">
            <SelectValue placeholder="Chủ đề" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Chủ đề: tất cả</SelectItem>
            {topicOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="h-9 w-auto min-w-40 bg-card">
            <SelectValue placeholder="Cơ quan phát hành" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Cơ quan: tất cả</SelectItem>
            {orgOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {releases.length === 0 ? (
        <div className="bg-card rounded-md border">
          <EmptyState
            title="Chưa có thông tin nguồn nào phù hợp"
            description={hasActiveFilter ? 'Không có thông tin nguồn nào khớp bộ lọc.' : undefined}
          />
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
