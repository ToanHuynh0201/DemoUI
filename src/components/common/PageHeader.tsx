import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  /** Mã phân hệ, ví dụ "E4" — neo màn hình vào tài liệu use case */
  module?: string
  title: string
  description?: string
  backTo?: string
  backLabel?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  module,
  title,
  description,
  backTo,
  backLabel = 'Quay lại',
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {backTo && (
        <Link
          to={backTo}
          className="text-muted-foreground hover:text-primary inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {module && (
              <span className="border-primary/30 bg-primary/5 text-primary rounded border px-1.5 py-0.5 font-mono text-[11px] font-semibold">
                {module}
              </span>
            )}
            <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          </div>
          {description && <p className="text-muted-foreground max-w-3xl text-sm">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/** Mã văn bản (thông cáo, câu hỏi, sự kiện) — luôn hiển thị bằng chữ đều nét. */
export function DocCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('doc-code', className)}>{children}</span>
}

/** Ô số liệu nhỏ dùng trong đầu trang chi tiết. */
export function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  )
}
