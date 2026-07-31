/** Cây điều hướng. Mỗi mục khai báo quyền cần có; thanh bên tự lọc theo vai trò. */
import type { LucideIcon } from 'lucide-react'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileSearch,
  FileText,
  FolderOpen,
  Inbox,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Mail,
  MessageSquareText,
  Mic,
  Plug,
  QrCode,
  Radar,
  ScrollText,
  ShieldCheck,
  Siren,
  Tags,
  UserCheck,
  Users,
} from 'lucide-react'
import type { Capability } from './permissions'
import { canAny } from './permissions'
import type { RoleCode } from '@/mock/types'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  /** Hiện mục này nếu vai trò có ít nhất một trong các quyền sau */
  capabilities: Capability[]
}

export interface NavSection {
  /** Mã phân hệ, hiển thị nhỏ bên cạnh tên nhóm */
  code: string
  title: string
  items: NavItem[]
}

export const NAV: NavSection[] = [
  {
    code: 'E9',
    title: 'Tổng quan',
    items: [
      { to: '/dashboard', label: 'Dashboard điều hành', icon: LayoutDashboard, capabilities: ['e9.dashboard.view'] },
      { to: '/bao-cao', label: 'Báo cáo định kỳ', icon: BarChart3, capabilities: ['e9.report.export'] },
    ],
  },
  {
    code: 'E3·E4',
    title: 'Hỏi và đáp báo chí',
    items: [
      { to: '/cau-hoi/moi', label: 'Gửi câu hỏi', icon: MessageSquareText, capabilities: ['e3.question.ask'] },
      { to: '/cau-hoi-cua-toi', label: 'Câu hỏi của tôi', icon: ClipboardList, capabilities: ['e3.question.own'] },
      { to: '/dieu-phoi', label: 'Hàng đợi điều phối', icon: Inbox, capabilities: ['e3.question.route'] },
      { to: '/cau-hoi', label: 'Câu hỏi của đơn vị', icon: ClipboardList, capabilities: ['e3.question.viewAll'] },
      { to: '/viec-cua-toi', label: 'Việc của tôi', icon: ListChecks, capabilities: ['e4.inbox.own'] },
      { to: '/duyet-tra-loi', label: 'Duyệt trả lời', icon: ClipboardCheck, capabilities: ['e4.answer.approve'] },
    ],
  },
  {
    code: 'E2',
    title: 'Thông tin nguồn',
    items: [
      { to: '/thong-cao', label: 'Thông cáo báo chí', icon: FileText, capabilities: ['e2.release.draft', 'e2.release.approve', 'e2.release.viewInternal'] },
      { to: '/thong-tin-nguon', label: 'Thông tin nhận được', icon: Mail, capabilities: ['e2.release.receive'] },
      { to: '/hieu-qua-khai-thac', label: 'Hiệu quả khai thác', icon: BarChart3, capabilities: ['e2.release.analytics'] },
    ],
  },
  {
    code: 'E5',
    title: 'Sự kiện và tác nghiệp',
    items: [
      { to: '/su-kien', label: 'Sự kiện', icon: CalendarDays, capabilities: ['e5.event.manage', 'e5.event.viewList'] },
      { to: '/giay-moi', label: 'Giấy mời của tôi', icon: Mail, capabilities: ['e5.invitation.own'] },
      { to: '/the-tac-nghiep', label: 'Thẻ tác nghiệp', icon: QrCode, capabilities: ['e5.badge.own'] },
      { to: '/check-in', label: 'Check-in mã QR', icon: QrCode, capabilities: ['e5.checkin.scan'] },
      { to: '/phong-van', label: 'Yêu cầu phỏng vấn', icon: Mic, capabilities: ['e5.interview.request', 'e5.interview.handle'] },
    ],
  },
  {
    code: 'E1',
    title: 'Phóng viên và cơ quan báo chí',
    items: [
      { to: '/phong-vien', label: 'Danh sách phóng viên', icon: Users, capabilities: ['e1.journalist.viewAll'] },
      { to: '/duyet-ho-so', label: 'Duyệt hồ sơ', icon: UserCheck, capabilities: ['e1.profile.approve'] },
      { to: '/ho-so-cua-toi', label: 'Hồ sơ của tôi', icon: UserCheck, capabilities: ['e1.profile.own'] },
      { to: '/toa-soan', label: 'Phóng viên tòa soạn', icon: Building2, capabilities: ['e1.agency.manageJournalists'] },
    ],
  },
  {
    code: 'E6',
    title: 'Kho dữ liệu truyền thông',
    items: [
      { to: '/kho-du-lieu', label: 'Kho tài nguyên', icon: FolderOpen, capabilities: ['e6.asset.browse'] },
      { to: '/quyen-truy-cap', label: 'Quyền truy cập tài nguyên', icon: ShieldCheck, capabilities: ['e6.accessRule.manage'] },
    ],
  },
  {
    code: 'E7·E8',
    title: 'Theo dõi và cảnh báo',
    items: [
      { to: '/theo-doi', label: 'Dòng tin bài', icon: Radar, capabilities: ['e7.monitor.view'] },
      { to: '/phan-tich', label: 'Xu hướng và lan tỏa', icon: BarChart3, capabilities: ['e7.monitor.view'] },
      { to: '/nguon-theo-doi', label: 'Nguồn và từ khóa', icon: FileSearch, capabilities: ['e7.source.manage'] },
      { to: '/canh-bao', label: 'Cảnh báo khủng hoảng', icon: Siren, capabilities: ['e8.alert.view'] },
      { to: '/nhiem-vu', label: 'Nhiệm vụ ứng phó', icon: AlertTriangle, capabilities: ['e8.task.own'] },
    ],
  },
  {
    code: 'E0',
    title: 'Quản trị hệ thống',
    items: [
      { to: '/quan-tri/to-chuc', label: 'Tổ chức', icon: Building2, capabilities: ['e0.org.manage'] },
      { to: '/quan-tri/nguoi-dung', label: 'Người dùng và phân quyền', icon: Users, capabilities: ['e0.user.manage'] },
      { to: '/quan-tri/vai-tro', label: 'Vai trò và quyền', icon: KeyRound, capabilities: ['e0.role.manage'] },
      { to: '/quan-tri/danh-muc', label: 'Danh mục dùng chung', icon: Tags, capabilities: ['e0.catalog.manage'] },
      { to: '/quan-tri/tich-hop', label: 'Tích hợp hệ thống ngoài', icon: Plug, capabilities: ['e0.integration.manage'] },
      { to: '/quan-tri/nhat-ky', label: 'Nhật ký thao tác', icon: ScrollText, capabilities: ['e0.audit.view'] },
    ],
  },
]

/** Mục luôn hiển thị cho mọi tài khoản đã đăng nhập. */
export const COMMON_ITEMS: NavItem[] = [
  { to: '/thong-bao', label: 'Thông báo', icon: Bell, capabilities: [] },
]

export function navFor(role: RoleCode): NavSection[] {
  return NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAny(role, item.capabilities)),
  })).filter((section) => section.items.length > 0)
}

/** Trang mặc định sau khi đăng nhập, khác nhau theo vai trò. */
export const HOME_BY_ROLE: Record<RoleCode, string> = {
  SUPERADMIN: '/dashboard',
  ADMIN: '/dashboard',
  COORDINATOR: '/dieu-phoi',
  APPROVER: '/duyet-tra-loi',
  STAFF: '/viec-cua-toi',
  MEDIA_ORG: '/thong-tin-nguon',
  JOURNALIST: '/thong-tin-nguon',
  LEADER: '/dashboard',
  OTHER_DEPT: '/nhiem-vu',
  GATE_STAFF: '/check-in',
}
