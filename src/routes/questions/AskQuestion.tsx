import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { AiPanel } from '@/components/common/AiPanel'
import { Field } from '@/components/common/ActionDialog'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { priority as priorityLabels } from '@/lib/enums'
import { useDb, useStore } from '@/mock/store'
import type { Priority } from '@/mock/types'

export function AskQuestion() {
  const db = useDb()
  const navigate = useNavigate()
  const submitQuestion = useStore((state) => state.submitQuestion)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [topicId, setTopicId] = useState('')
  const [priority, setPriority] = useState<Priority>('NORMAL')
  const [deadline, setDeadline] = useState('')

  const ready = title.trim().length > 8 && content.trim().length > 20

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        module="E3"
        title="Gửi câu hỏi tới cơ quan phát ngôn"
        description="Câu hỏi được gửi qua kênh chính thống, hệ thống tự phân loại và chuyển tới đúng cơ quan có thẩm quyền trả lời."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nội dung câu hỏi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Tiêu đề" hint="Nêu trọng tâm câu hỏi trong một câu, giúp điều phối viên chuyển đúng đầu mối.">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ví dụ: Tiến độ giải phóng mặt bằng dự án đường ven biển hiện ra sao?"
            />
          </Field>

          <Field label="Nội dung chi tiết" hint="Nêu rõ từng ý cần trả lời, đánh số nếu có nhiều câu hỏi.">
            <Textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              placeholder="Trình bày bối cảnh và các nội dung đề nghị cơ quan phát ngôn trả lời..."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Lĩnh vực">
              <Select value={topicId} onValueChange={setTopicId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  {db.topics
                    .filter((topic) => topic.is_active)
                    .map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Độ ưu tiên">
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(priorityLabels) as Priority[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {priorityLabels[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Hạn đề nghị trả lời">
              <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <AiPanel
        kind="classify_question"
        acceptLabel="Dùng lĩnh vực AI gợi ý"
        onAccept={(result) => {
          const suggested = result.items?.find((item) => item.label === 'Chủ đề')?.detail
          const topic = db.topics.find((item) => item.name === suggested)
          if (topic) {
            setTopicId(topic.id)
            toast.success(`Đã chọn lĩnh vực ${topic.name} theo gợi ý của AI.`)
          } else {
            toast.info('Không tìm thấy lĩnh vực tương ứng trong danh mục.')
          }
        }}
      />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate('/cau-hoi-cua-toi')}>
          Hủy
        </Button>
        <Button
          disabled={!ready}
          onClick={() => {
            const id = submitQuestion({
              title: title.trim(),
              content: content.trim(),
              topicId: topicId || null,
              priority,
              requestedDeadline: deadline ? new Date(`${deadline}T17:00`).toISOString() : null,
            })
            toast.success('Đã gửi câu hỏi. Điều phối viên của Sở sẽ chuyển tới cơ quan có thẩm quyền.')
            navigate(`/cau-hoi/${id}`)
          }}
        >
          Gửi câu hỏi
        </Button>
      </div>
    </div>
  )
}
