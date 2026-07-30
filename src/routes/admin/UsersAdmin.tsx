import { useMemo, useState } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { toast } from 'sonner'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { DataTable } from '@/components/common/DataTable'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { roleCode, userStatus } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useDb, useStore } from '@/mock/store'
import { orgName } from '@/mock/selectors'
import type { RoleCode, User } from '@/mock/types'

/**
 * Đổi vai trò cho một người dùng — tach rieng thanh component co state
 * cua rieng no. Neu newRole/reason la state cua UsersAdmin (cha), moi lan
 * onOpen goi setNewRole/setReason se lam UsersAdmin render lai, columns
 * (khong memo) bi tao lai voi function reference moi, React coi cell
 * "actions" la component khac va remount ActionDialog — xoa mat setOpen(true)
 * vua duoc goi o lan bam dau tien (phai bam lan 2 dialog moi mo).
 */
function RoleChangeDialog({ user, onSave }: { user: User; onSave: (role: RoleCode, reason: string) => void }) {
  const [newRole, setNewRole] = useState<RoleCode>(user.role)
  const [reason, setReason] = useState('')

  return (
    <ActionDialog
      trigger={<button className="text-primary text-xs font-medium hover:underline">Đổi vai trò</button>}
      title={`Đổi vai trò cho ${user.full_name}`}
      description="Vai trò cũ tự động hết hiệu lực; vai trò mới có hiệu lực ngay."
      confirmLabel="Cập nhật"
      onOpen={() => {
        setNewRole(user.role)
        setReason('')
      }}
      onConfirm={() => onSave(newRole, reason || 'Điều chỉnh phân công.')}
    >
      <Field label="Vai trò mới">
        <Select value={newRole} onValueChange={(value) => setNewRole(value as RoleCode)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(roleCode) as RoleCode[]).map((key) => (
              <SelectItem key={key} value={key}>
                {roleCode[key].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Lý do">
        <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} />
      </Field>
    </ActionDialog>
  )
}

/** E0 — người dùng và phân quyền: đổi vai trò, khóa/mở tài khoản. */
export function UsersAdmin() {
  const db = useDb()
  const store = useStore()

  const rows = useMemo(
    () =>
      db.users.map((user) => ({
        ...user,
        org: orgName(db, user.org_id),
        roleLabel: roleCode[user.role].label,
        statusLabel: userStatus[user.status].label,
      })),
    [db],
  )

  const columns: ColumnDef<(typeof rows)[number], unknown>[] = useMemo(() => [
    {
      accessorKey: 'full_name',
      header: 'Người dùng',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-muted-foreground text-xs">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'org', header: 'Tổ chức' },
    {
      accessorKey: 'roleLabel',
      header: 'Vai trò',
      cell: ({ row }) => <StatusBadge meta={roleCode[row.original.role]} dot={false} />,
    },
    {
      accessorKey: 'statusLabel',
      header: 'Trạng thái',
      cell: ({ row }) => <StatusBadge meta={userStatus[row.original.status]} />,
    },
    {
      accessorKey: 'last_login_at',
      header: 'Đăng nhập gần nhất',
      cell: ({ row }) => (
        <span className="font-mono text-xs tabular">{formatDateTime(row.original.last_login_at)}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const targetUser = row.original as User
        return (
          <div className="flex gap-1.5">
            <RoleChangeDialog
              user={targetUser}
              onSave={(role, reason) => {
                store.setUserRole(targetUser.id, role, reason)
                toast.success('Đã cập nhật vai trò.')
              }}
            />

            {targetUser.status === 'LOCKED' ? (
              <button
                className="text-primary text-xs font-medium hover:underline"
                onClick={() => {
                  store.setUserStatus(targetUser.id, 'ACTIVE', 'Mở khóa tài khoản.')
                  toast.success('Đã mở khóa tài khoản.')
                }}
              >
                Mở khóa
              </button>
            ) : (
              targetUser.status === 'ACTIVE' && (
                <button
                  className="text-xs font-medium text-[#8f0e22] hover:underline"
                  onClick={() => {
                    store.setUserStatus(targetUser.id, 'LOCKED', 'Khóa tài khoản theo yêu cầu quản trị.')
                    toast.success('Đã khóa tài khoản.')
                  }}
                >
                  Khóa
                </button>
              )
            )}
          </div>
        )
      },
    },
  ], [store])

  return (
    <div className="space-y-5">
      <PageHeader
        module="E0"
        title="Người dùng và phân quyền"
        description="Quản lý tài khoản, gán vai trò và thu hồi quyền theo ma trận RBAC."
      />
      <DataTable
        data={rows}
        columns={columns}
        searchColumn="full_name"
        searchPlaceholder="Tìm theo tên người dùng..."
        facets={[
          {
            columnId: 'roleLabel',
            label: 'Vai trò',
            options: Object.values(roleCode).map((meta) => ({ value: meta.label, label: meta.label })),
          },
          {
            columnId: 'statusLabel',
            label: 'Trạng thái',
            options: Object.values(userStatus).map((meta) => ({ value: meta.label, label: meta.label })),
          },
        ]}
        emptyTitle="Chưa có người dùng nào"
      />
    </div>
  )
}
