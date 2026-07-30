import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Field } from '@/components/common/ActionDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/mock/store'

/** E5 — tạo sự kiện họp báo / lễ công bố / Festival. */
export function ComposeEvent() {
  const navigate = useNavigate()
  const createEvent = useStore((state) => state.createEvent)

  const [eventName, setEventName] = useState('')
  const [eventType, setEventType] = useState('Họp báo chuyên đề')
  const [description, setDescription] = useState('')
  const [venue, setVenue] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [rsvpDeadline, setRsvpDeadline] = useState('')

  const ready = eventName.trim().length > 4 && startTime && venue.trim().length > 3

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader module="E5" title="Tạo sự kiện" description="Sau khi tạo, bạn có thể gửi giấy mời điện tử tới phóng viên." />

      <Card>
        <CardContent className="space-y-4 pt-6">
          <Field label="Tên sự kiện">
            <Input value={eventName} onChange={(event) => setEventName(event.target.value)} />
          </Field>
          <Field label="Loại sự kiện">
            <Input value={eventType} onChange={(event) => setEventType(event.target.value)} />
          </Field>
          <Field label="Mô tả">
            <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
          </Field>
          <Field label="Địa điểm">
            <Input value={venue} onChange={(event) => setVenue(event.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bắt đầu">
              <Input type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
            </Field>
            <Field label="Kết thúc">
              <Input type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </Field>
          </div>
          <Field label="Hạn phản hồi tham dự">
            <Input type="datetime-local" value={rsvpDeadline} onChange={(event) => setRsvpDeadline(event.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/su-kien')}>
          Hủy
        </Button>
        <Button
          disabled={!ready}
          onClick={() => {
            const id = createEvent({
              eventName: eventName.trim(),
              eventType,
              description,
              venue,
              startTime: new Date(startTime).toISOString(),
              endTime: endTime ? new Date(endTime).toISOString() : null,
              rsvpDeadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null,
            })
            toast.success('Đã tạo sự kiện.')
            navigate(`/su-kien/${id}`)
          }}
        >
          Tạo sự kiện
        </Button>
      </div>
    </div>
  )
}
