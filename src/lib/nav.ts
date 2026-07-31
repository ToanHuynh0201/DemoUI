/** Cây điều hướng — chỉ còn 3 luồng nghiệp vụ chính, hiển thị như nhau cho mọi người dùng. */
import type { LucideIcon } from "lucide-react";
import {
	BarChart3,
	Bell,
	CalendarDays,
	ClipboardCheck,
	ClipboardList,
	FileText,
	Inbox,
	ListChecks,
	Mail,
	MessageSquareText,
	Mic,
	QrCode,
} from "lucide-react";

export interface NavItem {
	to: string;
	label: string;
	icon: LucideIcon;
}

export interface NavSection {
	/** Mã phân hệ, hiển thị nhỏ bên cạnh tên nhóm */
	code: string;
	title: string;
	items: NavItem[];
}

export const NAV: NavSection[] = [
	{
		code: "E3·E4",
		title: "Hỏi và đáp báo chí",
		items: [
			{
				to: "/cau-hoi/moi",
				label: "Gửi câu hỏi",
				icon: MessageSquareText,
			},
			{
				to: "/cau-hoi-cua-toi",
				label: "Câu hỏi của tôi",
				icon: ClipboardList,
			},
			{ to: "/dieu-phoi", label: "Hàng đợi điều phối", icon: Inbox },
			{
				to: "/cau-hoi",
				label: "Câu hỏi của đơn vị",
				icon: ClipboardList,
			},
			{ to: "/viec-cua-toi", label: "Việc của tôi", icon: ListChecks },
			{
				to: "/duyet-tra-loi",
				label: "Duyệt trả lời",
				icon: ClipboardCheck,
			},
		],
	},
	{
		code: "E2",
		title: "Thông tin nguồn",
		items: [
			{ to: "/thong-cao", label: "Thông cáo báo chí", icon: FileText },
			{
				to: "/thong-tin-nguon",
				label: "Thông tin nhận được",
				icon: Mail,
			},
			{
				to: "/hieu-qua-khai-thac",
				label: "Hiệu quả khai thác",
				icon: BarChart3,
			},
		],
	},
	{
		code: "E5",
		title: "Sự kiện và tác nghiệp",
		items: [
			{ to: "/su-kien", label: "Sự kiện", icon: CalendarDays },
			{ to: "/giay-moi", label: "Giấy mời của tôi", icon: Mail },
			{ to: "/the-tac-nghiep", label: "Thẻ tác nghiệp", icon: QrCode },
			{ to: "/check-in", label: "Check-in mã QR", icon: QrCode },
			// { to: '/phong-van', label: 'Yêu cầu phỏng vấn', icon: Mic },
		],
	},
];

/** Mục luôn hiển thị. */
export const COMMON_ITEMS: NavItem[] = [
	{ to: "/thong-bao", label: "Thông báo", icon: Bell },
];

/** Trang mặc định sau khi vào ứng dụng. */
export const DEFAULT_HOME = "/thong-cao";
