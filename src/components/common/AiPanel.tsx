import { useEffect, useState } from 'react'
import { Check, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/lib/format'
import { AI_TASK_LABELS, runAiTask, type AiResult, type AiTaskKind } from '@/mock/ai'
import type { Tone } from '@/lib/enums'

const ITEM_TONE: Record<Tone, string> = {
  neutral: 'text-foreground',
  info: 'text-[#0b4f9e]',
  warning: 'text-[#8a4f06]',
  good: 'text-[#0f6640]',
  critical: 'text-[#8f0e22]',
}

interface AiPanelProps {
  kind: AiTaskKind
  inputId?: string
  /** Nút chấp nhận kết quả — chỉ hiện khi có việc để làm với kết quả */
  onAccept?: (result: AiResult) => void
  acceptLabel?: string
  /** Chạy ngay khi hiển thị, dùng cho các bảng phân tích luôn cần kết quả */
  autoRun?: boolean
  className?: string
}

/**
 * Khối gợi ý của AI. Kết quả luôn được gắn nhãn rõ ràng kèm độ tin cậy, và người
 * dùng phải chủ động chấp nhận — hệ thống không tự áp kết quả AI vào hồ sơ.
 */
export function AiPanel({
  kind,
  inputId,
  onAccept,
  acceptLabel = 'Chấp nhận gợi ý',
  autoRun = false,
  className,
}: AiPanelProps) {
  const [state, setState] = useState<'idle' | 'running' | 'done'>(autoRun ? 'running' : 'idle')
  const [result, setResult] = useState<AiResult | null>(null)

  const run = () => {
    setState('running')
    setResult(null)
    runAiTask(kind, inputId).then((value) => {
      setResult(value)
      setState('done')
    })
  }

  // Các bảng phân tích luôn cần kết quả nên chạy ngay khi mở màn hình
  useEffect(() => {
    if (!autoRun) return
    let active = true
    setState('running')
    runAiTask(kind, inputId).then((value) => {
      if (!active) return
      setResult(value)
      setState('done')
    })
    return () => {
      active = false
    }
  }, [autoRun, kind, inputId])

  return (
    <section
      className={cn(
        'rounded-md border border-dashed border-[#b3cbe6] bg-[#f5f9ff] p-4',
        className,
      )}
      aria-label={AI_TASK_LABELS[kind]}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-[#0b4f9e]" aria-hidden />
          <span className="text-sm font-semibold text-[#0b3b75]">{AI_TASK_LABELS[kind]}</span>
          <span className="rounded border border-[#b3cbe6] bg-white px-1.5 py-0.5 text-[11px] font-medium text-[#0b3b75]">
            Gợi ý AI
          </span>
        </div>
        {state !== 'running' && (
          <Button size="sm" variant={state === 'done' ? 'ghost' : 'default'} onClick={run}>
            {state === 'done' ? 'Chạy lại' : 'Chạy'}
          </Button>
        )}
      </div>

      {state === 'idle' && (
        <p className="text-muted-foreground mt-2 text-sm">
          Kết quả do AI đề xuất, cần người dùng kiểm tra trước khi sử dụng.
        </p>
      )}

      {state === 'running' && (
        <div className="mt-3 space-y-2" aria-live="polite">
          <p className="text-sm text-[#0b3b75]">AI đang xử lý...</p>
          <Skeleton className="h-3 w-4/5 bg-[#dbe7f5]" />
          <Skeleton className="h-3 w-full bg-[#dbe7f5]" />
          <Skeleton className="h-3 w-2/3 bg-[#dbe7f5]" />
        </div>
      )}

      {state === 'done' && result && (
        <div className="mt-3 space-y-3" aria-live="polite">
          {result.headline && <p className="text-sm font-medium">{result.headline}</p>}
          {result.body && (
            <p className="text-sm leading-6 whitespace-pre-line text-pretty">{result.body}</p>
          )}

          {result.items && result.items.length > 0 && (
            <ul className="space-y-1.5">
              {result.items.map((item) => (
                <li key={item.label} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className={cn('font-medium', ITEM_TONE[item.tone ?? 'neutral'])}>{item.label}</span>
                  {item.detail && <span className="text-muted-foreground">— {item.detail}</span>}
                  {item.confidence !== undefined && (
                    <span className="text-muted-foreground font-mono text-xs tabular">
                      {formatPercent(item.confidence * 100, 0)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center justify-between gap-2 border-t border-[#dbe7f5] pt-2">
            <span className="text-muted-foreground font-mono text-xs tabular">
              Độ tin cậy tổng thể {formatPercent(result.confidence * 100, 0)}
            </span>
            {onAccept && (
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setState('idle')}>
                  <X className="size-4" />
                  Bỏ qua
                </Button>
                <Button size="sm" onClick={() => onAccept(result)}>
                  <Check className="size-4" />
                  {acceptLabel}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
