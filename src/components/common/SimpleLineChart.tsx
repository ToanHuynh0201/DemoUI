import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/lib/format'

export interface LineDatum {
  label: string
  value: number
}

/** Biểu đồ đường đơn giản dùng chung — xu hướng theo thời gian, một chuỗi số liệu. */
export function SimpleLineChart({
  data,
  height = 220,
  color = 'var(--chart-1)',
  valueLabel = 'Số lượng',
  /** Bỏ trục và lưới — dùng cho sparkline nhỏ trong thẻ tóm tắt */
  compact = false,
}: {
  data: LineDatum[]
  height?: number
  color?: string
  valueLabel?: string
  compact?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 4, right: compact ? 4 : 16, top: 8, bottom: 4 }}>
        {!compact && <CartesianGrid vertical={false} stroke="var(--border)" />}
        {!compact && (
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
          />
        )}
        {!compact && (
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
            tickLine={false}
            axisLine={false}
            width={36}
            tickFormatter={formatNumber}
          />
        )}
        {!compact && (
          <Tooltip
            formatter={(value) => [formatNumber(Number(value)), valueLabel]}
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              fontSize: 12,
            }}
          />
        )}
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} activeDot={compact ? false : { r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
