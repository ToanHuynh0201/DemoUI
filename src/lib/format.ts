/** Định dạng hiển thị dùng chung — luôn theo quy ước Việt Nam. */
import { differenceInCalendarDays, format, formatDistanceToNowStrict, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'

function toDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = typeof value === 'string' ? parseISO(value) : value
  return Number.isNaN(date.getTime()) ? null : date
}

/** 05/03/2026 */
export function formatDate(value?: string | Date | null): string {
  const date = toDate(value)
  return date ? format(date, 'dd/MM/yyyy') : '—'
}

/** 05/03/2026 14:30 */
export function formatDateTime(value?: string | Date | null): string {
  const date = toDate(value)
  return date ? format(date, 'dd/MM/yyyy HH:mm') : '—'
}

/** 14:30 */
export function formatTime(value?: string | Date | null): string {
  const date = toDate(value)
  return date ? format(date, 'HH:mm') : '—'
}

/** Thứ Năm, 05/03/2026 */
export function formatDateLong(value?: string | Date | null): string {
  const date = toDate(value)
  return date ? format(date, "EEEE, dd/MM/yyyy", { locale: vi }) : '—'
}

/** "3 ngày trước" */
export function formatRelative(value?: string | Date | null): string {
  const date = toDate(value)
  if (!date) return '—'
  return formatDistanceToNowStrict(date, { addSuffix: true, locale: vi })
}

export interface DeadlineInfo {
  /** Số ngày còn lại; âm nghĩa là đã quá hạn */
  days: number
  label: string
  tone: 'neutral' | 'warning' | 'critical' | 'good'
}

/** Đếm ngược tới hạn xử lý — dùng ở bảng câu hỏi và ô việc của tôi. */
export function deadlineInfo(dueAt?: string | null, now: Date = new Date()): DeadlineInfo | null {
  const date = toDate(dueAt)
  if (!date) return null
  const days = differenceInCalendarDays(date, now)
  if (days < 0) return { days, label: `Quá hạn ${Math.abs(days)} ngày`, tone: 'critical' }
  if (days === 0) return { days, label: 'Đến hạn hôm nay', tone: 'critical' }
  if (days <= 2) return { days, label: `Còn ${days} ngày`, tone: 'warning' }
  return { days, label: `Còn ${days} ngày`, tone: 'neutral' }
}

/** 1,2 MB */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1).replace('.', ',')} ${units[unitIndex]}`
}

/** 03:24 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '—'
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

/** 12.480 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value)
}

/** 87,5% */
export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace('.', ',')}%`
}

/** Chữ cái đầu của họ tên, dùng cho ảnh đại diện dự phòng */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
