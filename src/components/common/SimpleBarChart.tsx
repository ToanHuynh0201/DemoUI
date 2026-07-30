import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatNumber } from '@/lib/format'

export interface BarDatum {
  label: string
  value: number
}

/**
 * Biểu đồ cột ngang đơn giản dùng chung cho các bảng xếp hạng (top cơ quan, top
 * lĩnh vực...). Một chuỗi dữ liệu — không cần chú giải màu, chỉ một màu chủ đạo.
 */
export function SimpleBarChart({
  data,
  height = 260,
  valueLabel = 'Số lượng',
  color = 'var(--chart-1)',
}: {
  data: BarDatum[]
  height?: number
  valueLabel?: string
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--border)" />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} tickFormatter={formatNumber} />
        <YAxis
          type="category"
          dataKey="label"
          width={150}
          tick={{ fontSize: 12, fill: 'var(--foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: 'var(--muted)' }}
          formatter={(value) => [formatNumber(Number(value)), valueLabel]}
          contentStyle={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  )
}
