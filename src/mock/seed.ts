/**
 * Nạp dữ liệu demo từ các file JSON và quy đổi mốc thời gian tương đối.
 *
 * Trong file JSON, mọi mốc thời gian được ghi dưới dạng token `@<số ngày>` để bản
 * demo không bị cũ đi: `@0T08:30` là 08h30 hôm nay, `@-14T09:00` là 09h00 của 14
 * ngày trước, `@+3` là 3 ngày tới (mặc định 09h00). Ngày cố định thật (ví dụ ngày
 * cấp thẻ nhà báo) vẫn viết nguyên dạng `2023-01-10` và được giữ nguyên.
 */
import type { Database } from './types'

import core from './data/core.json'
import e1 from './data/e1.json'
import e2 from './data/e2.json'
import e34 from './data/e34.json'
import e5 from './data/e5.json'
import e6 from './data/e6.json'
import platform from './data/platform.json'

const TOKEN = /^@([+-]?\d+)(?:T(\d{2}):(\d{2}))?$/

/** Mốc gốc để quy đổi token — cố định một lần khi nạp, để mọi màn hình nhất quán. */
const NOW = new Date()

export function resolveToken(value: string): string {
  const match = TOKEN.exec(value)
  if (!match) return value
  const [, days, hours, minutes] = match
  const date = new Date(NOW)
  date.setDate(date.getDate() + Number(days))
  date.setHours(hours ? Number(hours) : 9, minutes ? Number(minutes) : 0, 0, 0)
  return date.toISOString()
}

function resolveDeep<T>(input: T): T {
  if (typeof input === 'string') return resolveToken(input) as unknown as T
  if (Array.isArray(input)) return input.map(resolveDeep) as unknown as T
  if (input && typeof input === 'object') {
    const output: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(input)) output[key] = resolveDeep(value)
    return output as T
  }
  return input
}

export function createSeedDatabase(): Database {
  const merged = {
    ...core,
    ...e1,
    ...e2,
    ...e34,
    ...e5,
    ...e6,
    ...platform,
  }
  return resolveDeep(merged) as unknown as Database
}
