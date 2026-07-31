/**
 * Nhãn tiếng Việt + sắc thái hiển thị cho toàn bộ enum trong schema.
 * Mọi nơi hiển thị trạng thái đều đọc từ đây — không viết chuỗi tiếng Việt rời rạc
 * trong từng màn hình, để nhãn luôn thống nhất.
 */
import type {
  AccessAction,
  ActionResult,
  AlertStatus,
  AnswerStatus,
  ApprovalAction,
  AssetAccessAction,
  AssignmentStatus,
  BadgeStatus,
  CrisisTaskStatus,
  DeliveryChannel,
  DeliveryStatus,
  EntityType,
  EventStatus,
  ExtensionStatus,
  ExternalSystemCode,
  FakeNewsFlag,
  IntegrationStatus,
  InterviewRequestStatus,
  InvitationStatus,
  LinkStatus,
  LocalityLevel,
  MediaType,
  MetadataStatus,
  NotificationType,
  OrganizationStatus,
  OrganizationType,
  Priority,
  ProfileRequestType,
  ProfileStatus,
  QuestionStatus,
  ReleaseStatus,
  ReleaseVersionType,
  ReportFormat,
  ReportJobStatus,
  RoleCode,
  ScopeType,
  SecurityLevel,
  Sentiment,
  Severity,
  SourceChannel,
  SourceStatus,
  TagReviewStatus,
  TagSource,
  TagType,
  UserStatus,
  VerificationStatus,
} from '@/mock/types'

/** Sắc thái dùng chung — ánh xạ sang màu trạng thái trong index.css */
export type Tone = 'neutral' | 'info' | 'warning' | 'good' | 'critical'

export interface EnumMeta {
  label: string
  tone: Tone
}

type Dict<T extends string> = Record<T, EnumMeta>

const n = (label: string): EnumMeta => ({ label, tone: 'neutral' })
const i = (label: string): EnumMeta => ({ label, tone: 'info' })
const w = (label: string): EnumMeta => ({ label, tone: 'warning' })
const g = (label: string): EnumMeta => ({ label, tone: 'good' })
const c = (label: string): EnumMeta => ({ label, tone: 'critical' })

/* ───────────────────────────────── Nền tảng ──────────────────────────────── */

export const organizationType: Dict<OrganizationType> = {
  DEPT_CULTURE_SPORTS_TOURISM: i('Sở Văn hóa, Thể thao và Du lịch'),
  SPOKESPERSON_AGENCY: i('Cơ quan phát ngôn'),
  PRESS_AGENCY: i('Cơ quan báo chí'),
  GOVERNMENT_DEPARTMENT: n('Sở, ban, ngành'),
}

export const organizationStatus: Dict<OrganizationStatus> = {
  ACTIVE: g('Đang hoạt động'),
  SUSPENDED: w('Tạm dừng'),
  INACTIVE: n('Ngừng hoạt động'),
}

export const userStatus: Dict<UserStatus> = {
  PENDING_ACTIVATION: w('Chờ kích hoạt'),
  ACTIVE: g('Đang hoạt động'),
  LOCKED: c('Đã khóa'),
  DISABLED: n('Vô hiệu hóa'),
}

export const roleCode: Dict<RoleCode> = {
  SUPERADMIN: c('Quản trị tối cao'),
  ADMIN: i('Quản trị viên Sở'),
  COORDINATOR: i('Điều phối viên'),
  APPROVER: i('Lãnh đạo duyệt'),
  STAFF: i('Cán bộ xử lý'),
  MEDIA_ORG: i('Cơ quan báo chí'),
  JOURNALIST: i('Phóng viên, nhà báo'),
  LEADER: i('Lãnh đạo theo dõi'),
  OTHER_DEPT: i('Sở, ban, ngành phối hợp'),
  GATE_STAFF: i('Nhân viên cổng sự kiện'),
}

export const deliveryChannel: Dict<DeliveryChannel> = {
  IN_APP: n('Trong hệ thống'),
  EMAIL: n('Email'),
  SMS: n('SMS'),
  ZALO_OA: n('Zalo OA'),
  PUSH: n('Thông báo đẩy'),
}

export const deliveryStatus: Dict<DeliveryStatus> = {
  PENDING: w('Chờ gửi'),
  SENT: g('Đã gửi'),
  FAILED: c('Gửi lỗi'),
}

export const actionResult: Dict<ActionResult> = {
  SUCCESS: g('Thành công'),
  DENIED: w('Từ chối'),
  ERROR: c('Lỗi'),
}

export const securityLevel: Dict<SecurityLevel> = {
  PUBLIC: g('Công khai'),
  INTERNAL: w('Nội bộ'),
  CONFIDENTIAL: c('Mật'),
}

export const externalSystemCode: Dict<ExternalSystemCode> = {
  IOC: n('Trung tâm điều hành thông minh (IOC)'),
  CONG_DVC: n('Cổng dịch vụ công'),
  VBDT: n('Quản lý văn bản điện tử'),
  ZALO_OA: n('Zalo OA'),
  SMS: n('Tổng đài SMS'),
  EMAIL: n('Máy chủ email'),
  PRESS_CMS: n('CMS cơ quan báo chí'),
  DIGITAL_SIGNATURE: n('Hệ thống ký số'),
  MAM_DAM: n('Kho MAM/DAM ngoài'),
}

export const integrationStatus: Dict<IntegrationStatus> = {
  ACTIVE: g('Đang kết nối'),
  ERROR: c('Mất kết nối'),
  SUSPENDED: n('Tạm ngưng'),
}

export const localityLevel: Dict<LocalityLevel> = {
  PROVINCE: n('Tỉnh, thành phố'),
  DISTRICT: n('Quận, huyện'),
  WARD: n('Phường, xã'),
}

export const entityType: Dict<EntityType> = {
  ORGANIZATION: n('Tổ chức'),
  USER: n('Người dùng'),
  JOURNALIST_PROFILE: n('Hồ sơ nhà báo'),
  PRESS_WORK: n('Tác phẩm báo chí'),
  PRESS_RELEASE: n('Thông cáo'),
  QUESTION: n('Câu hỏi'),
  ANSWER: n('Câu trả lời'),
  EVENT: n('Sự kiện'),
  INVITATION: n('Giấy mời'),
  MEDIA_ASSET: n('Tài nguyên số'),
}

export const severity: Dict<Severity> = {
  LOW: n('Thấp'),
  MEDIUM: w('Trung bình'),
  HIGH: w('Cao'),
  CRITICAL: c('Nghiêm trọng'),
}

/* ────────────────────────────────── E1 ───────────────────────────────────── */

export const profileStatus: Dict<ProfileStatus> = {
  DRAFT: n('Nháp'),
  PENDING_APPROVAL: w('Chờ duyệt'),
  APPROVED: g('Đã duyệt'),
  REJECTED: c('Từ chối'),
  EXPIRED: c('Hết hạn'),
  REVOKED: c('Đã thu hồi'),
}

export const profileRequestType: Dict<ProfileRequestType> = {
  NEW_REGISTRATION: i('Đăng ký mới'),
  RENEWAL: i('Gia hạn'),
  UPDATE: i('Cập nhật thông tin'),
}

export const linkStatus: Dict<LinkStatus> = {
  ACTIVE: g('Đang liên kết'),
  TERMINATED: n('Đã chấm dứt'),
}

export const verificationStatus: Dict<VerificationStatus> = {
  UNVERIFIED: w('Chờ xác minh'),
  VERIFIED: g('Đã xác minh'),
  REJECTED: c('Không hợp lệ'),
}

/* ────────────────────────────────── E2 ───────────────────────────────────── */

export const releaseStatus: Dict<ReleaseStatus> = {
  DRAFT: n('Nháp'),
  PENDING_APPROVAL: w('Chờ duyệt'),
  NEEDS_REVISION: w('Yêu cầu chỉnh sửa'),
  PUBLISHED: g('Đã phát hành'),
  CORRECTED: i('Đã đính chính'),
  WITHDRAWN: c('Đã thu hồi'),
}

export const releaseVersionType: Dict<ReleaseVersionType> = {
  ORIGINAL: n('Bản gốc'),
  CORRECTION: i('Bản đính chính'),
}

export const scopeType: Dict<ScopeType> = {
  ALL: n('Toàn bộ báo chí'),
  ORGANIZATION: n('Theo cơ quan báo chí'),
  JOURNALIST: n('Theo phóng viên'),
  TOPIC: n('Theo lĩnh vực'),
}

export const accessAction: Dict<AccessAction> = {
  VIEW: n('Xem'),
  DOWNLOAD: i('Tải về'),
}

export const approvalAction: Dict<ApprovalAction> = {
  APPROVE: g('Phê duyệt'),
  RETURN: w('Trả lại chỉnh sửa'),
  REJECT: c('Từ chối'),
}

/* ───────────────────────────────── E3+E4 ─────────────────────────────────── */

export const questionStatus: Dict<QuestionStatus> = {
  SUBMITTED: i('Đã gửi'),
  ROUTING: w('Đang điều phối'),
  ROUTED: i('Đã chuyển đơn vị'),
  ASSIGNED: i('Đã phân công'),
  IN_PROGRESS: w('Đang soạn trả lời'),
  AWAITING_CLARIFICATION: w('Chờ làm rõ'),
  PENDING_APPROVAL: w('Chờ lãnh đạo duyệt'),
  ANSWERED: g('Đã trả lời'),
  OVERDUE: c('Quá hạn'),
  CANCELLED: n('Đã rút'),
  REJECTED: c('Từ chối tiếp nhận'),
}

/** Gom 11 trạng thái câu hỏi thành 5 nhóm để vẽ biểu đồ và lọc nhanh */
export const questionStatusGroup: Record<
  QuestionStatus,
  'incoming' | 'processing' | 'approving' | 'done' | 'closed'
> = {
  SUBMITTED: 'incoming',
  ROUTING: 'incoming',
  ROUTED: 'incoming',
  ASSIGNED: 'processing',
  IN_PROGRESS: 'processing',
  AWAITING_CLARIFICATION: 'processing',
  PENDING_APPROVAL: 'approving',
  ANSWERED: 'done',
  OVERDUE: 'closed',
  CANCELLED: 'closed',
  REJECTED: 'closed',
}

export const priority: Dict<Priority> = {
  LOW: n('Thấp'),
  NORMAL: n('Bình thường'),
  HIGH: w('Cao'),
  URGENT: c('Khẩn'),
}

export const assignmentStatus: Dict<AssignmentStatus> = {
  IN_PROGRESS: w('Đang xử lý'),
  REASSIGNED: n('Đã chuyển người khác'),
  COMPLETED: g('Hoàn thành'),
}

export const extensionStatus: Dict<ExtensionStatus> = {
  PENDING_APPROVAL: w('Chờ duyệt'),
  APPROVED: g('Đã duyệt'),
  REJECTED: c('Từ chối'),
}

export const answerStatus: Dict<AnswerStatus> = {
  DRAFT: n('Nháp'),
  PENDING_APPROVAL: w('Chờ duyệt'),
  NEEDS_REVISION: w('Yêu cầu chỉnh sửa'),
  APPROVED: g('Đã duyệt'),
  SENT: g('Đã gửi phóng viên'),
}

/* ────────────────────────────────── E5 ───────────────────────────────────── */

export const eventStatus: Dict<EventStatus> = {
  DRAFT: n('Nháp'),
  INVITATIONS_SENT: i('Đã gửi giấy mời'),
  RESCHEDULED: w('Đã dời lịch'),
  CANCELLED: c('Đã hủy'),
  ONGOING: g('Đang diễn ra'),
  COMPLETED: n('Đã kết thúc'),
}

export const invitationStatus: Dict<InvitationStatus> = {
  SENT: i('Đã gửi'),
  ACCEPTED: g('Đã xác nhận'),
  DECLINED: n('Từ chối'),
  NO_RESPONSE: w('Chưa phản hồi'),
  CANCELLED: n('Đã hủy'),
}

export const badgeStatus: Dict<BadgeStatus> = {
  VALID: g('Còn hiệu lực'),
  USED: i('Đã sử dụng'),
  REVOKED: c('Đã thu hồi'),
  EXPIRED: n('Hết hạn'),
}

export const interviewRequestStatus: Dict<InterviewRequestStatus> = {
  NEW: w('Mới gửi'),
  ASSIGNED: i('Đã phân công'),
  CONFIRMED: g('Đã xác nhận lịch'),
  REJECTED: c('Từ chối'),
  COMPLETED: n('Đã phỏng vấn'),
}

/* ────────────────────────────────── E6 ───────────────────────────────────── */

export const mediaType: Dict<MediaType> = {
  DOCUMENT: n('Tài liệu'),
  IMAGE: n('Hình ảnh'),
  VIDEO: n('Video'),
  AUDIO: n('Âm thanh'),
}

export const metadataStatus: Dict<MetadataStatus> = {
  COMPLETE: g('Đầy đủ'),
  INCOMPLETE: w('Thiếu metadata'),
}

export const tagType: Dict<TagType> = {
  PERSON: n('Nhân vật'),
  EVENT: n('Sự kiện'),
  TOPIC: n('Lĩnh vực'),
  KEYWORD: n('Từ khóa'),
}

export const tagSource: Dict<TagSource> = {
  AI: i('AI gán'),
  MANUAL: n('Gán thủ công'),
}

export const tagReviewStatus: Dict<TagReviewStatus> = {
  PENDING_REVIEW: w('Chờ duyệt nhãn'),
  CONFIRMED: g('Đã xác nhận'),
  REJECTED: c('Đã loại'),
}

export const assetAccessAction: Dict<AssetAccessAction> = {
  VIEW: n('Xem'),
  DOWNLOAD: i('Tải về'),
  DENIED: c('Bị từ chối'),
}

/* ────────────────────────────────── E7 ───────────────────────────────────── */

export const sourceChannel: Dict<SourceChannel> = {
  ONLINE_NEWS: n('Báo điện tử'),
  SOCIAL: n('Mạng xã hội'),
  BROADCAST: n('Truyền hình'),
  RADIO: n('Phát thanh'),
}

export const sourceStatus: Dict<SourceStatus> = {
  ACTIVE: g('Đang thu thập'),
  ERROR: c('Lỗi nguồn'),
  PAUSED: n('Tạm dừng'),
}

export const sentiment: Dict<Sentiment> = {
  POSITIVE: g('Tích cực'),
  NEUTRAL: n('Trung lập'),
  NEGATIVE: c('Tiêu cực'),
}

export const fakeNewsFlag: Dict<FakeNewsFlag> = {
  NONE: n('Không dấu hiệu'),
  SUSPECTED: w('Nghi ngờ tin giả'),
  CONFIRMED: c('Xác định tin giả'),
}

/* ────────────────────────────────── E8 ───────────────────────────────────── */

export const alertStatus: Dict<AlertStatus> = {
  NEW: c('Mới phát hiện'),
  ACKNOWLEDGED: w('Đã tiếp nhận'),
  RESPONDING: w('Đang ứng phó'),
  RESOLVED: g('Đã xử lý xong'),
  DISMISSED: n('Bỏ qua'),
}

export const crisisTaskStatus: Dict<CrisisTaskStatus> = {
  ASSIGNED: i('Đã giao'),
  IN_PROGRESS: w('Đang thực hiện'),
  SUBMITTED: w('Đã báo cáo, chờ duyệt'),
  DONE: g('Hoàn thành'),
}

/* ────────────────────────────────── E9 ───────────────────────────────────── */

export const reportJobStatus: Dict<ReportJobStatus> = {
  QUEUED: n('Trong hàng đợi'),
  RUNNING: w('Đang xử lý'),
  READY: g('Sẵn sàng tải'),
  FAILED: c('Thất bại'),
}

export const reportFormat: Dict<ReportFormat> = {
  PDF: n('PDF'),
  EXCEL: n('Excel'),
}

/* ─────────────────────────────── Thông báo ───────────────────────────────── */

export const notificationType: Dict<NotificationType> = {
  PROFILE_APPROVED: g('Hồ sơ được duyệt'),
  PROFILE_REJECTED: c('Hồ sơ bị từ chối'),
  PROFILE_EXPIRING: w('Hồ sơ sắp hết hạn'),
  PROFILE_EXPIRED: c('Hồ sơ đã hết hạn'),
  COMPLIANCE_VIOLATION: c('Ghi nhận vi phạm'),
  RELEASE_PUBLISHED: g('Thông cáo mới phát hành'),
  RELEASE_CORRECTED: w('Thông cáo được đính chính'),
  RELEASE_WITHDRAWN: c('Thông cáo bị thu hồi'),
  QUESTION_ROUTED: i('Câu hỏi được chuyển đến'),
  QUESTION_ASSIGNED: i('Bạn được phân công câu hỏi'),
  QUESTION_ANSWERED: g('Câu hỏi đã có phản hồi'),
  QUESTION_DUE_SOON: w('Câu hỏi sắp đến hạn'),
  QUESTION_OVERDUE: c('Câu hỏi quá hạn'),
  DUPLICATE_QUESTION: w('Phát hiện câu hỏi trùng'),
  CLARIFICATION_REQUESTED: w('Yêu cầu làm rõ câu hỏi'),
  EXTENSION_APPROVED: g('Gia hạn được duyệt'),
  EXTENSION_REJECTED: c('Gia hạn bị từ chối'),
  ANSWER_RETURNED: w('Bản trả lời bị trả lại'),
  SENSITIVE_CONTENT: c('Cảnh báo nội dung nhạy cảm'),
  STATEMENT_CONTRADICTION: w('Phát hiện mâu thuẫn phát ngôn'),
  STAFF_OVERLOADED: w('Cán bộ quá tải'),
  EVENT_INVITATION: i('Giấy mời sự kiện'),
  EVENT_RESCHEDULED: w('Sự kiện dời lịch'),
  EVENT_CANCELLED: c('Sự kiện bị hủy'),
  BADGE_ISSUED: g('Đã cấp thẻ tác nghiệp'),
  POST_EVENT_PACKAGE: i('Tài liệu sau sự kiện'),
  INTERVIEW_ASSIGNED: i('Yêu cầu phỏng vấn được phân công'),
  INTERVIEW_SCHEDULE_CONFLICT: w('Trùng lịch phỏng vấn'),
  INTEGRATION_FAILURE: c('Tích hợp gặp lỗi'),
  CRISIS_ALERT: c('Cảnh báo khủng hoảng truyền thông'),
  CRISIS_TASK_ASSIGNED: w('Được giao nhiệm vụ ứng phó'),
}

/* ───────────────────────────────── Tiện ích ──────────────────────────────── */

/** Tra nhãn an toàn: enum lạ vẫn hiển thị được thay vì để trống */
export function meta<T extends string>(dict: Dict<T>, key: T | null | undefined): EnumMeta {
  if (!key) return n('—')
  return dict[key] ?? n(String(key))
}

export function label<T extends string>(dict: Dict<T>, key: T | null | undefined): string {
  return meta(dict, key).label
}
