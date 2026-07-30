import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge, ToneText } from '@/components/common/StatusBadge'
import { profileStatus } from '@/lib/enums'
import { deadlineInfo, formatDate, initials } from '@/lib/format'
import { useDb } from '@/mock/store'
import { orgName, userById } from '@/mock/selectors'
import type { ProfileStatus } from '@/mock/types'

interface Row {
  id: string
  name: string
  agency: string
  cardNo: string
  status: ProfileStatus
  statusLabel: string
  expiryAt: string | null
  complianceScore: number | null
}

export function JournalistsList() {
  const db = useDb()
  const navigate = useNavigate()

  const rows: Row[] = useMemo(
    () =>
      db.journalist_profiles.map((profile) => {
        const user = userById(db, profile.user_id)
        return {
          id: profile.id,
          name: user?.full_name ?? '—',
          agency: orgName(db, profile.press_agency_id),
          cardNo: profile.press_card_no ?? '—',
          status: profile.status,
          statusLabel: profileStatus[profile.status].label,
          expiryAt: profile.press_card_expiry_date ?? null,
          complianceScore: profile.compliance_score ?? null,
        }
      }),
    [db],
  )

  const columns: ColumnDef<Row, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Phóng viên',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials(row.original.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-muted-foreground text-xs">{row.original.agency}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'cardNo',
      header: 'Số thẻ nhà báo',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.cardNo}</span>,
    },
    {
      accessorKey: 'statusLabel',
      header: 'Trạng thái hồ sơ',
      cell: ({ row }) => <StatusBadge meta={profileStatus[row.original.status]} />,
    },
    {
      accessorKey: 'expiryAt',
      header: 'Hạn thẻ',
      cell: ({ row }) => {
        if (!row.original.expiryAt) return <span className="text-muted-foreground">—</span>
        const info = deadlineInfo(row.original.expiryAt)
        return (
          <div className="space-y-0.5">
            <div className="font-mono text-xs tabular">{formatDate(row.original.expiryAt)}</div>
            {info && info.days <= 30 && (
              <ToneText tone={info.tone}>
                <span className="text-xs">{info.label}</span>
              </ToneText>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'complianceScore',
      header: 'Điểm tuân thủ',
      cell: ({ row }) =>
        row.original.complianceScore == null ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          <span
            className={
              row.original.complianceScore < 70
                ? 'font-mono text-sm font-semibold tabular text-[#8f0e22]'
                : 'font-mono text-sm tabular'
            }
          >
            {row.original.complianceScore}
          </span>
        ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        module="E1"
        title="Danh sách phóng viên"
        description="Hồ sơ nhà báo, thẻ tác nghiệp, điểm tuân thủ và cơ quan báo chí chủ quản."
      />
      <DataTable
        data={rows}
        columns={columns}
        searchColumn="name"
        searchPlaceholder="Tìm theo tên phóng viên..."
        facets={[
          {
            columnId: 'statusLabel',
            label: 'Trạng thái',
            options: Object.values(profileStatus).map((meta) => ({ value: meta.label, label: meta.label })),
          },
          {
            columnId: 'agency',
            label: 'Cơ quan báo chí',
            options: Array.from(new Set(rows.map((row) => row.agency))).map((value) => ({ value, label: value })),
          },
        ]}
        onRowClick={(row) => navigate(`/phong-vien/${row.id}`)}
        onExport={() => toast.success('Đã xuất danh sách phóng viên ra tệp Excel (giả lập).')}
        emptyTitle="Chưa có hồ sơ phóng viên nào"
      />
    </div>
  )
}
