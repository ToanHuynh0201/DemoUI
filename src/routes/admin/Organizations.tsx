import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { organizationStatus, organizationType } from '@/lib/enums'
import { useDb } from '@/mock/store'
import { localityName } from '@/mock/selectors'
import type { Organization } from '@/mock/types'

export function Organizations() {
  const db = useDb()

  const rows = useMemo(
    () =>
      db.organizations.map((org) => ({
        ...org,
        typeLabel: organizationType[org.org_type].label,
        statusLabel: organizationStatus[org.status].label,
        locality: localityName(db, org.locality_id),
      })),
    [db],
  )

  const columns: ColumnDef<(typeof rows)[number], unknown>[] = [
    {
      accessorKey: 'org_name',
      header: 'Tổ chức',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.org_name}</p>
          <p className="text-muted-foreground text-xs">{row.original.org_code}</p>
        </div>
      ),
    },
    { accessorKey: 'typeLabel', header: 'Loại hình' },
    { accessorKey: 'locality', header: 'Địa phương' },
    { accessorKey: 'email', header: 'Liên hệ', cell: ({ row }) => row.original.email ?? '—' },
    {
      accessorKey: 'statusLabel',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge meta={organizationStatus[row.original.status as Organization['status']]} />,
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        module="E0"
        title="Tổ chức"
        description="Sở VHTTDL, các cơ quan phát ngôn, cơ quan báo chí và cơ quan nhà nước tham gia nền tảng."
      />
      <DataTable
        data={rows}
        columns={columns}
        searchColumn="org_name"
        searchPlaceholder="Tìm theo tên tổ chức..."
        facets={[
          {
            columnId: 'typeLabel',
            label: 'Loại hình',
            options: Object.values(organizationType).map((meta) => ({ value: meta.label, label: meta.label })),
          },
        ]}
        emptyTitle="Chưa có tổ chức nào"
      />
    </div>
  )
}
