import { useState } from 'react'
import { toast } from 'sonner'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { MetaItem, PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { profileStatus, verificationStatus } from '@/lib/enums'
import { deadlineInfo, formatDate } from '@/lib/format'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { orgName, profileOfUser } from '@/mock/selectors'

/** E1 — hồ sơ của tôi: phóng viên tự đăng ký, gia hạn, khai báo tác phẩm và giải thưởng. */
export function MyProfile() {
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()
  const profile = profileOfUser(db, user?.id)

  const [renewSummary, setRenewSummary] = useState('')
  const [workTitle, setWorkTitle] = useState('')
  const [workGenre, setWorkGenre] = useState('')
  const [workPublisher, setWorkPublisher] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [workUrl, setWorkUrl] = useState('')
  const [workTopic, setWorkTopic] = useState('')

  if (!user) return null

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg space-y-2 py-10 text-center">
        <p className="text-sm font-medium">Tài khoản này chưa có hồ sơ nhà báo trên hệ thống.</p>
        <p className="text-muted-foreground text-sm">
          Liên hệ tòa soạn chủ quản để được khởi tạo hồ sơ đăng ký ban đầu.
        </p>
      </div>
    )
  }

  const expiry = deadlineInfo(profile.press_card_expiry_date)
  const requests = db.profile_requests.filter((item) => item.profile_id === profile.id)
  const works = db.press_works.filter((item) => item.profile_id === profile.id)
  const awards = db.press_awards.filter((item) => item.profile_id === profile.id)

  return (
    <div className="space-y-5">
      <PageHeader
        module="E1"
        title="Hồ sơ của tôi"
        description="Thông tin hồ sơ tác nghiệp, thẻ nhà báo, tác phẩm và giải thưởng."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <MetaItem label="Trạng thái">
              <StatusBadge meta={profileStatus[profile.status]} />
            </MetaItem>
            <MetaItem label="Cơ quan báo chí">{orgName(db, profile.press_agency_id)}</MetaItem>
            <MetaItem label="Số thẻ nhà báo">{profile.press_card_no ?? 'Chưa cấp'}</MetaItem>
            <MetaItem label="Hạn thẻ">
              <span className="space-y-0.5">
                <span className="block font-mono text-sm tabular">{formatDate(profile.press_card_expiry_date)}</span>
                {expiry && expiry.days <= 60 && (
                  <span className="block text-xs" style={{ color: expiry.tone === 'critical' ? '#8f0e22' : '#8a4f06' }}>
                    {expiry.label}
                  </span>
                )}
              </span>
            </MetaItem>
            <MetaItem label="Điểm tuân thủ">{profile.compliance_score ?? '—'}</MetaItem>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Yêu cầu hồ sơ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <ActionDialog
                trigger={<Button size="sm">Gia hạn hồ sơ</Button>}
                title="Đề nghị gia hạn hồ sơ"
                confirmLabel="Gửi yêu cầu"
                onOpen={() => setRenewSummary('')}
                onConfirm={() => {
                  store.submitProfileRequest(profile.id, 'RENEWAL', renewSummary || 'Đề nghị gia hạn hồ sơ.')
                  toast.success('Đã gửi yêu cầu gia hạn.')
                }}
              >
                <Field label="Ghi chú">
                  <Textarea value={renewSummary} onChange={(event) => setRenewSummary(event.target.value)} rows={3} />
                </Field>
              </ActionDialog>
              <ActionDialog
                trigger={
                  <Button size="sm" variant="outline">
                    Cập nhật thông tin
                  </Button>
                }
                title="Đề nghị cập nhật thông tin hồ sơ"
                confirmLabel="Gửi yêu cầu"
                onOpen={() => setRenewSummary('')}
                onConfirm={() => {
                  if (!renewSummary.trim()) {
                    toast.error('Mô tả nội dung cần cập nhật.')
                    return false
                  }
                  store.submitProfileRequest(profile.id, 'UPDATE', renewSummary)
                  toast.success('Đã gửi yêu cầu cập nhật.')
                }}
              >
                <Field label="Nội dung cần cập nhật">
                  <Textarea value={renewSummary} onChange={(event) => setRenewSummary(event.target.value)} rows={3} />
                </Field>
              </ActionDialog>
            </div>
            {requests.length === 0 ? (
              <p className="text-muted-foreground text-sm">Chưa có yêu cầu nào.</p>
            ) : (
              <ul className="space-y-2">
                {requests.map((request) => (
                  <li key={request.id} className="flex items-center justify-between text-sm">
                    <span>{request.changed_summary}</span>
                    <StatusBadge meta={profileStatus[request.status]} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Tác phẩm báo chí ({works.length})</CardTitle>
          <ActionDialog
            trigger={<Button size="sm">Khai báo tác phẩm</Button>}
            title="Khai báo tác phẩm báo chí"
            confirmLabel="Lưu"
            onOpen={() => {
              setWorkTitle('')
              setWorkGenre('')
              setWorkPublisher('')
              setWorkDate('')
              setWorkUrl('')
              setWorkTopic('')
            }}
            onConfirm={() => {
              if (!workTitle.trim()) {
                toast.error('Nhập tiêu đề tác phẩm.')
                return false
              }
              store.addPressWork(profile.id, {
                title: workTitle.trim(),
                genre: workGenre,
                publishedDate: workDate,
                publisher: workPublisher,
                url: workUrl,
                topicId: workTopic || null,
              })
              toast.success('Đã khai báo tác phẩm, chờ xác minh.')
            }}
          >
            <Field label="Tiêu đề">
              <Input value={workTitle} onChange={(event) => setWorkTitle(event.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Thể loại">
                <Input value={workGenre} onChange={(event) => setWorkGenre(event.target.value)} />
              </Field>
              <Field label="Ngày xuất bản">
                <Input type="date" value={workDate} onChange={(event) => setWorkDate(event.target.value)} />
              </Field>
            </div>
            <Field label="Nơi xuất bản">
              <Input value={workPublisher} onChange={(event) => setWorkPublisher(event.target.value)} />
            </Field>
            <Field label="Liên kết">
              <Input value={workUrl} onChange={(event) => setWorkUrl(event.target.value)} placeholder="https://" />
            </Field>
            <Field label="Chủ đề">
              <Select value={workTopic} onValueChange={setWorkTopic}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn chủ đề" />
                </SelectTrigger>
                <SelectContent>
                  {db.topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </ActionDialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {works.length === 0 ? (
            <EmptyState title="Chưa khai báo tác phẩm nào" />
          ) : (
            works.map((work) => (
              <div key={work.id} className="flex items-center justify-between gap-3 border-b py-2 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{work.title}</p>
                  <p className="text-muted-foreground text-xs">{work.publisher}</p>
                </div>
                <StatusBadge meta={verificationStatus[work.verification_status]} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {awards.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Giải thưởng ({awards.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {awards.map((award) => (
              <div key={award.id} className="flex items-center justify-between border-b py-2 last:border-0">
                <p className="text-sm font-medium">{award.award_name}</p>
                <StatusBadge meta={verificationStatus[award.verification_status]} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
