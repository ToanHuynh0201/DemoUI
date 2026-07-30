import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { roleCode, securityLevel } from '@/lib/enums'
import { useDb, useStore } from '@/mock/store'
import type { SecurityLevel } from '@/mock/types'

const LEVELS: SecurityLevel[] = ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL']

/** E6 — ma trận quyền truy cập tài nguyên theo mức bảo mật × vai trò. */
export function AccessRules() {
  const db = useDb()
  const setAccessRule = useStore((state) => state.setAccessRule)

  return (
    <div className="space-y-5">
      <PageHeader
        module="E6"
        title="Quyền truy cập tài nguyên theo mức bảo mật"
        description="Xác định vai trò nào được xem và tải tài nguyên ở từng mức bảo mật. Thay đổi có hiệu lực ngay."
      />

      {LEVELS.map((level) => (
        <Card key={level}>
          <CardContent className="py-4">
            <p className="mb-3 text-sm font-semibold">{securityLevel[level].label}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left text-xs">
                    <th className="pb-2 font-medium">Vai trò</th>
                    <th className="pb-2 text-center font-medium">Được xem</th>
                    <th className="pb-2 text-center font-medium">Được tải về</th>
                  </tr>
                </thead>
                <tbody>
                  {db.asset_access_rules
                    .filter((rule) => rule.security_level === level)
                    .map((rule) => {
                      const role = db.roles.find((item) => item.id === rule.role_id)
                      if (!role) return null
                      return (
                        <tr key={rule.id} className="border-b last:border-0">
                          <td className="py-2">{roleCode[role.role_code].label}</td>
                          <td className="py-2 text-center">
                            <Checkbox
                              checked={rule.can_view}
                              onCheckedChange={(checked) => {
                                setAccessRule(rule.id, { can_view: Boolean(checked) })
                                toast.success('Đã cập nhật quyền truy cập.')
                              }}
                            />
                          </td>
                          <td className="py-2 text-center">
                            <Checkbox
                              checked={rule.can_download}
                              disabled={!rule.can_view}
                              onCheckedChange={(checked) => {
                                setAccessRule(rule.id, { can_download: Boolean(checked) })
                                toast.success('Đã cập nhật quyền truy cập.')
                              }}
                            />
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
