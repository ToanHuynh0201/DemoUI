import { cn } from '@/lib/utils'
import type { EnumMeta, Tone } from '@/lib/enums'

const TONE_CLASS: Record<Tone, string> = {
  neutral: 'border-slate-300 bg-slate-100 text-slate-700',
  info: 'border-[#b3cbe6] bg-[#e7effa] text-[#0b3b75]',
  warning: 'border-[#e4c68a] bg-[#fdf3e2] text-[#8a4f06]',
  good: 'border-[#a8d6bd] bg-[#e6f5ed] text-[#0f6640]',
  critical: 'border-[#efb3bd] bg-[#fdeaed] text-[#8f0e22]',
}

const DOT_CLASS: Record<Tone, string> = {
  neutral: 'bg-slate-500',
  info: 'bg-[#0b4f9e]',
  warning: 'bg-[#b4690e]',
  good: 'bg-[#157f4d]',
  critical: 'bg-[#b3122b]',
}

interface StatusBadgeProps {
  meta: EnumMeta
  /** Chấm màu ở đầu — dùng khi nhãn đứng trong bảng dày đặc */
  dot?: boolean
  className?: string
}

/**
 * Nhãn trạng thái dùng chung. Màu luôn đi kèm chữ, không bao giờ chỉ có màu,
 * để người khó phân biệt màu vẫn đọc được trạng thái.
 */
export function StatusBadge({ meta, dot = true, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        TONE_CLASS[meta.tone],
        className,
      )}
    >
      {dot && <span className={cn('size-1.5 shrink-0 rounded-full', DOT_CLASS[meta.tone])} aria-hidden />}
      {meta.label}
    </span>
  )
}

/** Biến thể chỉ có chữ, dùng trong câu văn hoặc chú thích. */
export function ToneText({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const color: Record<Tone, string> = {
    neutral: 'text-muted-foreground',
    info: 'text-[#0b4f9e]',
    warning: 'text-[#8a4f06]',
    good: 'text-[#0f6640]',
    critical: 'text-[#8f0e22]',
  }
  return <span className={cn('font-medium', color[tone])}>{children}</span>
}
