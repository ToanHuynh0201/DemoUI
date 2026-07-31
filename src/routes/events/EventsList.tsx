import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/DataTable'
import { DocCode, PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { eventStatus } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useCurrentUser, useDb } from '@/mock/store'
import { orgName } from '@/mock/selectors'
import type { EventItem } from '@/mock/types'

export function EventsList() {
  const db = useDb()
  const user = useCurrentUser()
  const navigate = useNavigate()

  const rows = useMemo(
    () =>
      db.events
        .map((event) => {
          const invitations = db.invitations.filter((item) => item.event_id === event.id)
          return {
            ...event,
            org: orgName(db, event.org_id),
            statusLabel: eventStatus[event.status].label,
            invitedCount: invitations.length,
            acceptedCount: invitations.filter((item) => item.status === 'ACCEPTED').length,
          }
        })
        .sort((left, right) => right.start_time.localeCompare(left.start_time)),
    [db],
  )

  const columns: ColumnDef<(typeof rows)[number], unknown>[] = [
    {
      accessorKey: 'event_name',
      header: 'Sự kiện',
      cell: ({ row }) => (
        <div>
          <div className="mb-0.5"><DocCode>{row.original.event_code}</DocCode></div>
          <p className="font-medium">{row.original.event_name}</p>
          <p className="text-muted-foreground text-xs">{row.original.org} · {row.original.venue}</p>
        </div>
      ),
    },
    {
      accessorKey: 'start_time',
      header: 'Thời gian',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular">{formatDateTime(row.original.start_time)}</span>
      ),
    },
    {
      accessorKey: 'statusLabel',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge meta={eventStatus[row.original.status as EventItem['status']]} />,
    },
    {
      accessorKey: 'acceptedCount',
      header: 'Xác nhận tham dự',
      cell: ({ row }) => (
        <span className="font-mono text-sm tabular">
          {row.original.acceptedCount}/{row.original.invitedCount}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        module="E5"
        title="Sự kiện và giấy mời"
        description="Họp báo, lễ công bố, Festival — quản lý giấy mời điện tử và thẻ tác nghiệp cho báo chí."
        actions={
          user ? (
            <Button asChild>
              <Link to="/su-kien/moi">
                <Plus className="size-4" />
                Tạo sự kiện
              </Link>
            </Button>
          ) : null
        }
      />
      <DataTable
        data={rows}
        columns={columns}
        searchColumn="event_name"
        searchPlaceholder="Tìm theo tên sự kiện..."
        facets={[
          {
            columnId: 'statusLabel',
            label: 'Trạng thái',
            options: Object.values(eventStatus).map((meta) => ({ value: meta.label, label: meta.label })),
          },
        ]}
        onRowClick={(row) => navigate(`/su-kien/${row.id}`)}
        emptyTitle="Chưa có sự kiện nào"
      />
    </div>
  )
}
