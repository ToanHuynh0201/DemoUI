import { useParams } from 'react-router'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MetaItem, PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { ActionDialog, Field } from '@/components/common/ActionDialog'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { profileStatus, severity as severityLabels, verificationStatus } from '@/lib/enums'
import { formatDate, initials } from '@/lib/format'
import { can } from '@/lib/permissions'
import { useCurrentUser, useDb, useStore } from '@/mock/store'
import { orgName, userById } from '@/mock/selectors'
import { useState } from 'react'
import type { Severity } from '@/mock/types'

export function JournalistDetail() {
  const { id = '' } = useParams()
  const db = useDb()
  const user = useCurrentUser()
  const store = useStore()

  const [severity, setSeverity] = useState<Severity>('LOW')
  const [violationType, setViolationType] = useState('')
  const [description, setDescription] = useState('')
  const [penaltyPoints, setPenaltyPoints] = useState('10')

  const profile = db.journalist_profiles.find((item) => item.id === id)
  if (!profile) {
    return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy hồ sơ.</p>
  }

  const account = userById(db, profile.user_id)
  const works = db.press_works.filter((item) => item.profile_id === profile.id)
  const awards = db.press_awards.filter((item) => item.profile_id === profile.id)
  const violations = db.compliance_violations.filter((item) => item.profile_id === profile.id)
  const links = db.journalist_agency_links.filter((item) => item.profile_id === profile.id)
  const canAdmin = user ? can(user.role, 'e1.profile.approve') : false
  const canVerify = user ? can(user.role, 'e1.work.verify') : false

  return (
    <div className="space-y-5">
      <PageHeader module="E1" backTo="/phong-vien" backLabel="Danh sách phóng viên" title={account?.full_name ?? '—'} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <Card className="h-fit">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <Avatar className="size-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {initials(account?.full_name ?? '?')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{account?.full_name}</p>
                <p className="text-muted-foreground text-sm">{account?.job_title}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <MetaItem label="Trạng thái hồ sơ">
                <StatusBadge meta={profileStatus[profile.status]} />
              </MetaItem>
              <MetaItem label="Điểm tuân thủ">{profile.compliance_score ?? '—'}</MetaItem>
              <MetaItem label="Số thẻ nhà báo">{profile.press_card_no ?? '—'}</MetaItem>
              <MetaItem label="Hạn thẻ">{formatDate(profile.press_card_expiry_date)}</MetaItem>
              <MetaItem label="Ngày sinh">{formatDate(profile.date_of_birth)}</MetaItem>
              <MetaItem label="CCCD">
                <span className="font-mono text-xs">{profile.national_id_masked}</span>
              </MetaItem>
            </div>
            <div className="border-t pt-3">
              <p className="text-muted-foreground mb-2 text-xs font-medium">Liên kết cơ quan báo chí</p>
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between py-1 text-sm">
                  <span>{orgName(db, link.press_agency_id)}</span>
                  <StatusBadge meta={{ label: link.status === 'ACTIVE' ? 'Đang liên kết' : 'Đã chấm dứt', tone: link.status === 'ACTIVE' ? 'good' : 'neutral' }} />
                </div>
              ))}
            </div>

            {canAdmin && (
              <ActionDialog
                trigger={<Button variant="outline" className="w-full">Ghi nhận vi phạm</Button>}
                title="Ghi nhận vi phạm quy định tác nghiệp"
                description="Điểm tuân thủ của phóng viên sẽ bị trừ tương ứng."
                confirmLabel="Ghi nhận"
                confirmVariant="destructive"
                onOpen={() => {
                  setViolationType('')
                  setDescription('')
                  setSeverity('LOW')
                  setPenaltyPoints('10')
                }}
                onConfirm={() => {
                  if (!violationType.trim()) {
                    toast.error('Nhập loại vi phạm.')
                    return false
                  }
                  store.recordViolation(profile.id, {
                    violationType: violationType.trim(),
                    description,
                    severity,
                    penaltyPoints: Number(penaltyPoints) || 0,
                  })
                  toast.success('Đã ghi nhận vi phạm và cập nhật điểm tuân thủ.')
                }}
              >
                <Field label="Loại vi phạm">
                  <Textarea value={violationType} onChange={(event) => setViolationType(event.target.value)} rows={2} />
                </Field>
                <Field label="Mô tả chi tiết">
                  <Textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Mức độ">
                    <Select value={severity} onValueChange={(value) => setSeverity(value as Severity)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(severityLabels) as Severity[]).map((key) => (
                          <SelectItem key={key} value={key}>
                            {severityLabels[key].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Điểm phạt">
                    <input
                      type="number"
                      value={penaltyPoints}
                      onChange={(event) => setPenaltyPoints(event.target.value)}
                      className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                    />
                  </Field>
                </div>
              </ActionDialog>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="works">
          <TabsList>
            <TabsTrigger value="works">Tác phẩm ({works.length})</TabsTrigger>
            <TabsTrigger value="awards">Giải thưởng ({awards.length})</TabsTrigger>
            <TabsTrigger value="violations">Vi phạm ({violations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="works" className="mt-4">
            <Card>
              <CardContent className="space-y-3 pt-6">
                {works.length === 0 ? (
                  <EmptyState title="Chưa khai báo tác phẩm nào" />
                ) : (
                  works.map((work) => (
                    <div key={work.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{work.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {work.genre} · {work.publisher} · {formatDate(work.published_date)}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <StatusBadge meta={verificationStatus[work.verification_status]} />
                        {canVerify && work.verification_status === 'UNVERIFIED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              store.verifyPressWork(work.id, 'VERIFIED')
                              toast.success('Đã xác minh tác phẩm.')
                            }}
                          >
                            Xác minh
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="awards" className="mt-4">
            <Card>
              <CardContent className="space-y-3 pt-6">
                {awards.length === 0 ? (
                  <EmptyState title="Chưa có giải thưởng nào" />
                ) : (
                  awards.map((award) => (
                    <div key={award.id} className="flex items-start justify-between gap-3 border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">{award.award_name}</p>
                        <p className="text-muted-foreground text-xs">
                          {award.award_level} · {award.awarding_body} · {award.year}
                        </p>
                      </div>
                      <StatusBadge meta={verificationStatus[award.verification_status]} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="mt-4">
            <Card>
              <CardContent className="space-y-3 pt-6">
                {violations.length === 0 ? (
                  <EmptyState title="Chưa ghi nhận vi phạm nào" />
                ) : (
                  violations.map((violation) => (
                    <div key={violation.id} className="border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{violation.violation_type}</p>
                        <StatusBadge meta={severityLabels[violation.severity]} />
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">{violation.description}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Trừ {violation.penalty_points} điểm · {formatDate(violation.occurred_at)}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
