import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { actionResult, roleCode } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useDb } from '@/mock/store'
import { userName } from '@/mock/selectors'
import type { RoleCode } from '@/mock/types'

/** E0 — nhật ký thao tác: mọi hành động quan trọng trên hệ thống, kể cả tự động. */
export function AuditLog() {
  const db = useDb()

  const rows = useMemo(
    () =>
      db.audit_logs.map((log) => ({
        ...log,
        actorLabel: log.user_id ? userName(db, log.user_id) : 'Hệ thống tự động',
        resultLabel: actionResult[log.result].label,
      })),
    [db],
  )

  const columns: ColumnDef<(typeof rows)[number], unknown>[] = [
    {
      accessorKey: 'occurred_at',
      header: 'Thời điểm',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular">{formatDateTime(row.original.occurred_at)}</span>
      ),
    },
    {
      accessorKey: 'actorLabel',
      header: 'Người/hệ thống thực hiện',
      cell: ({ row }) => (
        <div>
          <p>{row.original.actorLabel}</p>
          {row.original.acting_role && (
            <p className="text-muted-foreground text-xs">{roleCode[row.original.acting_role as RoleCode].label}</p>
          )}
        </div>
      ),
    },
    { accessorKey: 'action', header: 'Hành động' },
    {
      accessorKey: 'reason',
      header: 'Ghi chú',
      cell: ({ row }) => <span className="text-muted-foreground line-clamp-2 max-w-xs text-xs">{row.original.reason}</span>,
    },
    {
      accessorKey: 'resultLabel',
      header: 'Kết quả',
      cell: ({ row }) => <StatusBadge meta={actionResult[row.original.result]} />,
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        module="E0"
        title="Nhật ký thao tác"
        description="Ghi nhận đầy đủ hành động trên hệ thống, phục vụ tra cứu và điều tra khi cần."
      />
      <DataTable
        data={rows}
        columns={columns}
        searchColumn="action"
        searchPlaceholder="Tìm theo hành động..."
        facets={[
          {
            columnId: 'resultLabel',
            label: 'Kết quả',
            options: Object.values(actionResult).map((meta) => ({ value: meta.label, label: meta.label })),
          },
        ]}
        onExport={() => toast.success('Đã xuất tệp nhật ký phục vụ điều tra (giả lập).')}
        pageSize={20}
        emptyTitle="Chưa có nhật ký nào"
      />
    </div>
  )
}
