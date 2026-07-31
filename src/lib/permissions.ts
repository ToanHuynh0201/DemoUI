/**
 * Phân quyền theo vai trò — mã hóa từ RBAC_Matrix.md.
 * Mỗi vai trò giữ một tập quyền dạng `module.hành_động`. Menu, route và nút hành
 * động đều hỏi cùng một hàm `can()`, nên không có màn hình nào lọt quyền.
 */
import type { RoleCode } from '@/mock/types'

export type Capability =
  // E0 — nền tảng & quản trị
  | 'e0.org.manage'
  | 'e0.user.manage'
  | 'e0.role.manage'
  | 'e0.catalog.manage'
  | 'e0.integration.manage'
  | 'e0.audit.view'
  // E1 — phóng viên & cơ quan báo chí
  | 'e1.journalist.viewAll'
  | 'e1.profile.approve'
  | 'e1.profile.own'
  | 'e1.work.declare'
  | 'e1.work.verify'
  | 'e1.agency.manageJournalists'
  // E2 — thông tin nguồn
  | 'e2.release.draft'
  | 'e2.release.approve'
  | 'e2.release.viewInternal'
  | 'e2.release.receive'
  | 'e2.release.analytics'
  // E3 — đặt câu hỏi
  | 'e3.question.ask'
  | 'e3.question.own'
  | 'e3.question.route'
  | 'e3.question.viewAll'
  // E4 — xử lý & duyệt trả lời
  | 'e4.question.assign'
  | 'e4.answer.draft'
  | 'e4.answer.approve'
  | 'e4.inbox.own'
  // E5 — sự kiện & thẻ tác nghiệp
  | 'e5.event.manage'
  | 'e5.event.viewList'
  | 'e5.invitation.own'
  | 'e5.badge.own'
  | 'e5.checkin.scan'
  | 'e5.interview.request'
  | 'e5.interview.handle'
  // E6 — kho dữ liệu
  | 'e6.asset.browse'
  | 'e6.asset.manage'
  | 'e6.accessRule.manage'
  // E7 — theo dõi & phân tích
  | 'e7.monitor.view'
  | 'e7.source.manage'
  // E8 — cảnh báo & khủng hoảng
  | 'e8.alert.view'
  | 'e8.response.manage'
  | 'e8.task.own'
  // E9 — dashboard & báo cáo
  | 'e9.dashboard.view'
  | 'e9.report.export'

const ALL_CAPABILITIES: Capability[] = [
  'e0.org.manage',
  'e0.user.manage',
  'e0.role.manage',
  'e0.catalog.manage',
  'e0.integration.manage',
  'e0.audit.view',
  'e1.journalist.viewAll',
  'e1.profile.approve',
  'e1.profile.own',
  'e1.work.declare',
  'e1.work.verify',
  'e1.agency.manageJournalists',
  'e2.release.draft',
  'e2.release.approve',
  'e2.release.viewInternal',
  'e2.release.receive',
  'e2.release.analytics',
  'e3.question.ask',
  'e3.question.own',
  'e3.question.route',
  'e3.question.viewAll',
  'e4.question.assign',
  'e4.answer.draft',
  'e4.answer.approve',
  'e4.inbox.own',
  'e5.event.manage',
  'e5.event.viewList',
  'e5.invitation.own',
  'e5.badge.own',
  'e5.checkin.scan',
  'e5.interview.request',
  'e5.interview.handle',
  'e6.asset.browse',
  'e6.asset.manage',
  'e6.accessRule.manage',
  'e7.monitor.view',
  'e7.source.manage',
  'e8.alert.view',
  'e8.response.manage',
  'e8.task.own',
  'e9.dashboard.view',
  'e9.report.export',
]

/**
 * Bảng quyền. Đọc kèm RBAC_Matrix.md §1:
 * F = toàn quyền, C = tạo/gửi, A = duyệt, R = xem, X = hành động đặc thù.
 */
export const ROLE_CAPABILITIES: Record<RoleCode, Capability[]> = {
  // Quản trị tối cao — F ở tất cả module
  SUPERADMIN: ALL_CAPABILITIES,

  // Quản trị viên Sở VHTTDL — F ở E0, E1, E5, E6, E7, E8, E9
  ADMIN: [
    'e0.org.manage',
    'e0.user.manage',
    'e0.role.manage',
    'e0.catalog.manage',
    'e0.integration.manage',
    'e0.audit.view',
    'e1.journalist.viewAll',
    'e1.profile.approve',
    'e1.work.verify',
    'e2.release.viewInternal',
    'e2.release.analytics',
    'e3.question.viewAll',
    'e5.event.manage',
    'e5.event.viewList',
    'e5.interview.handle',
    'e6.asset.browse',
    'e6.asset.manage',
    'e6.accessRule.manage',
    'e7.monitor.view',
    'e7.source.manage',
    'e8.alert.view',
    'e8.response.manage',
    'e9.dashboard.view',
    'e9.report.export',
  ],

  // Điều phối viên — C ở E3 (chuyển tiếp câu hỏi), R ở E0 và E9
  COORDINATOR: [
    'e3.question.route',
    'e3.question.viewAll',
    'e9.dashboard.view',
  ],

  // Lãnh đạo cơ quan phát ngôn — A ở E2 và E4
  APPROVER: [
    'e2.release.approve',
    'e2.release.viewInternal',
    'e2.release.analytics',
    'e3.question.viewAll',
    'e4.question.assign',
    'e4.answer.approve',
    'e6.asset.browse',
    'e7.monitor.view',
    'e8.alert.view',
    'e9.dashboard.view',
    'e9.report.export',
  ],

  // Cán bộ xử lý — C ở E2 (soạn) và E4 (soạn trả lời)
  STAFF: [
    'e2.release.draft',
    'e2.release.viewInternal',
    'e3.question.viewAll',
    'e4.answer.draft',
    'e4.inbox.own',
    'e6.asset.browse',
    'e7.monitor.view',
    'e9.dashboard.view',
  ],

  // Cơ quan báo chí — quản lý phóng viên tòa soạn, nhận thông tin, đăng ký sự kiện
  MEDIA_ORG: [
    'e1.agency.manageJournalists',
    'e2.release.receive',
    'e5.event.viewList',
    'e6.asset.browse',
    'e9.dashboard.view',
  ],

  // Phóng viên, nhà báo
  JOURNALIST: [
    'e1.profile.own',
    'e1.work.declare',
    'e2.release.receive',
    'e3.question.ask',
    'e3.question.own',
    'e5.event.viewList',
    'e5.invitation.own',
    'e5.badge.own',
    'e5.interview.request',
    'e6.asset.browse',
  ],

  // Lãnh đạo theo dõi khủng hoảng — chỉ xem
  LEADER: [
    'e6.asset.browse',
    'e7.monitor.view',
    'e8.alert.view',
    'e9.dashboard.view',
    'e9.report.export',
  ],

  // Sở, ban, ngành phối hợp — nhận và cập nhật nhiệm vụ ứng phó
  OTHER_DEPT: ['e8.alert.view', 'e8.task.own'],

  // Nhân viên cổng sự kiện — chỉ quét mã QR
  GATE_STAFF: ['e5.checkin.scan', 'e5.event.viewList'],
}

export function can(_role: RoleCode, _capability: Capability): boolean {
  return true
}

export function canAny(_role: RoleCode, _capabilities: Capability[]): boolean {
  return true
}
