/**
 * Kiểu dữ liệu bản demo — ánh xạ 1-1 với DB/DATABASE_REPORT.md (42 bảng, 33 enum).
 *
 * LƯU Ý CHO ĐỘI DB: bốn bảng ở cuối file (monitoring_sources, media_articles,
 * crisis_alerts, crisis_tasks) KHÔNG có trong DB/schema.plantuml. Phân hệ E7
 * (theo dõi & phân tích truyền thông) và E8 (cảnh báo & xử lý khủng hoảng) chưa
 * được mô hình hóa trong schema hiện tại, nên phần này là ĐỀ XUẤT dựng từ use
 * case E7/E8 để bản demo chạy được. Cần rà lại khi bổ sung schema thật.
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
export type ExternalSystemCode =
  | 'IOC'
  | 'CONG_DVC'
  | 'VBDT'
  | 'ZALO_OA'
  | 'SMS'
  | 'EMAIL'
  | 'PRESS_CMS'
  | 'DIGITAL_SIGNATURE'
  | 'MAM_DAM'
export type IntegrationStatus = 'ACTIVE' | 'ERROR' | 'SUSPENDED'
export type IntegrationDirection = 'OUTBOUND' | 'INBOUND'
export type LocalityLevel = 'PROVINCE' | 'DISTRICT' | 'WARD'
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
  | 'PROFILE_EXPIRING'
  | 'PROFILE_EXPIRED'
  | 'COMPLIANCE_VIOLATION'
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
  | 'SENSITIVE_CONTENT'
  | 'STATEMENT_CONTRADICTION'
  | 'STAFF_OVERLOADED'
  | 'EVENT_INVITATION'
  | 'EVENT_RESCHEDULED'
  | 'EVENT_CANCELLED'
  | 'BADGE_ISSUED'
  | 'POST_EVENT_PACKAGE'
  | 'INTERVIEW_ASSIGNED'
  | 'INTERVIEW_SCHEDULE_CONFLICT'
  | 'INTEGRATION_FAILURE'
  | 'CRISIS_ALERT'
  | 'CRISIS_TASK_ASSIGNED'

/* ─────────────────────────── Enum — nhóm nghiệp vụ ───────────────────────── */

export type ProfileStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REVOKED'
export type ProfileRequestType = 'NEW_REGISTRATION' | 'RENEWAL' | 'UPDATE'
export type LinkStatus = 'ACTIVE' | 'TERMINATED'
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED' | 'REJECTED'
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

/* ───────────────────── Enum — nhóm AI & kho tài nguyên ───────────────────── */

export type MediaType = 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'AUDIO'
export type MetadataStatus = 'COMPLETE' | 'INCOMPLETE'
export type TagType = 'PERSON' | 'EVENT' | 'TOPIC' | 'KEYWORD'
export type TagSource = 'AI' | 'MANUAL'
export type TagReviewStatus = 'PENDING_REVIEW' | 'CONFIRMED' | 'REJECTED'
export type AssetAccessAction = 'VIEW' | 'DOWNLOAD' | 'DENIED'

/* ─── Enum — E7/E8, chưa có trong schema (xem ghi chú đầu file) ──────────── */

export type SourceChannel = 'ONLINE_NEWS' | 'SOCIAL' | 'BROADCAST' | 'RADIO'
export type SourceStatus = 'ACTIVE' | 'ERROR' | 'PAUSED'
export type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
export type FakeNewsFlag = 'NONE' | 'SUSPECTED' | 'CONFIRMED'
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESPONDING' | 'RESOLVED' | 'DISMISSED'
export type CrisisTaskStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'SUBMITTED' | 'DONE'
export type ReportJobStatus = 'QUEUED' | 'RUNNING' | 'READY' | 'FAILED'
export type ReportFormat = 'PDF' | 'EXCEL'

/* ────────────────────────── Vai trò trên hệ thống ────────────────────────── */

/** Khớp RBAC_Matrix.md §1 */
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
  /** Vai trò hiệu lực — rút gọn từ user_roles cho bản demo */
  role: RoleCode
  created_at: Timestamp
}

export interface Role {
  id: ID
  role_code: RoleCode
  role_name: string
  description?: string
  is_system_role: boolean
}

export interface Permission {
  id: ID
  permission_code: string
  module: string
  action: string
  description?: string
}

export interface UserRole {
  id: ID
  user_id: ID
  role_id: ID
  scope_org_id?: ID | null
  effective_from: Timestamp
  effective_to?: Timestamp | null
  granted_by_id?: ID | null
  revocation_reason?: string | null
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
  /** Văn bản trích xuất bằng OCR (ảnh/tài liệu) hoặc STT (audio/video) */
  extracted_text?: string
  metadata_status: MetadataStatus
  created_at: Timestamp
}

/* ────────────────────────── Bảng — E0 audit & tích hợp ───────────────────── */

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

export interface Integration {
  id: ID
  system_code: ExternalSystemCode
  display_name: string
  endpoint: string
  auth_type: string
  status: IntegrationStatus
  last_checked_at?: Timestamp | null
  last_check_result?: string
}

export interface IntegrationLog {
  id: ID
  integration_id: ID
  direction: IntegrationDirection
  endpoint?: string
  payload_summary?: string
  status_code?: number
  is_success: boolean
  error_message?: string | null
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

export interface Locality {
  id: ID
  code: string
  name: string
  level: LocalityLevel
  parent_locality_id?: ID | null
  is_active: boolean
}

export interface Tag {
  id: ID
  code: string
  name: string
  tag_type: TagType
}

/* ────────────────────────────── Bảng — E1 nhà báo ────────────────────────── */

export interface ProfileRequest {
  id: ID
  profile_id: ID
  request_type: ProfileRequestType
  changed_summary?: string
  status: ProfileStatus
  submitted_at: Timestamp
  handled_by_id?: ID | null
  handled_at?: Timestamp | null
  reason?: string | null
}

export interface JournalistAgencyLink {
  id: ID
  profile_id: ID
  press_agency_id: ID
  start_date: string
  end_date?: string | null
  status: LinkStatus
  confirmed_by_id?: ID | null
  note?: string
}

export interface JournalistTopic {
  profile_id: ID
  topic_id: ID
  source: TagSource
  confidence?: number
  confirmed_by_id?: ID | null
}

export interface PressWork {
  id: ID
  profile_id: ID
  title: string
  genre?: string
  published_date?: string
  publisher?: string
  url?: string
  topic_id?: ID | null
  verification_status: VerificationStatus
  verified_by_id?: ID | null
  created_at: Timestamp
}

export interface PressAward {
  id: ID
  profile_id: ID
  work_id?: ID | null
  award_name: string
  award_level?: string
  awarding_body?: string
  year: number
  verification_status: VerificationStatus
}

export interface ComplianceViolation {
  id: ID
  profile_id: ID
  violation_type: string
  description?: string
  severity: Severity
  penalty_points: number
  recorded_by_id?: ID | null
  occurred_at: Timestamp
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

/* ──────────────────────────── Bảng — E6 kho dữ liệu ──────────────────────── */

export interface Attachment {
  id: ID
  asset_id: ID
  target_type: EntityType
  target_id: ID
  attachment_role: string
  sort_order: number
  attached_by_id?: ID | null
}

export interface AssetTag {
  asset_id: ID
  tag_id: ID
  source: TagSource
  confidence?: number
  review_status: TagReviewStatus
  confirmed_by_id?: ID | null
}

export interface AssetAccessRule {
  id: ID
  security_level: SecurityLevel
  role_id: ID
  can_view: boolean
  can_download: boolean
}

export interface AssetAccessLog {
  id: ID
  asset_id: ID
  user_id: ID
  action: AssetAccessAction
  ip_address?: string
  occurred_at: Timestamp
}

/* ─── Bảng ĐỀ XUẤT — E7 theo dõi & phân tích (chưa có trong schema) ──────── */

export interface MonitoringSource {
  id: ID
  name: string
  channel: SourceChannel
  url?: string
  keywords: string[]
  topic_id?: ID | null
  status: SourceStatus
  last_fetched_at?: Timestamp | null
  last_error?: string | null
  articles_last_7d: number
}

export interface MediaArticle {
  id: ID
  source_id: ID
  title: string
  excerpt: string
  url?: string
  author?: string
  topic_id?: ID | null
  locality_id?: ID | null
  sentiment: Sentiment
  /** −1 (rất tiêu cực) … +1 (rất tích cực), do AI chấm */
  sentiment_score: number
  /** Mức lan tỏa tổng hợp: lượt chia sẻ, bình luận, dẫn lại */
  reach_score: number
  fake_news_flag: FakeNewsFlag
  published_at: Timestamp
}

/* ─── Bảng ĐỀ XUẤT — E8 cảnh báo & khủng hoảng (chưa có trong schema) ────── */

export interface CrisisAlert {
  id: ID
  alert_code: string
  title: string
  description: string
  topic_id?: ID | null
  locality_id?: ID | null
  severity: Severity
  status: AlertStatus
  /** Điểm rủi ro do AI chấm, 0–100 */
  risk_score: number
  fake_news_flag: FakeNewsFlag
  article_ids: ID[]
  detected_at: Timestamp
  acknowledged_by_id?: ID | null
  acknowledged_at?: Timestamp | null
  resolved_at?: Timestamp | null
  /** Số bài/ngày trong 14 ngày gần nhất, để vẽ biểu đồ diễn biến */
  trend: number[]
}

export interface CrisisTask {
  id: ID
  alert_id: ID
  title: string
  assigned_org_id: ID
  assigned_by_id: ID
  due_at: Timestamp
  status: CrisisTaskStatus
  progress_note?: string
  updated_at: Timestamp
}

/* ─── Bảng ĐỀ XUẤT — E9 job xuất báo cáo (chưa có trong schema) ──────────── */

export interface ReportJob {
  id: ID
  report_name: string
  period_from: string
  period_to: string
  format: ReportFormat
  requested_by_id: ID
  status: ReportJobStatus
  progress: number
  row_count?: number
  created_at: Timestamp
  finished_at?: Timestamp | null
}

/* ─────────────────────────── Toàn bộ dữ liệu demo ────────────────────────── */

export interface Database {
  organizations: Organization[]
  users: User[]
  roles: Role[]
  permissions: Permission[]
  user_roles: UserRole[]
  journalist_profiles: JournalistProfile[]
  media_assets: MediaAsset[]
  audit_logs: AuditLog[]
  integrations: Integration[]
  integration_logs: IntegrationLog[]
  notifications: Notification[]
  topics: Topic[]
  localities: Locality[]
  tags: Tag[]
  profile_requests: ProfileRequest[]
  journalist_agency_links: JournalistAgencyLink[]
  journalist_topics: JournalistTopic[]
  press_works: PressWork[]
  press_awards: PressAward[]
  compliance_violations: ComplianceViolation[]
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
  asset_tags: AssetTag[]
  asset_access_rules: AssetAccessRule[]
  asset_access_logs: AssetAccessLog[]
  monitoring_sources: MonitoringSource[]
  media_articles: MediaArticle[]
  crisis_alerts: CrisisAlert[]
  crisis_tasks: CrisisTask[]
  report_jobs: ReportJob[]
}
