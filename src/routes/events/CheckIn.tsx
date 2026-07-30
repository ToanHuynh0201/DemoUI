import { useState } from 'react'
import { CheckCircle2, QrCode, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatTime } from '@/lib/format'
import { useDb, useStore, type CheckinOutcome } from '@/mock/store'
import { cn } from '@/lib/utils'

/** E5 — check-in bằng mã QR tại cổng sự kiện. Nhập mã mô phỏng việc quét thẻ. */
export function CheckIn() {
  const db = useDb()
  const store = useStore()

  const ongoing = db.events.filter((event) => ['ONGOING', 'INVITATIONS_SENT'].includes(event.status))
  const [eventId, setEventId] = useState(ongoing[0]?.id ?? '')
  const [code, setCode] = useState('')
  const [lastOutcome, setLastOutcome] = useState<CheckinOutcome | null>(null)

  const recentCheckins = db.event_checkins
    .filter((item) => item.event_id === eventId)
    .sort((left, right) => right.occurred_at.localeCompare(left.occurred_at))
    .slice(0, 8)

  const scan = () => {
    if (!eventId || !code.trim()) return
    const outcome = store.checkInByCode(eventId, code.trim(), 'Máy quét cổng chính')
    setLastOutcome(outcome)
    setCode('')
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <PageHeader module="E5" title="Check-in mã QR" description="Chọn sự kiện, quét hoặc nhập mã QR trên thẻ tác nghiệp." />

      <Card>
        <CardContent className="space-y-3 pt-6">
          <Select value={eventId} onValueChange={setEventId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn sự kiện" />
            </SelectTrigger>
            <SelectContent>
              {db.events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.event_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && scan()}
              placeholder="Nhập hoặc quét mã QR..."
              className="font-mono"
              autoFocus
            />
            <Button onClick={scan} disabled={!eventId || !code.trim()}>
              <QrCode className="size-4" />
              Quét
            </Button>
          </div>
        </CardContent>
      </Card>

      {lastOutcome && (
        <Card
          className={cn(
            'border-2',
            lastOutcome.result === 'SUCCESS' ? 'border-[#a8d6bd] bg-[#e6f5ed]' : 'border-[#efb3bd] bg-[#fdeaed]',
          )}
        >
          <CardContent className="flex items-center gap-3 py-5">
            {lastOutcome.result === 'SUCCESS' ? (
              <CheckCircle2 className="size-8 shrink-0 text-[#157f4d]" />
            ) : (
              <XCircle className="size-8 shrink-0 text-[#b3122b]" />
            )}
            <div>
              <p className="font-semibold">
                {lastOutcome.result === 'SUCCESS' ? 'Hợp lệ — cho phép vào' : 'Không hợp lệ — từ chối'}
              </p>
              {lastOutcome.journalistName && (
                <p className="text-sm">
                  {lastOutcome.journalistName} · {lastOutcome.agencyName}
                </p>
              )}
              <p className="text-muted-foreground text-sm">{lastOutcome.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lượt quét gần nhất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {recentCheckins.length === 0 ? (
            <p className="text-muted-foreground text-sm">Chưa có lượt quét nào.</p>
          ) : (
            recentCheckins.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className={item.result === 'SUCCESS' ? '' : 'text-[#8f0e22]'}>
                  {item.result === 'SUCCESS' ? 'Hợp lệ' : item.result === 'DENIED' ? 'Từ chối' : 'Lỗi'}
                  {item.rejection_reason ? ` — ${item.rejection_reason}` : ''}
                </span>
                <span className="text-muted-foreground font-mono text-xs tabular">{formatTime(item.occurred_at)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
