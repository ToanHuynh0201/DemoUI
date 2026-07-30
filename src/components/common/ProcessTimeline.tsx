import { cn } from '@/lib/utils'
import type { Tone } from '@/lib/enums'
import { formatDate, formatTime } from '@/lib/format'

export interface TimelineEntry {
  id: string
  occurredAt: string
  /** Nội dung chính, thường là bước chuyển trạng thái */
  title: React.ReactNode
  /** Người thực hiện và vai trò */
  actor?: string
  note?: string
  tone?: Tone
}

const NODE_CLASS: Record<Tone, string> = {
  neutral: 'border-slate-400 bg-slate-100',
  info: 'border-[#0b4f9e] bg-[#e7effa]',
  warning: 'border-[#b4690e] bg-[#fdf3e2]',
  good: 'border-[#157f4d] bg-[#e6f5ed]',
  critical: 'border-[#b3122b] bg-[#fdeaed]',
}

/**
 * Dòng thời gian lưu vết — thành phần đặc trưng của nền tảng.
 *
 * Yêu cầu nghiệp vụ đặt trọng tâm vào việc "mọi tương tác được định danh, phân
 * luồng, lưu vết, đo lường", nên mọi màn hình chi tiết đều gắn dải này: ai làm,
 * lúc nào, chuyển sang trạng thái gì, vì lý do gì. Mốc thời gian dùng chữ đều
 * nét để các dòng thẳng cột, đọc nhanh như sổ theo dõi công văn.
 */
export function ProcessTimeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground py-4 text-sm">Chưa có thao tác nào được ghi nhận.</p>
  }

  return (
    <ol className="relative">
      {entries.map((entry, index) => {
        const tone = entry.tone ?? 'neutral'
        const isLast = index === entries.length - 1
        return (
          <li key={entry.id} className="relative grid grid-cols-[64px_20px_1fr] gap-x-2">
            <div className="pt-1 text-right">
              <div className="font-mono text-xs leading-4 font-medium tabular">{formatTime(entry.occurredAt)}</div>
              <div className="text-muted-foreground font-mono text-[11px] leading-4 tabular">
                {formatDate(entry.occurredAt)}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full border-2', NODE_CLASS[tone])} aria-hidden />
              {!isLast && <span className="bg-border w-px flex-1" aria-hidden />}
            </div>

            <div className={cn('min-w-0', isLast ? 'pb-1' : 'pb-5')}>
              <div className="text-sm leading-5 font-medium">{entry.title}</div>
              {entry.actor && <div className="text-muted-foreground text-xs">{entry.actor}</div>}
              {entry.note && <p className="mt-1 text-sm leading-5 text-pretty">{entry.note}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
