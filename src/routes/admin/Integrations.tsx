import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { externalSystemCode, integrationStatus } from '@/lib/enums'
import { formatDateTime } from '@/lib/format'
import { useDb, useStore } from '@/mock/store'

/** E0 — tích hợp hệ thống ngoài: kiểm tra kết nối, xem log gần nhất. */
export function Integrations() {
  const db = useDb()
  const testIntegration = useStore((state) => state.testIntegration)

  return (
    <div className="space-y-5">
      <PageHeader
        module="E0"
        title="Tích hợp hệ thống ngoài"
        description="IOC, Cổng dịch vụ công, văn bản điện tử, Zalo OA/SMS/Email, CMS báo chí, ký số, MAM/DAM."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {db.integrations.map((integration) => {
          const logs = db.integration_logs
            .filter((log) => log.integration_id === integration.id)
            .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))
            .slice(0, 3)
          return (
            <Card key={integration.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{integration.display_name}</p>
                    <p className="text-muted-foreground font-mono text-xs">
                      {externalSystemCode[integration.system_code].label}
                    </p>
                  </div>
                  <StatusBadge meta={integrationStatus[integration.status]} />
                </div>
                <p className="text-muted-foreground text-xs">{integration.last_check_result}</p>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs tabular">
                    Kiểm tra lần cuối: {formatDateTime(integration.last_checked_at)}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      testIntegration(integration.id)
                      toast.success('Đã kiểm tra kết nối.')
                    }}
                  >
                    <RefreshCw className="size-3.5" />
                    Kiểm tra
                  </Button>
                </div>
                {logs.length > 0 && (
                  <div className="space-y-1 border-t pt-2">
                    {logs.map((log) => (
                      <div key={log.id} className="text-muted-foreground flex justify-between text-xs">
                        <span className="truncate">{log.payload_summary}</span>
                        <span className={log.is_success ? '' : 'font-medium text-[#8f0e22]'}>
                          {log.status_code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
