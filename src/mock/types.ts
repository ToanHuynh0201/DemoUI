/**
 * Kiểu dữ liệu bản demo — chỉ còn 3 luồng nghiệp vụ chính: E2 (thông tin
 * nguồn), E3+E4 (hỏi & đáp báo chí), E5 (sự kiện & tác nghiệp), cộng hạ tầng
 * dùng chung (tổ chức, người dùng, thông báo, kho tài nguyên tối thiểu cho
 * đính kèm).
 */

export type ID = string
/** Chuỗi ISO 8601 */
export type Timestamp = string

/* ─────────────────────────── Enum — nhóm nền tảng ────────────────────────── */

export type OrganizationType =
  | 'DEPT_CULTURE_SPORTS_TOURISM'
  | 'SPOKESPERSON_AGENCY'
  | 'PRESS_AGENCY'
  | 'GOVERNMENT_DEPARTMENT'
export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE'
export type UserStatus = 'PENDING_ACTIVATION' | 'ACTIVE' | 'LOCKED' | 'DISABLED'
export type DeliveryChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'ZALO_OA' | 'PUSH'
export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED'
export type ActionResult = 'SUCCESS' | 'DENIED' | 'ERROR'
export type SecurityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL'
export type EntityType =
  | 'ORGANIZATION'
  | 'USER'
  | 'JOURNALIST_PROFILE'
  | 'PRESS_WORK'
  | 'PRESS_RELEASE'
  | 'QUESTION'
  | 'ANSWER'
  | 'EVENT'
  | 'INVITATION'
  | 'MEDIA_ASSET'
export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type NotificationType =
  | 'PROFILE_APPROVED'
  | 'PROFILE_REJECTED'
  | 'RELEASE_PUBLISHED'
  | 'RELEASE_CORRECTED'
  | 'RELEASE_WITHDRAWN'
  | 'QUESTION_ROUTED'
  | 'QUESTION_ASSIGNED'
  | 'QUESTION_ANSWERED'
  | 'QUESTION_DUE_SOON'
  | 'QUESTION_OVERDUE'
  | 'DUPLICATE_QUESTION'
  | 'CLARIFICATION_REQUESTED'
  | 'EXTENSION_APPROVED'
  | 'EXTENSION_REJECTED'
  | 'ANSWER_RETURNED'
  | 'EVENT_INVITATION'
  | 'EVENT_RESCHEDULED'
  | 'EVENT_CANCELLED'
  | 'BADGE_ISSUED'
  | 'POST_EVENT_PACKAGE'
  | 'INTERVIEW_ASSIGNED'
  | 'CRISIS_ALERT'
  | 'CRISIS_TASK_ASSIGNED'
  | 'PROFILE_EXPIRING'
  | 'PROFILE_EXPIRED'
  | 'STAFF_OVERLOADED'
  | 'INTEGRATION_FAILURE'
  | 'SENSITIVE_CONTENT'
  | 'STATEMENT_CONTRADICTION'
  | 'COMPLIANCE_VIOLATION'

/* ─────────────────────────── Enum — nhóm nghiệp vụ ───────────────────────── */

export type ProfileStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED'
export type ReleaseStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'NEEDS_REVISION'
  | 'PUBLISHED'
  | 'CORRECTED'
  | 'WITHDRAWN'
export type ReleaseVersionType = 'ORIGINAL' | 'CORRECTION'
export type ScopeType = 'ALL' | 'ORGANIZATION' | 'JOURNALIST' | 'TOPIC'
export type AccessAction = 'VIEW' | 'DOWNLOAD'
export type ApprovalAction = 'APPROVE' | 'RETURN' | 'REJECT'
export type QuestionStatus =
  | 'SUBMITTED'
  | 'ROUTING'
  | 'ROUTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'AWAITING_CLARIFICATION'
  | 'PENDING_APPROVAL'
  | 'ANSWERED'
  | 'OVERDUE'
  | 'CANCELLED'
  | 'REJECTED'
export type Priority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type AssignmentStatus = 'IN_PROGRESS' | 'REASSIGNED' | 'COMPLETED'
export type ExtensionStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
export type AnswerStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'NEEDS_REVISION'
  | 'APPROVED'
  | 'SENT'
export type EventStatus =
  | 'DRAFT'
  | 'INVITATIONS_SENT'
  | 'RESCHEDULED'
  | 'CANCELLED'
  | 'ONGOING'
  | 'COMPLETED'
export type InvitationStatus =
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'NO_RESPONSE'
  | 'CANCELLED'
export type BadgeStatus = 'VALID' | 'USED' | 'REVOKED' | 'EXPIRED'
export type InterviewRequestStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'COMPLETED'

/* ───────────────────── Enum — nhóm kho tài nguyên tối thiểu ──────────────── */

export type MediaType = 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO'
export type MetadataStatus = 'COMPLETE' | 'INCOMPLETE'

/* ────────────────────────── Vai trò trên hệ thống ────────────────────────── */

/** Chỉ còn dùng để hiển thị nhãn (chức danh) — không còn gác quyền theo vai trò. */
export type RoleCode =
  | 'SUPERADMIN'
  | 'ADMIN'
  | 'COORDINATOR'
  | 'APPROVER'
  | 'STAFF'
  | 'MEDIA_ORG'
  | 'JOURNALIST'
  | 'LEADER'
  | 'OTHER_DEPT'
  | 'GATE_STAFF'

/* ──────────────────────────── Bảng — lõi dùng chung ──────────────────────── */

export interface Organization {
  id: ID
  org_code: string
  org_name: string
  short_name?: string
  org_type: OrganizationType
  parent_org_id?: ID | null
  locality_id?: ID | null
  email?: string
  phone?: string
  address?: string
  representative_name?: string
  status: OrganizationStatus
  created_at: Timestamp
}

export interface User {
  id: ID
  org_id: ID
  username: string
  email: string
  phone?: string
  full_name: string
  job_title?: string
  status: UserStatus
  mfa_required: boolean
  last_login_at?: Timestamp | null
  /** Chức danh hiển thị — không còn dùng để phân quyền */
  role: RoleCode
  created_at: Timestamp
}

/** Lĩnh vực quan tâm của phóng viên — dùng để lọc người nhận khi phát hành thông cáo theo lĩnh vực (E2). */
export interface JournalistTopic {
  profile_id: ID
  topic_id: ID
  source: 'AI' | 'MANUAL'
  confidence?: number
  confirmed_by_id?: ID | null
}

export interface JournalistProfile {
  id: ID
  user_id: ID
  press_agency_id?: ID | null
  date_of_birth?: string
  /** Đã che số, mô phỏng trường mã hóa */
  national_id_masked: string
  press_card_no?: string
  press_card_issued_date?: string
  press_card_expiry_date?: string
  status: ProfileStatus
  compliance_score?: number
  approved_at?: Timestamp | null
  approved_by_id?: ID | null
  rejection_reason?: string | null
  created_at: Timestamp
}

export interface MediaAsset {
  id: ID
  display_name: string
  storage_path: string
  media_type: MediaType
  mime_type: string
  size_bytes: number
  resolution?: string
  duration_seconds?: number
  security_level: SecurityLevel
  is_encrypted: boolean
  owner_org_id: ID
  uploaded_by_id: ID
  topic_id?: ID | null
  extracted_text?: string
  metadata_status: MetadataStatus
  created_at: Timestamp
}

export interface AuditLog {
  id: ID
  user_id?: ID | null
  acting_role?: RoleCode | null
  action: string
  target_type?: EntityType | null
  target_id?: ID | null
  ip_address?: string
  result: ActionResult
  reason?: string
  occurred_at: Timestamp
}

export interface Notification {
  id: ID
  recipient_id: ID
  notification_type: NotificationType
  severity?: Severity
  title: string
  body: string
  target_type?: EntityType | null
  target_id?: ID | null
  channel: DeliveryChannel
  delivery_status: DeliveryStatus
  sent_at?: Timestamp | null
  read_at?: Timestamp | null
  created_at: Timestamp
}

/* ──────────────────────────── Bảng — danh mục chung ──────────────────────── */

export interface Topic {
  id: ID
  code: string
  name: string
  parent_topic_id?: ID | null
  sort_order: number
  is_active: boolean
}

/* ───────────────────────────── Bảng — E2 thông cáo ───────────────────────── */

export interface PressRelease {
  id: ID
  release_code: string
  title: string
  summary?: string
  content: string
  publishing_org_id: ID
  topic_id?: ID | null
  security_level: SecurityLevel
  version_type: ReleaseVersionType
  original_release_id?: ID | null
  status: ReleaseStatus
  drafted_by_id: ID
  approved_by_id?: ID | null
  submitted_at?: Timestamp | null
  published_at?: Timestamp | null
  withdrawn_at?: Timestamp | null
  withdrawal_reason?: string | null
  created_at: Timestamp
  updated_at: Timestamp
}

export interface ReleaseScope {
  id: ID
  release_id: ID
  scope_type: ScopeType
  org_id?: ID | null
  journalist_profile_id?: ID | null
  topic_id?: ID | null
}

export interface ReleaseAccess {
  id: ID
  release_id: ID
  user_id: ID
  org_id?: ID | null
  action: AccessAction
  asset_id?: ID | null
  occurred_at: Timestamp
}

export interface ApprovalNote {
  id: ID
  target_type: EntityType
  target_id: ID
  approver_id: ID
  action: ApprovalAction
  note?: string
  occurred_at: Timestamp
}

/* ─────────────────────────── Bảng — E3+E4 hỏi & đáp ──────────────────────── */

export interface Question {
  id: ID
  question_code: string
  journalist_profile_id: ID
  press_agency_id?: ID | null
  title: string
  content: string
  topic_id?: ID | null
  priority: Priority
  requested_deadline?: Timestamp | null
  due_at?: Timestamp | null
  status: QuestionStatus
  handling_org_id?: ID | null
  coordinator_id?: ID | null
  assignee_id?: ID | null
  duplicate_of_question_id?: ID | null
  rejection_reason?: string | null
  submitted_at: Timestamp
  answered_at?: Timestamp | null
}

export interface QuestionStatusHistory {
  id: ID
  question_id: ID
  old_status?: QuestionStatus | null
  new_status: QuestionStatus
  actor_id?: ID | null
  note?: string
  occurred_at: Timestamp
}

export interface QuestionRouting {
  id: ID
  question_id: ID
  target_org_id: ID
  coordinator_id: ID
  due_at: Timestamp
  is_rerouting: boolean
  reason?: string
  occurred_at: Timestamp
}

export interface QuestionAssignment {
  id: ID
  question_id: ID
  assignee_id: ID
  assigned_by_id: ID
  due_at: Timestamp
  status: AssignmentStatus
  is_reassignment: boolean
  reason?: string
  assigned_at: Timestamp
  ended_at?: Timestamp | null
}

export interface ClarificationRequest {
  id: ID
  question_id: ID
  requested_by_id: ID
  request_content: string
  requested_at: Timestamp
  response_content?: string | null
  responded_at?: Timestamp | null
}

export interface ExtensionRequest {
  id: ID
  question_id: ID
  requested_by_id: ID
  current_due_at: Timestamp
  proposed_due_at: Timestamp
  reason: string
  status: ExtensionStatus
  approved_by_id?: ID | null
  decided_at?: Timestamp | null
  decision_note?: string | null
  submitted_at: Timestamp
}

export interface Answer {
  id: ID
  question_id: ID
  version: number
  content: string
  drafted_by_id: ID
  status: AnswerStatus
  approved_by_id?: ID | null
  submitted_at?: Timestamp | null
  approved_at?: Timestamp | null
  sent_at?: Timestamp | null
  is_digitally_signed: boolean
  signature_transaction_id?: string | null
  created_at: Timestamp
}

/* ────────────────────────── Bảng — E5 sự kiện & thẻ ──────────────────────── */

export interface EventItem {
  id: ID
  event_code: string
  event_name: string
  event_type: string
  description?: string
  venue?: string
  start_time: Timestamp
  end_time?: Timestamp | null
  rsvp_deadline?: Timestamp | null
  org_id: ID
  created_by_id: ID
  status: EventStatus
  reschedule_note?: string | null
  cancellation_reason?: string | null
}

export interface Invitation {
  id: ID
  event_id: ID
  journalist_profile_id?: ID | null
  press_agency_id?: ID | null
  status: InvitationStatus
  requires_reconfirmation: boolean
  sent_at?: Timestamp | null
  responded_at?: Timestamp | null
}

export interface PressBadge {
  id: ID
  invitation_id: ID
  event_id: ID
  journalist_profile_id: ID
  qr_code: string
  valid_from: Timestamp
  valid_to: Timestamp
  status: BadgeStatus
  issued_at: Timestamp
}

export interface EventCheckin {
  id: ID
  badge_id?: ID | null
  event_id: ID
  scanned_by_id?: ID | null
  result: ActionResult
  rejection_reason?: string
  device?: string
  occurred_at: Timestamp
}

export interface InterviewRequest {
  id: ID
  event_id?: ID | null
  journalist_profile_id: ID
  subject: string
  content?: string
  proposed_interviewee_id?: ID | null
  slot_start?: Timestamp | null
  slot_end?: Timestamp | null
  status: InterviewRequestStatus
  handled_by_id?: ID | null
  note?: string | null
  created_at: Timestamp
}

/* ────────────────────── Bảng — kho tài nguyên tối thiểu ──────────────────── */
/** Chỉ giữ đủ để hiển thị đính kèm trên thông cáo (E2) và câu hỏi (E3+E4). */

export interface Attachment {
  id: ID
  asset_id: ID
  target_type: EntityType
  target_id: ID
  attachment_role: string
  sort_order: number
  attached_by_id?: ID | null
}

/* ─────────────────────────── Toàn bộ dữ liệu demo ────────────────────────── */

export interface Database {
  organizations: Organization[]
  users: User[]
  journalist_profiles: JournalistProfile[]
  journalist_topics: JournalistTopic[]
  media_assets: MediaAsset[]
  audit_logs: AuditLog[]
  notifications: Notification[]
  topics: Topic[]
  press_releases: PressRelease[]
  release_scopes: ReleaseScope[]
  release_accesses: ReleaseAccess[]
  approval_notes: ApprovalNote[]
  questions: Question[]
  question_status_history: QuestionStatusHistory[]
  question_routings: QuestionRouting[]
  question_assignments: QuestionAssignment[]
  clarification_requests: ClarificationRequest[]
  extension_requests: ExtensionRequest[]
  answers: Answer[]
  events: EventItem[]
  invitations: Invitation[]
  press_badges: PressBadge[]
  event_checkins: EventCheckin[]
  interview_requests: InterviewRequest[]
  attachments: Attachment[]
}
