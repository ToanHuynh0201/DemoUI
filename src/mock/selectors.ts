/** Hàm tra cứu dùng chung giữa các màn hình. Không sửa dữ liệu, chỉ đọc. */
import type { TimelineEntry } from '@/components/common/ProcessTimeline'
import * as E from '@/lib/enums'
import type {
  Database,
  ID,
  Question,
  QuestionStatus,
  RoleCode,
  SecurityLevel,
} from './types'

export function userById(db: Database, id?: ID | null) {
  return id ? db.users.find((user) => user.id === id) ?? null : null
}

export function userName(db: Database, id?: ID | null): string {
  return userById(db, id)?.full_name ?? 'Hệ thống'
}

/** "Trần Minh Quân · Điều phối viên" — dùng cho dòng thời gian và nhật ký. */
export function userWithRole(db: Database, id?: ID | null): string {
  const user = userById(db, id)
  if (!user) return 'Hệ thống tự động'
  return `${user.full_name} · ${E.roleCode[user.role].label}`
}

export function orgById(db: Database, id?: ID | null) {
  return id ? db.organizations.find((org) => org.id === id) ?? null : null
}

export function orgName(db: Database, id?: ID | null): string {
  const org = orgById(db, id)
  return org?.short_name ?? org?.org_name ?? '—'
}

export function orgFullName(db: Database, id?: ID | null): string {
  return orgById(db, id)?.org_name ?? '—'
}

export function topicName(db: Database, id?: ID | null): string {
  return db.topics.find((topic) => topic.id === id)?.name ?? '—'
}

export function localityName(db: Database, id?: ID | null): string {
  return db.localities.find((locality) => locality.id === id)?.name ?? '—'
}

export function profileById(db: Database, id?: ID | null) {
  return id ? db.journalist_profiles.find((profile) => profile.id === id) ?? null : null
}

export function profileOfUser(db: Database, userId?: ID | null) {
  return userId ? db.journalist_profiles.find((profile) => profile.user_id === userId) ?? null : null
}

export function journalistName(db: Database, profileId?: ID | null): string {
  const profile = profileById(db, profileId)
  return userName(db, profile?.user_id)
}

export function journalistAgency(db: Database, profileId?: ID | null): string {
  const profile = profileById(db, profileId)
  return orgName(db, profile?.press_agency_id)
}

/* ── Câu hỏi ──────────────────────────────────────────────────────────────── */

export function questionById(db: Database, id?: ID | null) {
  return id ? db.questions.find((question) => question.id === id) ?? null : null
}

export function answersOf(db: Database, questionId: ID) {
  return db.answers
    .filter((answer) => answer.question_id === questionId)
    .sort((left, right) => left.version - right.version)
}

export function latestAnswer(db: Database, questionId: ID) {
  const list = answersOf(db, questionId)
  return list.length ? list[list.length - 1] : null
}

/** Dòng thời gian đầy đủ của một câu hỏi: trạng thái, làm rõ, gia hạn, trả lời. */
export function questionTimeline(db: Database, questionId: ID): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  db.question_status_history
    .filter((item) => item.question_id === questionId)
    .forEach((item) => {
      const meta = E.questionStatus[item.new_status]
      entries.push({
        id: item.id,
        occurredAt: item.occurred_at,
        title: item.old_status
          ? `${E.questionStatus[item.old_status].label} → ${meta.label}`
          : meta.label,
        actor: userWithRole(db, item.actor_id),
        note: item.note,
        tone: meta.tone,
      })
    })

  db.clarification_requests
    .filter((item) => item.question_id === questionId)
    .forEach((item) => {
      entries.push({
        id: `${item.id}-req`,
        occurredAt: item.requested_at,
        title: 'Yêu cầu phóng viên làm rõ',
        actor: userWithRole(db, item.requested_by_id),
        note: item.request_content,
        tone: 'warning',
      })
      if (item.responded_at) {
        entries.push({
          id: `${item.id}-res`,
          occurredAt: item.responded_at,
          title: 'Phóng viên phản hồi làm rõ',
          note: item.response_content ?? undefined,
          tone: 'info',
        })
      }
    })

  db.extension_requests
    .filter((item) => item.question_id === questionId)
    .forEach((item) => {
      entries.push({
        id: `${item.id}-req`,
        occurredAt: item.submitted_at,
        title: 'Đề nghị gia hạn thời gian xử lý',
        actor: userWithRole(db, item.requested_by_id),
        note: item.reason,
        tone: 'warning',
      })
      if (item.decided_at) {
        entries.push({
          id: `${item.id}-dec`,
          occurredAt: item.decided_at,
          title: item.status === 'APPROVED' ? 'Duyệt gia hạn' : 'Từ chối gia hạn',
          actor: userWithRole(db, item.approved_by_id),
          note: item.decision_note ?? undefined,
          tone: item.status === 'APPROVED' ? 'good' : 'critical',
        })
      }
    })

  return entries.sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
}

/** Dòng thời gian của thông cáo: soạn, trình, duyệt, phát hành, đính chính. */
export function releaseTimeline(db: Database, releaseId: ID): TimelineEntry[] {
  const release = db.press_releases.find((item) => item.id === releaseId)
  if (!release) return []
  const entries: TimelineEntry[] = [
    {
      id: `${releaseId}-created`,
      occurredAt: release.created_at,
      title: 'Tạo bản thảo',
      actor: userWithRole(db, release.drafted_by_id),
      tone: 'neutral',
    },
  ]
  if (release.submitted_at) {
    entries.push({
      id: `${releaseId}-submitted`,
      occurredAt: release.submitted_at,
      title: 'Trình lãnh đạo duyệt',
      actor: userWithRole(db, release.drafted_by_id),
      tone: 'warning',
    })
  }
  db.approval_notes
    .filter((item) => item.target_type === 'PRESS_RELEASE' && item.target_id === releaseId)
    .forEach((item) => {
      const meta = E.approvalAction[item.action]
      entries.push({
        id: item.id,
        occurredAt: item.occurred_at,
        title: meta.label,
        actor: userWithRole(db, item.approver_id),
        note: item.note,
        tone: meta.tone,
      })
    })
  if (release.published_at) {
    entries.push({
      id: `${releaseId}-published`,
      occurredAt: release.published_at,
      title: 'Phát hành tới báo chí',
      actor: userWithRole(db, release.approved_by_id),
      tone: 'good',
    })
  }
  if (release.withdrawn_at) {
    entries.push({
      id: `${releaseId}-withdrawn`,
      occurredAt: release.withdrawn_at,
      title: 'Thu hồi thông cáo',
      note: release.withdrawal_reason ?? undefined,
      tone: 'critical',
    })
  }
  return entries.sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
}

/* ── Kho tài nguyên ───────────────────────────────────────────────────────── */

export function assetById(db: Database, id?: ID | null) {
  return id ? db.media_assets.find((asset) => asset.id === id) ?? null : null
}

export function attachmentsOf(db: Database, targetType: string, targetId: ID) {
  return db.attachments
    .filter((item) => item.target_type === targetType && item.target_id === targetId)
    .sort((left, right) => left.sort_order - right.sort_order)
    .map((item) => ({ attachment: item, asset: assetById(db, item.asset_id) }))
    .filter((item): item is { attachment: typeof item.attachment; asset: NonNullable<typeof item.asset> } =>
      Boolean(item.asset),
    )
}

const ROLE_ID_BY_CODE: Record<RoleCode, string> = {
  ADMIN: 'role-admin',
  COORDINATOR: 'role-coordinator',
  APPROVER: 'role-approver',
  STAFF: 'role-staff',
  MEDIA_ORG: 'role-mediaorg',
  JOURNALIST: 'role-journalist',
  LEADER: 'role-leader',
  OTHER_DEPT: 'role-otherdept',
  GATE_STAFF: 'role-gatestaff',
}

/** Quyền xem/tải tài nguyên theo ma trận `asset_access_rules`. */
export function assetPermission(db: Database, role: RoleCode, level: SecurityLevel) {
  const rule = db.asset_access_rules.find(
    (item) => item.security_level === level && item.role_id === ROLE_ID_BY_CODE[role],
  )
  // Vai trò chưa có dòng trong ma trận thì chỉ được xem tài nguyên công khai
  return rule ?? { can_view: level === 'PUBLIC', can_download: level === 'PUBLIC' }
}

/* ── Thống kê dùng chung cho dashboard ────────────────────────────────────── */

export function isOverdue(question: Question, now = new Date()): boolean {
  if (question.status === 'OVERDUE') return true
  if (!question.due_at) return false
  const open: QuestionStatus[] = ['ROUTED', 'ASSIGNED', 'IN_PROGRESS', 'AWAITING_CLARIFICATION', 'PENDING_APPROVAL']
  return open.includes(question.status) && new Date(question.due_at) < now
}

export function onTimeRate(db: Database): number {
  const finished = db.questions.filter((question) => question.status === 'ANSWERED')
  if (finished.length === 0) return 0
  const onTime = finished.filter(
    (question) => !question.due_at || !question.answered_at || question.answered_at <= question.due_at,
  )
  return (onTime.length / finished.length) * 100
}

export function unreadNotifications(db: Database, userId?: ID | null) {
  if (!userId) return []
  return db.notifications.filter((item) => item.recipient_id === userId && !item.read_at)
}
