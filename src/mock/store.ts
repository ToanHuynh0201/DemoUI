/**
 * Kho dữ liệu demo trong bộ nhớ.
 *
 * Mọi hành động nghiệp vụ đều đi qua đây và tự sinh dấu vết: đổi trạng thái thực
 * thể, ghi `question_status_history` / `audit_logs` / `notifications` tương ứng.
 * Nhờ vậy dòng thời gian xử lý và nhật ký thao tác trên giao diện là kết quả thật
 * của thao tác người dùng, không phải dữ liệu dựng sẵn.
 *
 * Dữ liệu chỉ tồn tại trong phiên làm việc: tải lại trang là quay về bản seed.
 */
import { useMemo } from 'react'
import { create } from 'zustand'
import { createSeedDatabase } from './seed'
import type {
  AlertStatus,
  Answer,
  ApprovalAction,
  AssetAccessAction,
  CrisisTaskStatus,
  Database,
  EntityType,
  EventItem,
  ID,
  InterviewRequestStatus,
  MonitoringSource,
  NotificationType,
  Priority,
  Question,
  QuestionStatus,
  ReportFormat,
  RoleCode,
  SecurityLevel,
  Severity,
  User,
  VerificationStatus,
} from './types'

let idCounter = 0
const nid = (prefix: string) => `${prefix}-n${(idCounter += 1)}`
const now = () => new Date().toISOString()
const addDays = (days: number, hour = 17) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

interface AuditInput {
  action: string
  targetType?: EntityType | null
  targetId?: ID | null
  result?: 'SUCCESS' | 'DENIED' | 'ERROR'
  reason?: string
}

interface NotifyInput {
  recipientId: ID
  type: NotificationType
  title: string
  body: string
  severity?: Severity
  targetType?: EntityType | null
  targetId?: ID | null
  channel?: 'IN_APP' | 'EMAIL' | 'SMS' | 'ZALO_OA' | 'PUSH'
}

export interface QuestionDraft {
  title: string
  content: string
  topicId: ID | null
  priority: Priority
  requestedDeadline: string | null
}

export interface ReleaseDraft {
  title: string
  summary: string
  content: string
  topicId: ID | null
  securityLevel: SecurityLevel
  scopeType: 'ALL' | 'ORGANIZATION' | 'TOPIC'
  scopeOrgId?: ID | null
}

export interface EventDraft {
  eventName: string
  eventType: string
  description: string
  venue: string
  startTime: string
  endTime: string | null
  rsvpDeadline: string | null
}

export interface CheckinOutcome {
  result: 'SUCCESS' | 'DENIED' | 'ERROR'
  message: string
  badgeId?: ID
  journalistName?: string
  agencyName?: string
}

interface Store {
  db: Database
  revision: number
  currentUserId: ID | null

  login: (userId: ID) => void
  logout: () => void
  resetDemoData: () => void

  /* E1 */
  submitProfileRequest: (profileId: ID, type: 'NEW_REGISTRATION' | 'RENEWAL' | 'UPDATE', summary: string) => void
  decideProfileRequest: (requestId: ID, approve: boolean, reason: string) => void
  addPressWork: (profileId: ID, input: { title: string; genre: string; publishedDate: string; publisher: string; url: string; topicId: ID | null }) => void
  verifyPressWork: (workId: ID, status: VerificationStatus) => void
  recordViolation: (profileId: ID, input: { violationType: string; description: string; severity: Severity; penaltyPoints: number }) => void
  setJournalistLink: (linkId: ID, active: boolean, note: string) => void

  /* E2 */
  createRelease: (draft: ReleaseDraft) => ID
  updateRelease: (releaseId: ID, patch: Partial<ReleaseDraft>) => void
  submitRelease: (releaseId: ID) => void
  decideRelease: (releaseId: ID, action: ApprovalAction, note: string) => void
  withdrawRelease: (releaseId: ID, reason: string) => void
  createCorrection: (originalId: ID, content: string) => ID
  logReleaseAccess: (releaseId: ID, action: 'VIEW' | 'DOWNLOAD', assetId?: ID) => void

  /* E3 */
  submitQuestion: (draft: QuestionDraft) => ID
  cancelQuestion: (questionId: ID, reason: string) => void
  routeQuestion: (questionId: ID, targetOrgId: ID, dueAt: string, reason: string) => void
  rejectQuestion: (questionId: ID, reason: string, duplicateOfId?: ID) => void

  /* E4 */
  assignQuestion: (questionId: ID, assigneeId: ID, dueAt: string, reason: string) => void
  saveAnswerDraft: (questionId: ID, content: string) => ID
  submitAnswer: (answerId: ID) => void
  decideAnswer: (answerId: ID, action: ApprovalAction, note: string) => void
  requestClarification: (questionId: ID, content: string) => void
  respondClarification: (clarificationId: ID, content: string) => void
  requestExtension: (questionId: ID, proposedDueAt: string, reason: string) => void
  decideExtension: (extensionId: ID, approve: boolean, note: string) => void

  /* E5 */
  createEvent: (draft: EventDraft) => ID
  updateEvent: (eventId: ID, patch: Partial<EventDraft>) => void
  sendInvitations: (eventId: ID, profileIds: ID[]) => void
  respondInvitation: (invitationId: ID, accept: boolean) => void
  rescheduleEvent: (eventId: ID, startTime: string, note: string) => void
  cancelEvent: (eventId: ID, reason: string) => void
  checkInByCode: (eventId: ID, qrCode: string, device: string) => CheckinOutcome
  sendPostEventPackage: (eventId: ID) => void
  createInterviewRequest: (input: { eventId: ID | null; subject: string; content: string; proposedIntervieweeId: ID | null; slotStart: string | null; slotEnd: string | null }) => void
  handleInterviewRequest: (requestId: ID, status: InterviewRequestStatus, note: string) => void

  /* E6 */
  reviewAssetTag: (assetId: ID, tagId: ID, confirm: boolean) => void
  logAssetAccess: (assetId: ID, action: AssetAccessAction) => void
  setAccessRule: (ruleId: ID, patch: { can_view?: boolean; can_download?: boolean }) => void
  setAssetSecurityLevel: (assetId: ID, level: SecurityLevel) => void

  /* E7 */
  saveMonitoringSource: (input: Partial<MonitoringSource> & { id?: ID }) => void
  toggleMonitoringSource: (sourceId: ID) => void

  /* E8 */
  setAlertStatus: (alertId: ID, status: AlertStatus) => void
  createCrisisTask: (alertId: ID, input: { title: string; assignedOrgId: ID; dueAt: string }) => void
  updateCrisisTask: (taskId: ID, status: CrisisTaskStatus, note: string) => void

  /* E9 */
  createReportJob: (input: { reportName: string; periodFrom: string; periodTo: string; format: ReportFormat }) => ID
  advanceReportJob: (jobId: ID) => void

  /* E0 */
  saveUser: (input: Partial<User> & { id?: ID }) => void
  setUserRole: (userId: ID, role: RoleCode, reason: string) => void
  setUserStatus: (userId: ID, status: User['status'], reason: string) => void
  saveOrganization: (input: Partial<Database['organizations'][number]> & { id?: ID }) => void
  saveTopic: (input: { id?: ID; code: string; name: string; isActive: boolean }) => void
  saveTag: (input: { id?: ID; code: string; name: string; tagType: Database['tags'][number]['tag_type'] }) => void
  testIntegration: (integrationId: ID) => void

  /* Thông báo */
  markNotificationRead: (notificationId: ID) => void
  markAllNotificationsRead: () => void
}

export const useStore = create<Store>((set, get) => {
  /* ── Tiện ích nội bộ ───────────────────────────────────────────────────── */

  const touch = () => set((state) => ({ revision: state.revision + 1 }))

  const actor = () => get().currentUserId
  const actorUser = () => {
    const id = actor()
    return id ? get().db.users.find((user) => user.id === id) ?? null : null
  }

  const audit = ({ action, targetType = null, targetId = null, result = 'SUCCESS', reason }: AuditInput) => {
    const user = actorUser()
    get().db.audit_logs.unshift({
      id: nid('log'),
      user_id: user?.id ?? null,
      acting_role: user?.role ?? null,
      action,
      target_type: targetType,
      target_id: targetId,
      ip_address: '10.20.30.99',
      result,
      reason,
      occurred_at: now(),
    })
  }

  const notify = ({
    recipientId,
    type,
    title,
    body,
    severity = 'LOW',
    targetType = null,
    targetId = null,
    channel = 'IN_APP',
  }: NotifyInput) => {
    if (!recipientId) return
    get().db.notifications.unshift({
      id: nid('nt'),
      recipient_id: recipientId,
      notification_type: type,
      severity,
      title,
      body,
      target_type: targetType,
      target_id: targetId,
      channel,
      delivery_status: 'SENT',
      sent_at: now(),
      read_at: null,
      created_at: now(),
    })
  }

  const moveQuestion = (question: Question, next: QuestionStatus, note?: string) => {
    get().db.question_status_history.push({
      id: nid('qh'),
      question_id: question.id,
      old_status: question.status,
      new_status: next,
      actor_id: actor(),
      note,
      occurred_at: now(),
    })
    question.status = next
  }

  const findQuestion = (id: ID) => get().db.questions.find((question) => question.id === id)
  const findAnswer = (id: ID) => get().db.answers.find((answer) => answer.id === id)
  const journalistUserId = (profileId: ID) =>
    get().db.journalist_profiles.find((profile) => profile.id === profileId)?.user_id ?? ''
  const orgName = (orgId?: ID | null) =>
    get().db.organizations.find((org) => org.id === orgId)?.short_name ??
    get().db.organizations.find((org) => org.id === orgId)?.org_name ??
    'đơn vị'

  /** Lãnh đạo duyệt của một tổ chức — dùng để gửi thông báo trình duyệt. */
  const approverOf = (orgId?: ID | null) =>
    get().db.users.find((user) => user.org_id === orgId && user.role === 'APPROVER')?.id ?? null

  const nextCode = (prefix: string, existing: string[]) => {
    const numbers = existing
      .map((code) => Number(code.split('/').pop()?.replace(/\D/g, '')))
      .filter((value) => Number.isFinite(value))
    const max = numbers.length ? Math.max(...numbers) : 0
    return `${prefix}${String(max + 1).padStart(4, '0')}`
  }

  return {
    db: createSeedDatabase(),
    revision: 0,
    currentUserId: 'u-superadmin',

    login: (userId) => {
      set({ currentUserId: userId })
      const user = get().db.users.find((item) => item.id === userId)
      if (user) user.last_login_at = now()
      audit({ action: 'Đăng nhập hệ thống', targetType: 'USER', targetId: userId })
      touch()
    },

    logout: () => {
      audit({ action: 'Đăng xuất hệ thống', targetType: 'USER', targetId: actor() })
      set({ currentUserId: null })
      touch()
    },

    resetDemoData: () => {
      idCounter = 0
      set({ db: createSeedDatabase(), currentUserId: null, revision: get().revision + 1 })
    },

    /* ── E1 ─────────────────────────────────────────────────────────────── */

    submitProfileRequest: (profileId, type, summary) => {
      const { db } = get()
      db.profile_requests.unshift({
        id: nid('pr'),
        profile_id: profileId,
        request_type: type,
        changed_summary: summary,
        status: 'PENDING_APPROVAL',
        submitted_at: now(),
        handled_by_id: null,
        handled_at: null,
        reason: null,
      })
      const profile = db.journalist_profiles.find((item) => item.id === profileId)
      if (profile && profile.status === 'DRAFT') profile.status = 'PENDING_APPROVAL'
      audit({ action: 'Gửi yêu cầu về hồ sơ phóng viên', targetType: 'JOURNALIST_PROFILE', targetId: profileId })
      db.users
        .filter((user) => user.role === 'ADMIN' || user.role === 'SUPERADMIN')
        .forEach((admin) =>
          notify({
            recipientId: admin.id,
            type: 'PROFILE_APPROVED',
            title: 'Có yêu cầu hồ sơ phóng viên chờ duyệt',
            body: summary,
            targetType: 'JOURNALIST_PROFILE',
            targetId: profileId,
          }),
        )
      touch()
    },

    decideProfileRequest: (requestId, approve, reason) => {
      const { db } = get()
      const request = db.profile_requests.find((item) => item.id === requestId)
      if (!request) return
      request.status = approve ? 'APPROVED' : 'REJECTED'
      request.handled_by_id = actor()
      request.handled_at = now()
      request.reason = reason

      const profile = db.journalist_profiles.find((item) => item.id === request.profile_id)
      if (profile) {
        profile.status = approve ? 'APPROVED' : 'REJECTED'
        profile.approved_by_id = actor()
        profile.approved_at = approve ? now() : null
        profile.rejection_reason = approve ? null : reason
        if (approve && profile.compliance_score == null) profile.compliance_score = 100
        if (approve) {
          const user = db.users.find((item) => item.id === profile.user_id)
          if (user && user.status === 'PENDING_ACTIVATION') user.status = 'ACTIVE'
        }
      }

      audit({
        action: approve ? 'Phê duyệt hồ sơ phóng viên' : 'Từ chối hồ sơ phóng viên',
        targetType: 'JOURNALIST_PROFILE',
        targetId: request.profile_id,
        reason: approve ? undefined : reason,
      })
      notify({
        recipientId: journalistUserId(request.profile_id),
        type: approve ? 'PROFILE_APPROVED' : 'PROFILE_REJECTED',
        title: approve ? 'Hồ sơ của bạn đã được duyệt' : 'Hồ sơ của bạn bị từ chối',
        body: reason || (approve ? 'Hồ sơ đã được phê duyệt, bạn có thể tác nghiệp trên nền tảng.' : ''),
        severity: approve ? 'LOW' : 'HIGH',
        targetType: 'JOURNALIST_PROFILE',
        targetId: request.profile_id,
      })
      touch()
    },

    addPressWork: (profileId, input) => {
      get().db.press_works.unshift({
        id: nid('pw'),
        profile_id: profileId,
        title: input.title,
        genre: input.genre,
        published_date: input.publishedDate,
        publisher: input.publisher,
        url: input.url,
        topic_id: input.topicId,
        verification_status: 'UNVERIFIED',
        verified_by_id: null,
        created_at: now(),
      })
      audit({ action: 'Khai báo tác phẩm báo chí', targetType: 'PRESS_WORK', targetId: profileId })
      touch()
    },

    verifyPressWork: (workId, status) => {
      const work = get().db.press_works.find((item) => item.id === workId)
      if (!work) return
      work.verification_status = status
      work.verified_by_id = actor()
      audit({ action: 'Xác minh tác phẩm báo chí', targetType: 'PRESS_WORK', targetId: workId })
      touch()
    },

    recordViolation: (profileId, input) => {
      const { db } = get()
      db.compliance_violations.unshift({
        id: nid('cv'),
        profile_id: profileId,
        violation_type: input.violationType,
        description: input.description,
        severity: input.severity,
        penalty_points: input.penaltyPoints,
        recorded_by_id: actor(),
        occurred_at: now(),
      })
      const profile = db.journalist_profiles.find((item) => item.id === profileId)
      if (profile && profile.compliance_score != null) {
        profile.compliance_score = Math.max(0, profile.compliance_score - input.penaltyPoints)
      }
      audit({
        action: 'Ghi nhận vi phạm của phóng viên',
        targetType: 'JOURNALIST_PROFILE',
        targetId: profileId,
        reason: input.violationType,
      })
      notify({
        recipientId: journalistUserId(profileId),
        type: 'COMPLIANCE_VIOLATION',
        title: 'Ghi nhận vi phạm quy định tác nghiệp',
        body: `${input.violationType}. Điểm tuân thủ bị trừ ${input.penaltyPoints} điểm.`,
        severity: input.severity,
        targetType: 'JOURNALIST_PROFILE',
        targetId: profileId,
      })
      touch()
    },

    setJournalistLink: (linkId, active, note) => {
      const link = get().db.journalist_agency_links.find((item) => item.id === linkId)
      if (!link) return
      link.status = active ? 'ACTIVE' : 'TERMINATED'
      link.end_date = active ? null : now()
      link.confirmed_by_id = actor()
      link.note = note
      audit({
        action: active ? 'Xác nhận liên kết phóng viên với tòa soạn' : 'Hủy liên kết phóng viên với tòa soạn',
        targetType: 'JOURNALIST_PROFILE',
        targetId: link.profile_id,
        reason: note,
      })
      touch()
    },

    /* ── E2 ─────────────────────────────────────────────────────────────── */

    createRelease: (draft) => {
      const { db } = get()
      const user = actorUser()
      const id = nid('r')
      db.press_releases.unshift({
        id,
        release_code: nextCode('TC-2026/', db.press_releases.map((item) => item.release_code)),
        title: draft.title,
        summary: draft.summary,
        content: draft.content,
        publishing_org_id: user?.org_id ?? 'org-vhttdl',
        topic_id: draft.topicId,
        security_level: draft.securityLevel,
        version_type: 'ORIGINAL',
        original_release_id: null,
        status: 'DRAFT',
        drafted_by_id: user?.id ?? 'u-admin',
        approved_by_id: null,
        submitted_at: null,
        published_at: null,
        withdrawn_at: null,
        withdrawal_reason: null,
        created_at: now(),
        updated_at: now(),
      })
      db.release_scopes.push({
        id: nid('rs'),
        release_id: id,
        scope_type: draft.scopeType,
        org_id: draft.scopeType === 'ORGANIZATION' ? draft.scopeOrgId ?? null : null,
        journalist_profile_id: null,
        topic_id: draft.scopeType === 'TOPIC' ? draft.topicId : null,
      })
      audit({ action: 'Tạo bản thảo thông tin nguồn', targetType: 'PRESS_RELEASE', targetId: id })
      touch()
      return id
    },

    updateRelease: (releaseId, patch) => {
      const { db } = get()
      const release = db.press_releases.find((item) => item.id === releaseId)
      if (!release) return
      if (patch.title !== undefined) release.title = patch.title
      if (patch.summary !== undefined) release.summary = patch.summary
      if (patch.content !== undefined) release.content = patch.content
      if (patch.topicId !== undefined) release.topic_id = patch.topicId
      if (patch.securityLevel !== undefined) release.security_level = patch.securityLevel
      if (patch.scopeType !== undefined) {
        const scope = db.release_scopes.find((item) => item.release_id === releaseId)
        if (scope) {
          scope.scope_type = patch.scopeType
          scope.org_id = patch.scopeType === 'ORGANIZATION' ? patch.scopeOrgId ?? null : null
          scope.topic_id = patch.scopeType === 'TOPIC' ? release.topic_id : null
        }
      }
      release.updated_at = now()
      if (release.status === 'NEEDS_REVISION') release.status = 'DRAFT'
      touch()
    },

    submitRelease: (releaseId) => {
      const { db } = get()
      const release = db.press_releases.find((item) => item.id === releaseId)
      if (!release) return
      release.status = 'PENDING_APPROVAL'
      release.submitted_at = now()
      release.updated_at = now()
      audit({ action: 'Trình duyệt thông tin nguồn', targetType: 'PRESS_RELEASE', targetId: releaseId })
      const approver = approverOf(release.publishing_org_id)
      if (approver) {
        notify({
          recipientId: approver,
          type: 'RELEASE_PUBLISHED',
          title: `Thông cáo ${release.release_code} chờ bạn duyệt`,
          body: release.title,
          severity: 'MEDIUM',
          targetType: 'PRESS_RELEASE',
          targetId: releaseId,
        })
      }
      touch()
    },

    decideRelease: (releaseId, action, note) => {
      const { db } = get()
      const release = db.press_releases.find((item) => item.id === releaseId)
      if (!release) return

      db.approval_notes.unshift({
        id: nid('an'),
        target_type: 'PRESS_RELEASE',
        target_id: releaseId,
        approver_id: actor() ?? 'u-admin',
        action,
        note,
        occurred_at: now(),
      })

      if (action === 'APPROVE') {
        release.status = 'PUBLISHED'
        release.approved_by_id = actor()
        release.published_at = now()
        audit({ action: 'Phê duyệt và phát hành thông tin nguồn', targetType: 'PRESS_RELEASE', targetId: releaseId })

        const scopes = db.release_scopes.filter((item) => item.release_id === releaseId)
        const recipients = db.journalist_profiles
          .filter((profile) => profile.status === 'APPROVED')
          .filter((profile) =>
            scopes.some(
              (scope) =>
                scope.scope_type === 'ALL' ||
                (scope.scope_type === 'ORGANIZATION' && scope.org_id === profile.press_agency_id) ||
                (scope.scope_type === 'TOPIC' &&
                  db.journalist_topics.some(
                    (link) => link.profile_id === profile.id && link.topic_id === scope.topic_id,
                  )) ||
                (scope.scope_type === 'JOURNALIST' && scope.journalist_profile_id === profile.id),
            ),
          )
        recipients.forEach((profile) =>
          notify({
            recipientId: profile.user_id,
            type: 'RELEASE_PUBLISHED',
            title: `Thông cáo mới: ${release.title}`,
            body: `${orgName(release.publishing_org_id)} vừa phát hành thông cáo ${release.release_code}.`,
            targetType: 'PRESS_RELEASE',
            targetId: releaseId,
          }),
        )
      } else {
        release.status = action === 'RETURN' ? 'NEEDS_REVISION' : 'DRAFT'
        audit({
          action: action === 'RETURN' ? 'Trả lại thông cáo để chỉnh sửa' : 'Từ chối thông cáo',
          targetType: 'PRESS_RELEASE',
          targetId: releaseId,
          reason: note,
        })
        notify({
          recipientId: release.drafted_by_id,
          type: 'ANSWER_RETURNED',
          title: `Thông cáo ${release.release_code} bị trả lại`,
          body: note,
          severity: 'MEDIUM',
          targetType: 'PRESS_RELEASE',
          targetId: releaseId,
        })
      }
      release.updated_at = now()
      touch()
    },

    withdrawRelease: (releaseId, reason) => {
      const { db } = get()
      const release = db.press_releases.find((item) => item.id === releaseId)
      if (!release) return
      release.status = 'WITHDRAWN'
      release.withdrawn_at = now()
      release.withdrawal_reason = reason
      release.updated_at = now()
      audit({ action: 'Thu hồi thông cáo đã phát hành', targetType: 'PRESS_RELEASE', targetId: releaseId, reason })

      const readerIds = new Set(
        db.release_accesses.filter((item) => item.release_id === releaseId).map((item) => item.user_id),
      )
      readerIds.forEach((userId) =>
        notify({
          recipientId: userId,
          type: 'RELEASE_WITHDRAWN',
          title: `Thông cáo ${release.release_code} đã bị thu hồi`,
          body: reason,
          severity: 'HIGH',
          targetType: 'PRESS_RELEASE',
          targetId: releaseId,
        }),
      )
      touch()
    },

    createCorrection: (originalId, content) => {
      const { db } = get()
      const original = db.press_releases.find((item) => item.id === originalId)
      if (!original) return originalId
      const id = nid('r')
      db.press_releases.unshift({
        ...original,
        id,
        release_code: `${original.release_code}-DC`,
        title: `Đính chính thông cáo ${original.release_code}`,
        summary: 'Bản đính chính nội dung đã phát hành.',
        content,
        version_type: 'CORRECTION',
        original_release_id: originalId,
        status: 'PENDING_APPROVAL',
        approved_by_id: null,
        submitted_at: now(),
        published_at: null,
        withdrawn_at: null,
        withdrawal_reason: null,
        drafted_by_id: actor() ?? original.drafted_by_id,
        created_at: now(),
        updated_at: now(),
      })
      db.release_scopes.push({
        id: nid('rs'),
        release_id: id,
        scope_type: 'ALL',
        org_id: null,
        journalist_profile_id: null,
        topic_id: null,
      })
      original.status = 'CORRECTED'
      audit({ action: 'Tạo bản đính chính thông cáo', targetType: 'PRESS_RELEASE', targetId: id })
      touch()
      return id
    },

    logReleaseAccess: (releaseId, action, assetId) => {
      const user = actorUser()
      if (!user) return
      const { db } = get()
      db.release_accesses.unshift({
        id: nid('ra'),
        release_id: releaseId,
        user_id: user.id,
        org_id: user.org_id,
        action,
        asset_id: assetId ?? null,
        occurred_at: now(),
      })
      if (action === 'DOWNLOAD') {
        audit({ action: 'Tải tài liệu thông cáo', targetType: 'PRESS_RELEASE', targetId: releaseId })
      }
      touch()
    },

    /* ── E3 ─────────────────────────────────────────────────────────────── */

    submitQuestion: (draft) => {
      const { db } = get()
      const user = actorUser()
      const profile = db.journalist_profiles.find((item) => item.user_id === user?.id)
      const id = nid('q')
      db.questions.unshift({
        id,
        question_code: nextCode('CH-2026/', db.questions.map((item) => item.question_code)),
        journalist_profile_id: profile?.id ?? 'p-01',
        press_agency_id: profile?.press_agency_id ?? null,
        title: draft.title,
        content: draft.content,
        topic_id: draft.topicId,
        priority: draft.priority,
        requested_deadline: draft.requestedDeadline,
        due_at: null,
        status: 'SUBMITTED',
        handling_org_id: null,
        coordinator_id: null,
        assignee_id: null,
        duplicate_of_question_id: null,
        rejection_reason: null,
        submitted_at: now(),
        answered_at: null,
      })
      db.question_status_history.push({
        id: nid('qh'),
        question_id: id,
        old_status: null,
        new_status: 'SUBMITTED',
        actor_id: user?.id ?? null,
        note: 'Phóng viên gửi câu hỏi qua nền tảng.',
        occurred_at: now(),
      })
      audit({ action: 'Gửi câu hỏi tới cơ quan phát ngôn', targetType: 'QUESTION', targetId: id })
      db.users
        .filter((item) => item.role === 'COORDINATOR')
        .forEach((coordinator) =>
          notify({
            recipientId: coordinator.id,
            type: 'QUESTION_ROUTED',
            title: 'Câu hỏi mới cần điều phối',
            body: draft.title,
            severity: draft.priority === 'URGENT' ? 'HIGH' : 'LOW',
            targetType: 'QUESTION',
            targetId: id,
          }),
        )
      touch()
      return id
    },

    cancelQuestion: (questionId, reason) => {
      const question = findQuestion(questionId)
      if (!question) return
      moveQuestion(question, 'CANCELLED', reason)
      audit({ action: 'Rút câu hỏi chưa xử lý', targetType: 'QUESTION', targetId: questionId, reason })
      touch()
    },

    routeQuestion: (questionId, targetOrgId, dueAt, reason) => {
      const { db } = get()
      const question = findQuestion(questionId)
      if (!question) return
      const isRerouting = Boolean(question.handling_org_id)

      db.question_routings.unshift({
        id: nid('qr'),
        question_id: questionId,
        target_org_id: targetOrgId,
        coordinator_id: actor() ?? 'u-coord',
        due_at: dueAt,
        is_rerouting: isRerouting,
        reason,
        occurred_at: now(),
      })
      question.handling_org_id = targetOrgId
      question.coordinator_id = actor()
      question.due_at = dueAt
      moveQuestion(question, 'ROUTED', reason || `Chuyển ${orgName(targetOrgId)}.`)

      audit({
        action: isRerouting ? 'Định tuyến lại câu hỏi' : 'Chuyển câu hỏi tới cơ quan phát ngôn',
        targetType: 'QUESTION',
        targetId: questionId,
        reason,
      })
      const approver = approverOf(targetOrgId)
      if (approver) {
        notify({
          recipientId: approver,
          type: 'QUESTION_ROUTED',
          title: `Câu hỏi ${question.question_code} được chuyển tới đơn vị`,
          body: question.title,
          severity: question.priority === 'URGENT' ? 'HIGH' : 'MEDIUM',
          targetType: 'QUESTION',
          targetId: questionId,
        })
      }
      touch()
    },

    rejectQuestion: (questionId, reason, duplicateOfId) => {
      const question = findQuestion(questionId)
      if (!question) return
      question.rejection_reason = reason
      if (duplicateOfId) question.duplicate_of_question_id = duplicateOfId
      moveQuestion(question, 'REJECTED', reason)
      audit({ action: 'Từ chối tiếp nhận câu hỏi', targetType: 'QUESTION', targetId: questionId, reason })
      notify({
        recipientId: journalistUserId(question.journalist_profile_id),
        type: duplicateOfId ? 'DUPLICATE_QUESTION' : 'QUESTION_ROUTED',
        title: `Câu hỏi ${question.question_code} không được tiếp nhận`,
        body: reason,
        severity: 'MEDIUM',
        targetType: 'QUESTION',
        targetId: questionId,
      })
      touch()
    },

    /* ── E4 ─────────────────────────────────────────────────────────────── */

    assignQuestion: (questionId, assigneeId, dueAt, reason) => {
      const { db } = get()
      const question = findQuestion(questionId)
      if (!question) return
      const previous = db.question_assignments.find(
        (item) => item.question_id === questionId && item.status === 'IN_PROGRESS',
      )
      if (previous) {
        previous.status = 'REASSIGNED'
        previous.ended_at = now()
      }
      db.question_assignments.unshift({
        id: nid('qa'),
        question_id: questionId,
        assignee_id: assigneeId,
        assigned_by_id: actor() ?? 'u-admin',
        due_at: dueAt,
        status: 'IN_PROGRESS',
        is_reassignment: Boolean(previous),
        reason,
        assigned_at: now(),
        ended_at: null,
      })
      question.assignee_id = assigneeId
      question.due_at = dueAt
      moveQuestion(question, 'ASSIGNED', reason || undefined)

      audit({
        action: previous ? 'Phân công lại cán bộ xử lý' : 'Phân công cán bộ xử lý câu hỏi',
        targetType: 'QUESTION',
        targetId: questionId,
        reason,
      })
      notify({
        recipientId: assigneeId,
        type: 'QUESTION_ASSIGNED',
        title: `Bạn được phân công câu hỏi ${question.question_code}`,
        body: question.title,
        severity: question.priority === 'URGENT' ? 'HIGH' : 'MEDIUM',
        targetType: 'QUESTION',
        targetId: questionId,
      })
      touch()
    },

    saveAnswerDraft: (questionId, content) => {
      const { db } = get()
      const question = findQuestion(questionId)
      if (!question) return ''
      const versions = db.answers.filter((item) => item.question_id === questionId)
      const editable = versions.find((item) => item.status === 'DRAFT' || item.status === 'NEEDS_REVISION')

      let answerId: ID
      if (editable) {
        editable.content = content
        editable.status = 'DRAFT'
        answerId = editable.id
      } else {
        const draft: Answer = {
          id: nid('ans'),
          question_id: questionId,
          version: versions.length + 1,
          content,
          drafted_by_id: actor() ?? 'u-staff-yte',
          status: 'DRAFT',
          approved_by_id: null,
          submitted_at: null,
          approved_at: null,
          sent_at: null,
          is_digitally_signed: false,
          signature_transaction_id: null,
          created_at: now(),
        }
        db.answers.unshift(draft)
        answerId = draft.id
      }
      if (question.status === 'ASSIGNED' || question.status === 'AWAITING_CLARIFICATION') {
        moveQuestion(question, 'IN_PROGRESS', 'Bắt đầu soạn nội dung trả lời.')
      }
      touch()
      return answerId
    },

    submitAnswer: (answerId) => {
      const answer = findAnswer(answerId)
      if (!answer) return
      const question = findQuestion(answer.question_id)
      answer.status = 'PENDING_APPROVAL'
      answer.submitted_at = now()
      if (question) moveQuestion(question, 'PENDING_APPROVAL', 'Trình lãnh đạo duyệt bản trả lời.')
      audit({ action: 'Trình duyệt bản trả lời', targetType: 'ANSWER', targetId: answerId })
      const approver = approverOf(question?.handling_org_id)
      if (approver && question) {
        notify({
          recipientId: approver,
          type: 'QUESTION_DUE_SOON',
          title: `Bản trả lời câu hỏi ${question.question_code} chờ bạn duyệt`,
          body: question.title,
          severity: 'MEDIUM',
          targetType: 'QUESTION',
          targetId: question.id,
        })
      }
      touch()
    },

    decideAnswer: (answerId, action, note) => {
      const { db } = get()
      const answer = findAnswer(answerId)
      if (!answer) return
      const question = findQuestion(answer.question_id)

      db.approval_notes.unshift({
        id: nid('an'),
        target_type: 'ANSWER',
        target_id: answerId,
        approver_id: actor() ?? 'u-admin',
        action,
        note,
        occurred_at: now(),
      })

      if (action === 'APPROVE') {
        answer.status = 'SENT'
        answer.approved_by_id = actor()
        answer.approved_at = now()
        answer.sent_at = now()
        answer.is_digitally_signed = true
        answer.signature_transaction_id = `SIG-2026-${Math.floor(1000000 + Math.random() * 8999999)}`
        if (question) {
          question.answered_at = now()
          moveQuestion(question, 'ANSWERED', 'Duyệt và gửi phản hồi chính thức tới phóng viên.')
          const assignment = db.question_assignments.find(
            (item) => item.question_id === question.id && item.status === 'IN_PROGRESS',
          )
          if (assignment) {
            assignment.status = 'COMPLETED'
            assignment.ended_at = now()
          }
          notify({
            recipientId: journalistUserId(question.journalist_profile_id),
            type: 'QUESTION_ANSWERED',
            title: `Câu hỏi ${question.question_code} đã có phản hồi chính thức`,
            body: 'Phản hồi đã được ký số và gửi tới bạn qua nền tảng.',
            targetType: 'QUESTION',
            targetId: question.id,
            channel: 'EMAIL',
          })
        }
        audit({ action: 'Duyệt và gửi phản hồi chính thức', targetType: 'ANSWER', targetId: answerId })
      } else {
        answer.status = 'NEEDS_REVISION'
        if (question) moveQuestion(question, 'IN_PROGRESS', `Trả lại bản trả lời: ${note}`)
        audit({
          action: 'Trả lại bản trả lời để chỉnh sửa',
          targetType: 'ANSWER',
          targetId: answerId,
          reason: note,
        })
        notify({
          recipientId: answer.drafted_by_id,
          type: 'ANSWER_RETURNED',
          title: 'Bản trả lời bị trả lại để chỉnh sửa',
          body: note,
          severity: 'MEDIUM',
          targetType: 'ANSWER',
          targetId: answerId,
        })
      }
      touch()
    },

    requestClarification: (questionId, content) => {
      const { db } = get()
      const question = findQuestion(questionId)
      if (!question) return
      db.clarification_requests.unshift({
        id: nid('cr'),
        question_id: questionId,
        requested_by_id: actor() ?? 'u-staff-yte',
        request_content: content,
        requested_at: now(),
        response_content: null,
        responded_at: null,
      })
      moveQuestion(question, 'AWAITING_CLARIFICATION', 'Đề nghị phóng viên làm rõ nội dung câu hỏi.')
      audit({ action: 'Yêu cầu làm rõ câu hỏi', targetType: 'QUESTION', targetId: questionId })
      notify({
        recipientId: journalistUserId(question.journalist_profile_id),
        type: 'CLARIFICATION_REQUESTED',
        title: `Yêu cầu làm rõ câu hỏi ${question.question_code}`,
        body: content,
        severity: 'MEDIUM',
        targetType: 'QUESTION',
        targetId: questionId,
      })
      touch()
    },

    respondClarification: (clarificationId, content) => {
      const { db } = get()
      const request = db.clarification_requests.find((item) => item.id === clarificationId)
      if (!request) return
      request.response_content = content
      request.responded_at = now()
      const question = findQuestion(request.question_id)
      if (question && question.status === 'AWAITING_CLARIFICATION') {
        moveQuestion(question, 'IN_PROGRESS', 'Phóng viên đã phản hồi nội dung làm rõ.')
      }
      audit({ action: 'Phản hồi yêu cầu làm rõ', targetType: 'QUESTION', targetId: request.question_id })
      if (question) {
        notify({
          recipientId: request.requested_by_id,
          type: 'CLARIFICATION_REQUESTED',
          title: `Phóng viên đã làm rõ câu hỏi ${question.question_code}`,
          body: content,
          targetType: 'QUESTION',
          targetId: question.id,
        })
      }
      touch()
    },

    requestExtension: (questionId, proposedDueAt, reason) => {
      const { db } = get()
      const question = findQuestion(questionId)
      if (!question) return
      db.extension_requests.unshift({
        id: nid('er'),
        question_id: questionId,
        requested_by_id: actor() ?? 'u-staff-yte',
        current_due_at: question.due_at ?? now(),
        proposed_due_at: proposedDueAt,
        reason,
        status: 'PENDING_APPROVAL',
        approved_by_id: null,
        decided_at: null,
        decision_note: null,
        submitted_at: now(),
      })
      audit({ action: 'Gửi yêu cầu gia hạn xử lý câu hỏi', targetType: 'QUESTION', targetId: questionId, reason })
      const approver = approverOf(question.handling_org_id)
      if (approver) {
        notify({
          recipientId: approver,
          type: 'QUESTION_DUE_SOON',
          title: `Yêu cầu gia hạn câu hỏi ${question.question_code}`,
          body: reason,
          severity: 'MEDIUM',
          targetType: 'QUESTION',
          targetId: questionId,
        })
      }
      touch()
    },

    decideExtension: (extensionId, approve, note) => {
      const { db } = get()
      const request = db.extension_requests.find((item) => item.id === extensionId)
      if (!request) return
      request.status = approve ? 'APPROVED' : 'REJECTED'
      request.approved_by_id = actor()
      request.decided_at = now()
      request.decision_note = note

      const question = findQuestion(request.question_id)
      if (question && approve) {
        question.due_at = request.proposed_due_at
        if (question.status === 'OVERDUE') moveQuestion(question, 'IN_PROGRESS', 'Đã gia hạn, tiếp tục xử lý.')
      }
      audit({
        action: approve ? 'Duyệt yêu cầu gia hạn' : 'Từ chối yêu cầu gia hạn',
        targetType: 'QUESTION',
        targetId: request.question_id,
        reason: note,
      })
      notify({
        recipientId: request.requested_by_id,
        type: approve ? 'EXTENSION_APPROVED' : 'EXTENSION_REJECTED',
        title: approve ? 'Yêu cầu gia hạn được duyệt' : 'Yêu cầu gia hạn bị từ chối',
        body: note,
        severity: approve ? 'LOW' : 'MEDIUM',
        targetType: 'QUESTION',
        targetId: request.question_id,
      })
      touch()
    },

    /* ── E5 ─────────────────────────────────────────────────────────────── */

    createEvent: (draft) => {
      const { db } = get()
      const user = actorUser()
      const id = nid('ev')
      const event: EventItem = {
        id,
        event_code: nextCode('SK-2026/', db.events.map((item) => item.event_code)),
        event_name: draft.eventName,
        event_type: draft.eventType,
        description: draft.description,
        venue: draft.venue,
        start_time: draft.startTime,
        end_time: draft.endTime,
        rsvp_deadline: draft.rsvpDeadline,
        org_id: user?.org_id ?? 'org-vhttdl',
        created_by_id: user?.id ?? 'u-admin',
        status: 'DRAFT',
        reschedule_note: null,
        cancellation_reason: null,
      }
      db.events.unshift(event)
      audit({ action: 'Tạo sự kiện', targetType: 'EVENT', targetId: id })
      touch()
      return id
    },

    updateEvent: (eventId, patch) => {
      const event = get().db.events.find((item) => item.id === eventId)
      if (!event) return
      if (patch.eventName !== undefined) event.event_name = patch.eventName
      if (patch.eventType !== undefined) event.event_type = patch.eventType
      if (patch.description !== undefined) event.description = patch.description
      if (patch.venue !== undefined) event.venue = patch.venue
      if (patch.startTime !== undefined) event.start_time = patch.startTime
      if (patch.endTime !== undefined) event.end_time = patch.endTime
      if (patch.rsvpDeadline !== undefined) event.rsvp_deadline = patch.rsvpDeadline
      touch()
    },

    sendInvitations: (eventId, profileIds) => {
      const { db } = get()
      const event = db.events.find((item) => item.id === eventId)
      if (!event) return
      profileIds.forEach((profileId) => {
        const existing = db.invitations.find(
          (item) => item.event_id === eventId && item.journalist_profile_id === profileId,
        )
        if (existing) return
        const profile = db.journalist_profiles.find((item) => item.id === profileId)
        db.invitations.push({
          id: nid('inv'),
          event_id: eventId,
          journalist_profile_id: profileId,
          press_agency_id: profile?.press_agency_id ?? null,
          status: 'SENT',
          requires_reconfirmation: false,
          sent_at: now(),
          responded_at: null,
        })
        notify({
          recipientId: journalistUserId(profileId),
          type: 'EVENT_INVITATION',
          title: `Giấy mời sự kiện ${event.event_code}`,
          body: `${event.event_name}. Đề nghị xác nhận tham dự trước hạn phản hồi.`,
          targetType: 'EVENT',
          targetId: eventId,
        })
      })
      event.status = 'INVITATIONS_SENT'
      audit({ action: `Gửi giấy mời điện tử tới ${profileIds.length} phóng viên`, targetType: 'EVENT', targetId: eventId })
      touch()
    },

    respondInvitation: (invitationId, accept) => {
      const { db } = get()
      const invitation = db.invitations.find((item) => item.id === invitationId)
      if (!invitation) return
      invitation.status = accept ? 'ACCEPTED' : 'DECLINED'
      invitation.responded_at = now()
      invitation.requires_reconfirmation = false

      const event = db.events.find((item) => item.id === invitation.event_id)
      if (accept && event && invitation.journalist_profile_id) {
        const existing = db.press_badges.find((item) => item.invitation_id === invitationId)
        if (!existing) {
          const code = `HUE-${event.event_code.split('/').pop()}-${invitation.journalist_profile_id.toUpperCase()}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`
          db.press_badges.push({
            id: nid('bd'),
            invitation_id: invitationId,
            event_id: event.id,
            journalist_profile_id: invitation.journalist_profile_id,
            qr_code: code,
            valid_from: event.start_time,
            valid_to: event.end_time ?? event.start_time,
            status: 'VALID',
            issued_at: now(),
          })
          notify({
            recipientId: journalistUserId(invitation.journalist_profile_id),
            type: 'BADGE_ISSUED',
            title: 'Đã cấp thẻ tác nghiệp điện tử',
            body: `Thẻ QR cho sự kiện ${event.event_code} đã sẵn sàng. Xuất trình mã QR tại cổng để check-in.`,
            targetType: 'INVITATION',
            targetId: invitationId,
          })
        }
      }
      audit({
        action: accept ? 'Xác nhận tham dự sự kiện' : 'Từ chối tham dự sự kiện',
        targetType: 'INVITATION',
        targetId: invitationId,
      })
      touch()
    },

    rescheduleEvent: (eventId, startTime, note) => {
      const { db } = get()
      const event = db.events.find((item) => item.id === eventId)
      if (!event) return
      event.start_time = startTime
      event.status = 'RESCHEDULED'
      event.reschedule_note = note
      db.invitations
        .filter((item) => item.event_id === eventId && item.status !== 'CANCELLED')
        .forEach((invitation) => {
          invitation.requires_reconfirmation = true
          if (invitation.journalist_profile_id) {
            notify({
              recipientId: journalistUserId(invitation.journalist_profile_id),
              type: 'EVENT_RESCHEDULED',
              title: `Sự kiện ${event.event_code} đã dời lịch`,
              body: `${note} Đề nghị xác nhận lại việc tham dự.`,
              severity: 'MEDIUM',
              targetType: 'EVENT',
              targetId: eventId,
            })
          }
        })
      audit({ action: 'Dời lịch sự kiện', targetType: 'EVENT', targetId: eventId, reason: note })
      touch()
    },

    cancelEvent: (eventId, reason) => {
      const { db } = get()
      const event = db.events.find((item) => item.id === eventId)
      if (!event) return
      event.status = 'CANCELLED'
      event.cancellation_reason = reason
      db.invitations
        .filter((item) => item.event_id === eventId)
        .forEach((invitation) => {
          invitation.status = 'CANCELLED'
          if (invitation.journalist_profile_id) {
            notify({
              recipientId: journalistUserId(invitation.journalist_profile_id),
              type: 'EVENT_CANCELLED',
              title: `Sự kiện ${event.event_code} đã bị hủy`,
              body: reason,
              severity: 'HIGH',
              targetType: 'EVENT',
              targetId: eventId,
            })
          }
        })
      db.press_badges.filter((item) => item.event_id === eventId).forEach((badge) => (badge.status = 'REVOKED'))
      audit({ action: 'Hủy sự kiện', targetType: 'EVENT', targetId: eventId, reason })
      touch()
    },

    checkInByCode: (eventId, qrCode, device) => {
      const { db } = get()
      const code = qrCode.trim().toUpperCase()
      const badge = db.press_badges.find((item) => item.qr_code.toUpperCase() === code)

      const record = (result: CheckinOutcome['result'], message: string, badgeId?: ID) => {
        db.event_checkins.unshift({
          id: nid('ck'),
          badge_id: badgeId ?? null,
          event_id: eventId,
          scanned_by_id: actor(),
          result,
          rejection_reason: result === 'SUCCESS' ? undefined : message,
          device,
          occurred_at: now(),
        })
        audit({
          action: 'Check-in bằng mã QR',
          targetType: 'EVENT',
          targetId: eventId,
          result,
          reason: result === 'SUCCESS' ? undefined : message,
        })
        touch()
      }

      if (!badge) {
        const message = 'Mã QR không đọc được hoặc không tồn tại trong hệ thống.'
        record('ERROR', message)
        return { result: 'ERROR', message }
      }
      if (badge.event_id !== eventId) {
        const message = 'Thẻ được cấp cho sự kiện khác, không hợp lệ tại cổng này.'
        record('DENIED', message, badge.id)
        return { result: 'DENIED', message, badgeId: badge.id }
      }
      if (badge.status === 'REVOKED') {
        const message = 'Thẻ đã bị thu hồi.'
        record('DENIED', message, badge.id)
        return { result: 'DENIED', message, badgeId: badge.id }
      }
      if (badge.status === 'EXPIRED' || new Date(badge.valid_to) < new Date()) {
        badge.status = 'EXPIRED'
        const message = 'Thẻ tác nghiệp đã hết hiệu lực.'
        record('DENIED', message, badge.id)
        return { result: 'DENIED', message, badgeId: badge.id }
      }

      const profile = db.journalist_profiles.find((item) => item.id === badge.journalist_profile_id)
      if (profile && profile.status !== 'APPROVED') {
        const message = 'Hồ sơ phóng viên không còn hiệu lực trên hệ thống.'
        record('DENIED', message, badge.id)
        return { result: 'DENIED', message, badgeId: badge.id }
      }

      badge.status = 'USED'
      const user = db.users.find((item) => item.id === profile?.user_id)
      record('SUCCESS', 'Check-in thành công.', badge.id)
      return {
        result: 'SUCCESS',
        message: 'Check-in thành công.',
        badgeId: badge.id,
        journalistName: user?.full_name,
        agencyName: orgName(profile?.press_agency_id),
      }
    },

    sendPostEventPackage: (eventId) => {
      const { db } = get()
      const event = db.events.find((item) => item.id === eventId)
      if (!event) return
      event.status = 'COMPLETED'
      db.invitations
        .filter((item) => item.event_id === eventId && item.status === 'ACCEPTED' && item.journalist_profile_id)
        .forEach((invitation) =>
          notify({
            recipientId: journalistUserId(invitation.journalist_profile_id!),
            type: 'POST_EVENT_PACKAGE',
            title: `Tài liệu sau sự kiện ${event.event_code}`,
            body: 'Bộ ảnh, video và tài liệu của sự kiện đã được đăng tải, bạn có thể tải về từ kho dữ liệu.',
            targetType: 'EVENT',
            targetId: eventId,
          }),
        )
      audit({ action: 'Gửi tài liệu sau sự kiện', targetType: 'EVENT', targetId: eventId })
      touch()
    },

    createInterviewRequest: (input) => {
      const { db } = get()
      const user = actorUser()
      const profile = db.journalist_profiles.find((item) => item.user_id === user?.id)
      db.interview_requests.unshift({
        id: nid('ir'),
        event_id: input.eventId,
        journalist_profile_id: profile?.id ?? 'p-01',
        subject: input.subject,
        content: input.content,
        proposed_interviewee_id: input.proposedIntervieweeId,
        slot_start: input.slotStart,
        slot_end: input.slotEnd,
        status: 'NEW',
        handled_by_id: null,
        note: null,
        created_at: now(),
      })
      audit({ action: 'Gửi yêu cầu phỏng vấn' })
      db.users
        .filter((item) => item.role === 'ADMIN' || item.role === 'SUPERADMIN')
        .forEach((admin) =>
          notify({
            recipientId: admin.id,
            type: 'INTERVIEW_ASSIGNED',
            title: 'Có yêu cầu phỏng vấn mới',
            body: input.subject,
            severity: 'MEDIUM',
          }),
        )
      touch()
    },

    handleInterviewRequest: (requestId, status, note) => {
      const { db } = get()
      const request = db.interview_requests.find((item) => item.id === requestId)
      if (!request) return
      request.status = status
      request.handled_by_id = actor()
      request.note = note
      audit({ action: 'Xử lý yêu cầu phỏng vấn', reason: note })
      notify({
        recipientId: journalistUserId(request.journalist_profile_id),
        type: 'INTERVIEW_ASSIGNED',
        title: 'Yêu cầu phỏng vấn đã được xử lý',
        body: note || request.subject,
        severity: status === 'REJECTED' ? 'MEDIUM' : 'LOW',
      })
      touch()
    },

    /* ── E6 ─────────────────────────────────────────────────────────────── */

    reviewAssetTag: (assetId, tagId, confirm) => {
      const tag = get().db.asset_tags.find((item) => item.asset_id === assetId && item.tag_id === tagId)
      if (!tag) return
      tag.review_status = confirm ? 'CONFIRMED' : 'REJECTED'
      tag.confirmed_by_id = actor()
      audit({
        action: confirm ? 'Xác nhận nhãn do AI gán' : 'Loại nhãn do AI gán',
        targetType: 'MEDIA_ASSET',
        targetId: assetId,
      })
      touch()
    },

    logAssetAccess: (assetId, action) => {
      const user = actorUser()
      if (!user) return
      get().db.asset_access_logs.unshift({
        id: nid('aal'),
        asset_id: assetId,
        user_id: user.id,
        action,
        ip_address: '10.20.30.99',
        occurred_at: now(),
      })
      if (action === 'DENIED') {
        audit({
          action: 'Truy cập tài nguyên vượt quyền',
          targetType: 'MEDIA_ASSET',
          targetId: assetId,
          result: 'DENIED',
          reason: 'Vai trò hiện tại không đủ quyền với mức bảo mật của tài nguyên.',
        })
      } else if (action === 'DOWNLOAD') {
        audit({ action: 'Tải tài nguyên số', targetType: 'MEDIA_ASSET', targetId: assetId })
      }
      touch()
    },

    setAccessRule: (ruleId, patch) => {
      const rule = get().db.asset_access_rules.find((item) => item.id === ruleId)
      if (!rule) return
      if (patch.can_view !== undefined) rule.can_view = patch.can_view
      if (patch.can_download !== undefined) rule.can_download = patch.can_download
      if (!rule.can_view) rule.can_download = false
      audit({ action: 'Cập nhật ma trận quyền truy cập tài nguyên' })
      touch()
    },

    setAssetSecurityLevel: (assetId, level) => {
      const asset = get().db.media_assets.find((item) => item.id === assetId)
      if (!asset) return
      asset.security_level = level
      audit({
        action: 'Gắn nhãn cấp độ bảo mật cho tài liệu',
        targetType: 'MEDIA_ASSET',
        targetId: assetId,
        reason: `Đổi mức bảo mật thành ${level}.`,
      })
      touch()
    },

    /* ── E7 ─────────────────────────────────────────────────────────────── */

    saveMonitoringSource: (input) => {
      const { db } = get()
      if (input.id) {
        const source = db.monitoring_sources.find((item) => item.id === input.id)
        if (source) Object.assign(source, input)
      } else {
        db.monitoring_sources.push({
          id: nid('src'),
          name: input.name ?? 'Nguồn mới',
          channel: input.channel ?? 'ONLINE_NEWS',
          url: input.url,
          keywords: input.keywords ?? [],
          topic_id: input.topic_id ?? null,
          status: 'ACTIVE',
          last_fetched_at: null,
          last_error: null,
          articles_last_7d: 0,
        })
      }
      audit({ action: 'Cấu hình nguồn theo dõi truyền thông' })
      touch()
    },

    toggleMonitoringSource: (sourceId) => {
      const source = get().db.monitoring_sources.find((item) => item.id === sourceId)
      if (!source) return
      source.status = source.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      audit({ action: source.status === 'ACTIVE' ? 'Bật thu thập từ nguồn' : 'Tạm dừng thu thập từ nguồn' })
      touch()
    },

    /* ── E8 ─────────────────────────────────────────────────────────────── */

    setAlertStatus: (alertId, status) => {
      const alert = get().db.crisis_alerts.find((item) => item.id === alertId)
      if (!alert) return
      alert.status = status
      if (status === 'ACKNOWLEDGED') {
        alert.acknowledged_by_id = actor()
        alert.acknowledged_at = now()
      }
      if (status === 'RESOLVED' || status === 'DISMISSED') alert.resolved_at = now()
      audit({ action: `Cập nhật trạng thái cảnh báo ${alert.alert_code}`, reason: status })
      touch()
    },

    createCrisisTask: (alertId, input) => {
      const { db } = get()
      db.crisis_tasks.unshift({
        id: nid('ct'),
        alert_id: alertId,
        title: input.title,
        assigned_org_id: input.assignedOrgId,
        assigned_by_id: actor() ?? 'u-admin',
        due_at: input.dueAt,
        status: 'ASSIGNED',
        progress_note: undefined,
        updated_at: now(),
      })
      const alert = db.crisis_alerts.find((item) => item.id === alertId)
      if (alert && (alert.status === 'NEW' || alert.status === 'ACKNOWLEDGED')) alert.status = 'RESPONDING'

      audit({
        action: 'Giao nhiệm vụ ứng phó cho đơn vị phối hợp',
        targetType: 'ORGANIZATION',
        targetId: input.assignedOrgId,
        reason: input.title,
      })
      db.users
        .filter((user) => user.org_id === input.assignedOrgId)
        .forEach((user) =>
          notify({
            recipientId: user.id,
            type: 'CRISIS_TASK_ASSIGNED',
            title: 'Bạn được giao nhiệm vụ ứng phó khủng hoảng',
            body: input.title,
            severity: 'HIGH',
          }),
        )
      touch()
    },

    updateCrisisTask: (taskId, status, note) => {
      const task = get().db.crisis_tasks.find((item) => item.id === taskId)
      if (!task) return
      task.status = status
      task.progress_note = note
      task.updated_at = now()
      audit({ action: 'Cập nhật tiến độ nhiệm vụ ứng phó', reason: note })
      notify({
        recipientId: task.assigned_by_id,
        type: 'CRISIS_TASK_ASSIGNED',
        title: 'Nhiệm vụ ứng phó có cập nhật tiến độ',
        body: `${task.title}: ${note}`,
        severity: 'MEDIUM',
      })
      touch()
    },

    /* ── E9 ─────────────────────────────────────────────────────────────── */

    createReportJob: (input) => {
      const id = nid('rp')
      get().db.report_jobs.unshift({
        id,
        report_name: input.reportName,
        period_from: input.periodFrom,
        period_to: input.periodTo,
        format: input.format,
        requested_by_id: actor() ?? 'u-admin',
        status: 'RUNNING',
        progress: 0,
        row_count: undefined,
        created_at: now(),
        finished_at: null,
      })
      audit({ action: 'Tạo yêu cầu xuất báo cáo định kỳ', reason: input.reportName })
      touch()
      return id
    },

    advanceReportJob: (jobId) => {
      const job = get().db.report_jobs.find((item) => item.id === jobId)
      if (!job || job.status !== 'RUNNING') return
      job.progress = Math.min(100, job.progress + 20 + Math.floor(Math.random() * 15))
      if (job.progress >= 100) {
        job.progress = 100
        job.status = 'READY'
        job.row_count = 400 + Math.floor(Math.random() * 3000)
        job.finished_at = now()
        notify({
          recipientId: job.requested_by_id,
          type: 'QUESTION_ANSWERED',
          title: 'Báo cáo đã sẵn sàng để tải',
          body: job.report_name,
        })
      }
      touch()
    },

    /* ── E0 ─────────────────────────────────────────────────────────────── */

    saveUser: (input) => {
      const { db } = get()
      if (input.id) {
        const user = db.users.find((item) => item.id === input.id)
        if (user) Object.assign(user, input)
        audit({ action: 'Cập nhật thông tin người dùng', targetType: 'USER', targetId: input.id })
      } else {
        const id = nid('u')
        db.users.push({
          id,
          org_id: input.org_id ?? 'org-vhttdl',
          username: input.username ?? id,
          email: input.email ?? `${id}@hue.gov.vn`,
          phone: input.phone,
          full_name: input.full_name ?? 'Người dùng mới',
          job_title: input.job_title,
          status: 'PENDING_ACTIVATION',
          mfa_required: input.mfa_required ?? false,
          last_login_at: null,
          role: input.role ?? 'STAFF',
          created_at: now(),
        })
        audit({ action: 'Tạo tài khoản người dùng', targetType: 'USER', targetId: id })
      }
      touch()
    },

    setUserRole: (userId, role, reason) => {
      const { db } = get()
      const user = db.users.find((item) => item.id === userId)
      if (!user) return
      const previous = user.role
      user.role = role
      const roleRecord = db.roles.find((item) => item.role_code === role)
      db.user_roles
        .filter((item) => item.user_id === userId && !item.effective_to)
        .forEach((item) => {
          item.effective_to = now()
          item.revocation_reason = reason
        })
      db.user_roles.push({
        id: nid('ur'),
        user_id: userId,
        role_id: roleRecord?.id ?? 'role-staff',
        scope_org_id: user.org_id,
        effective_from: now(),
        effective_to: null,
        granted_by_id: actor(),
        revocation_reason: null,
      })
      audit({
        action: 'Phân quyền tài khoản theo vai trò',
        targetType: 'USER',
        targetId: userId,
        reason: `${previous} → ${role}. ${reason}`,
      })
      touch()
    },

    setUserStatus: (userId, status, reason) => {
      const user = get().db.users.find((item) => item.id === userId)
      if (!user) return
      user.status = status
      audit({ action: 'Cập nhật trạng thái tài khoản', targetType: 'USER', targetId: userId, reason })
      touch()
    },

    saveOrganization: (input) => {
      const { db } = get()
      if (input.id) {
        const org = db.organizations.find((item) => item.id === input.id)
        if (org) Object.assign(org, input)
        audit({ action: 'Cập nhật thông tin tổ chức', targetType: 'ORGANIZATION', targetId: input.id })
      } else {
        const id = nid('org')
        db.organizations.push({
          id,
          org_code: input.org_code ?? id.toUpperCase(),
          org_name: input.org_name ?? 'Tổ chức mới',
          short_name: input.short_name,
          org_type: input.org_type ?? 'GOVERNMENT_DEPARTMENT',
          parent_org_id: null,
          locality_id: input.locality_id ?? 'loc-hue',
          email: input.email,
          phone: input.phone,
          address: input.address,
          representative_name: input.representative_name,
          status: 'ACTIVE',
          created_at: now(),
        })
        audit({ action: 'Tạo tổ chức mới', targetType: 'ORGANIZATION', targetId: id })
      }
      touch()
    },

    saveTopic: (input) => {
      const { db } = get()
      if (input.id) {
        const topic = db.topics.find((item) => item.id === input.id)
        if (topic) {
          topic.code = input.code
          topic.name = input.name
          topic.is_active = input.isActive
        }
      } else {
        db.topics.push({
          id: nid('top'),
          code: input.code,
          name: input.name,
          parent_topic_id: null,
          sort_order: db.topics.length + 1,
          is_active: input.isActive,
        })
      }
      audit({ action: 'Cập nhật danh mục lĩnh vực' })
      touch()
    },

    saveTag: (input) => {
      const { db } = get()
      if (input.id) {
        const tag = db.tags.find((item) => item.id === input.id)
        if (tag) {
          tag.code = input.code
          tag.name = input.name
          tag.tag_type = input.tagType
        }
      } else {
        db.tags.push({ id: nid('tag'), code: input.code, name: input.name, tag_type: input.tagType })
      }
      audit({ action: 'Cập nhật danh mục nhãn' })
      touch()
    },

    testIntegration: (integrationId) => {
      const { db } = get()
      const integration = db.integrations.find((item) => item.id === integrationId)
      if (!integration) return
      const failing = integration.system_code === 'SMS' || integration.status === 'SUSPENDED'
      integration.last_checked_at = now()
      integration.status = failing ? (integration.status === 'SUSPENDED' ? 'SUSPENDED' : 'ERROR') : 'ACTIVE'
      integration.last_check_result = failing
        ? integration.status === 'SUSPENDED'
          ? 'Tích hợp đang tạm ngưng theo đề nghị của đơn vị chủ quản.'
          : 'Lỗi xác thực (HTTP 401). Mật khẩu brandname có thể đã hết hiệu lực, cần cấp lại.'
        : `Kết nối thành công, độ trễ ${120 + Math.floor(Math.random() * 300)} ms.`

      db.integration_logs.unshift({
        id: nid('il'),
        integration_id: integrationId,
        direction: 'OUTBOUND',
        endpoint: '/health',
        payload_summary: 'Kiểm tra kết nối thủ công từ màn hình quản trị',
        status_code: failing ? 401 : 200,
        is_success: !failing,
        error_message: failing ? integration.last_check_result : null,
        occurred_at: now(),
      })
      audit({
        action: 'Kiểm tra kết nối hệ thống ngoài',
        result: failing ? 'ERROR' : 'SUCCESS',
        reason: integration.last_check_result,
      })
      touch()
    },

    /* ── Thông báo ──────────────────────────────────────────────────────── */

    markNotificationRead: (notificationId) => {
      const notification = get().db.notifications.find((item) => item.id === notificationId)
      if (notification && !notification.read_at) {
        notification.read_at = now()
        touch()
      }
    },

    markAllNotificationsRead: () => {
      const userId = actor()
      get()
        .db.notifications.filter((item) => item.recipient_id === userId && !item.read_at)
        .forEach((item) => (item.read_at = now()))
      touch()
    },
  }
})

/**
 * Đọc dữ liệu kèm đăng ký theo dõi thay đổi.
 * Kho dữ liệu được sửa tại chỗ cho gọn (khong tao object moi), nen ban than
 * `db` giu nguyen reference qua moi lan thao tac. Neu tra thang object do,
 * moi `useMemo(() => ..., [db])` o noi goi se KHONG BAO GIO tinh lai — da
 * gay loi thuc te (doi vai tro nguoi dung tren /quan-tri/nguoi-dung khong
 * cap nhat tren bang du toast bao thanh cong). Vi vay o day tra ve mot ban
 * sao nong (shallow copy), chi tao moi khi `revision` thuc su tang, de moi
 * noi dung `[db]` lam dependency hoat dong dung nhu ky vong thong thuong.
 */
export function useDb(): Database {
  const revision = useStore((state) => state.revision)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- co y chi phu thuoc revision, doc db tuoi nhat luc tinh
  return useMemo(() => ({ ...useStore.getState().db }), [revision])
}

export function useCurrentUser(): User | null {
  const userId = useStore((state) => state.currentUserId)
  const db = useDb()
  return userId ? db.users.find((user) => user.id === userId) ?? null : null
}

export { addDays }
