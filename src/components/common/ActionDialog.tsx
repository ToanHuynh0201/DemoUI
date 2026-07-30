import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface ActionDialogProps {
  trigger: React.ReactNode
  title: string
  description?: string
  confirmLabel: string
  confirmVariant?: 'default' | 'destructive' | 'outline'
  /** Trả về false để giữ hộp thoại mở (ví dụ khi thiếu dữ liệu bắt buộc) */
  onConfirm: () => boolean | void
  disabled?: boolean
  children?: React.ReactNode
  /** Đặt lại nội dung form mỗi lần mở */
  onOpen?: () => void
}

/**
 * Hộp thoại xác nhận cho các hành động nghiệp vụ (duyệt, trả lại, thu hồi, phân
 * công...). Gom lại một chỗ để mọi hành động có cùng bố cục và cùng cách hỏi lý do.
 */
export function ActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  confirmVariant = 'default',
  onConfirm,
  disabled,
  children,
  onOpen,
}: ActionDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) onOpen?.()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="space-y-4 py-1">{children}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button
            variant={confirmVariant}
            disabled={disabled}
            onClick={() => {
              if (onConfirm() !== false) setOpen(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/** Nhãn + nội dung cho một trường trong hộp thoại. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}
