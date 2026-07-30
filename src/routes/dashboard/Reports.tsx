import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { Field } from '@/components/common/ActionDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StatusBadge } from '@/components/common/StatusBadge'
import { reportFormat, reportJobStatus } from '@/lib/enums'
import { formatDateTime, formatNumber } from '@/lib/format'
import { useDb, useStore } from '@/mock/store'
import { userName } from '@/mock/selectors'
import type { ReportFormat } from '@/mock/types'

/** E9 — tạo và xuất báo cáo định kỳ; khối lượng lớn xử lý dưới dạng job nền. */
export function Reports() {
  const db = useDb()
  const store = useStore()

  const [reportName, setReportName] = useState('Báo cáo hoạt động cung cấp thông tin cho báo chí')
  const [periodFrom, setPeriodFrom] = useState('')
  const [periodTo, setPeriodTo] = useState('')
  const [format, setFormat] = useState<ReportFormat>('PDF')

  // Job nền: tự tiến triển tiến độ để mô phỏng xử lý dữ liệu lớn
  useEffect(() => {
    const interval = setInterval(() => {
      db.report_jobs.filter((job) => job.status === 'RUNNING').forEach((job) => store.advanceReportJob(job.id))
    }, 1200)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db.report_jobs.length])

  const jobs = [...db.report_jobs].sort((left, right) => right.created_at.localeCompare(left.created_at))

  return (
    <div className="space-y-5">
      <PageHeader
        module="E9"
        title="Báo cáo định kỳ"
        description="Xuất báo cáo PDF/Excel theo giai đoạn. Khối lượng dữ liệu lớn được xử lý ở chế độ nền."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tạo báo cáo mới</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Tên báo cáo">
            <Input value={reportName} onChange={(event) => setReportName(event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Từ ngày">
              <Input type="date" value={periodFrom} onChange={(event) => setPeriodFrom(event.target.value)} />
            </Field>
            <Field label="Đến ngày">
              <Input type="date" value={periodTo} onChange={(event) => setPeriodTo(event.target.value)} />
            </Field>
            <Field label="Định dạng">
              <Select value={format} onValueChange={(value) => setFormat(value as ReportFormat)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="EXCEL">Excel</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Button
            disabled={!reportName.trim() || !periodFrom || !periodTo}
            onClick={() => {
              store.createReportJob({
                reportName: reportName.trim(),
                periodFrom: new Date(periodFrom).toISOString(),
                periodTo: new Date(periodTo).toISOString(),
                format,
              })
              toast.success('Đã đưa yêu cầu xuất báo cáo vào hàng đợi xử lý.')
            }}
          >
            Tạo báo cáo
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardContent className="space-y-2 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{job.report_name}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDateTime(job.period_from)} — {formatDateTime(job.period_to)} · {reportFormat[job.format].label} ·{' '}
                    {userName(db, job.requested_by_id)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge meta={reportJobStatus[job.status]} />
                  {job.status === 'READY' && (
                    <Button size="sm" variant="outline" onClick={() => toast.success('Đã tải báo cáo (giả lập).')}>
                      <Download className="size-4" />
                      Tải về
                    </Button>
                  )}
                </div>
              </div>
              {job.status === 'RUNNING' && <Progress value={job.progress} className="h-1.5" />}
              {job.status === 'READY' && job.row_count && (
                <p className="text-muted-foreground text-xs">{formatNumber(job.row_count)} dòng dữ liệu</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
