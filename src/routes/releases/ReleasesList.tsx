import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/DataTable'
import { DocCode, PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { can } from '@/lib/permissions'
import { releaseStatus, releaseVersionType, securityLevel } from '@/lib/enums'
import { formatDate } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { orgName, topicName, userName } from '@/mock/selectors'
import type { PressRelease } from '@/mock/types'

interface Row {
  id: string
  code: string
  title: string
  org: string
  topic: string
  status: PressRelease['status']
  statusLabel: string
  security: PressRelease['security_level']
  securityLabel: string
  versionLabel: string
  author: string
  updatedAt: string
  publishedAt: string | null
}

export function ReleasesList() {
  const db = useDb()
  const user = useCurrentUser()
  const navigate = useNavigate()

  const scoped = useMemo(() => {
    if (!user) return []
    if (user.role === 'ADMIN') return db.press_releases
    return db.press_releases.filter((release) => release.publishing_org_id === user.org_id)
  }, [db, user])

  const rows: Row[] = useMemo(
    () =>
      scoped
        .map((release) => ({
          id: release.id,
          code: release.release_code,
          title: release.title,
          org: orgName(db, release.publishing_org_id),
          topic: topicName(db, release.topic_id),
          status: release.status,
          statusLabel: releaseStatus[release.status].label,
          security: release.security_level,
          securityLabel: securityLevel[release.security_level].label,
          versionLabel: releaseVersionType[release.version_type].label,
          author: userName(db, release.drafted_by_id),
          updatedAt: release.updated_at,
          publishedAt: release.published_at ?? null,
        }))
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [db, scoped],
  )

  const columns: ColumnDef<Row, unknown>[] = [
    { accessorKey: 'code', header: 'Mã thông cáo', cell: ({ row }) => <DocCode>{row.original.code}</DocCode> },
    {
      accessorKey: 'title',
      header: 'Tiêu đề',
      cell: ({ row }) => (
        <div className="max-w-lg space-y-0.5">
          <p className="line-clamp-2 font-medium">{row.original.title}</p>
          <p className="text-muted-foreground text-xs">
            {row.original.org} · {row.original.author}
          </p>
        </div>
      ),
    },
    { accessorKey: 'topic', header: 'Lĩnh vực' },
    {
      accessorKey: 'securityLabel',
      header: 'Bảo mật',
      cell: ({ row }) => <StatusBadge meta={securityLevel[row.original.security]} />,
    },
    {
      accessorKey: 'statusLabel',
      header: 'Trạng thái',
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge meta={releaseStatus[row.original.status]} />
          {row.original.versionLabel !== 'Bản gốc' && (
            <p className="text-muted-foreground text-xs">{row.original.versionLabel}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'publishedAt',
      header: 'Ngày phát hành',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular">
          {row.original.publishedAt ? formatDate(row.original.publishedAt) : '—'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        module="E2"
        title="Thông cáo báo chí"
        description="Toàn bộ thông tin nguồn của đơn vị: bản thảo, chờ duyệt, đã phát hành, đính chính và thu hồi."
        actions={
          user && can(user.role, 'e2.release.draft') ? (
            <Button asChild>
              <Link to="/thong-cao/moi">
                <Plus className="size-4" />
                Soạn thông cáo
              </Link>
            </Button>
          ) : null
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        searchColumn="title"
        searchPlaceholder="Tìm theo tiêu đề thông cáo..."
        facets={[
          {
            columnId: 'statusLabel',
            label: 'Trạng thái',
            options: Object.values(releaseStatus).map((meta) => ({ value: meta.label, label: meta.label })),
          },
          {
            columnId: 'securityLabel',
            label: 'Bảo mật',
            options: Object.values(securityLevel).map((meta) => ({ value: meta.label, label: meta.label })),
          },
          {
            columnId: 'topic',
            label: 'Lĩnh vực',
            options: db.topics.map((topic) => ({ value: topic.name, label: topic.name })),
          },
        ]}
        onRowClick={(row) => navigate(`/thong-cao/${row.id}`)}
        onExport={() => toast.success('Đã xuất danh sách thông cáo ra tệp Excel (giả lập).')}
        emptyTitle="Chưa có thông cáo nào"
        emptyDescription="Soạn thông cáo đầu tiên để cung cấp thông tin nguồn tới các cơ quan báo chí."
      />
    </div>
  )
}
