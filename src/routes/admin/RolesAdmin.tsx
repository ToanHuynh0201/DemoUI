import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/common/StatusBadge'
import { ROLE_CAPABILITIES } from '@/lib/permissions'
import { useDb } from '@/mock/store'
import type { RoleCode } from '@/mock/types'

/** E0 — vai trò và quyền: xem tập quyền hiện có của từng vai trò hệ thống. */
export function RolesAdmin() {
  const db = useDb()

  return (
    <div className="space-y-5">
      <PageHeader
        module="E0"
        title="Vai trò và quyền"
        description="9 vai trò hệ thống theo RBAC_Matrix.md. Vai trò hệ thống không thể xóa."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {db.roles.map((role) => (
          <Card key={role.id}>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">{role.role_name}</CardTitle>
              {role.is_system_role && <StatusBadge meta={{ label: 'Vai trò hệ thống', tone: 'neutral' }} />}
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-sm">{role.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ROLE_CAPABILITIES[role.role_code as RoleCode].map((capability) => (
                  <span
                    key={capability}
                    className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-mono text-[11px]"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
