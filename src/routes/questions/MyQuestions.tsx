import { useMemo } from "react";
import { Link, useNavigate } from "react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, TruncatedText } from "@/components/common/DataTable";
import { DocCode, PageHeader } from "@/components/common/PageHeader";
import { StatusBadge, ToneText } from "@/components/common/StatusBadge";
import { questionStatus } from "@/lib/enums";
import { deadlineInfo, formatDate } from "@/lib/format";
import { useCurrentUser, useDb } from "@/mock/store";
import { orgName, profileOfUser } from "@/mock/selectors";
import type { Question } from "@/mock/types";

interface Row {
	id: string;
	code: string;
	title: string;
	handlingOrg: string;
	status: Question["status"];
	statusLabel: string;
	submittedAt: string;
	dueAt: string | null;
	answeredAt: string | null;
}

/** Danh sách câu hỏi do chính phóng viên đang đăng nhập gửi đi. */
export function MyQuestions() {
	const db = useDb();
	const user = useCurrentUser();
	const navigate = useNavigate();

	const profile = profileOfUser(db, user?.id);
	const rows: Row[] = useMemo(() => {
		const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
		if (!isAdmin && !profile) return [];
		return db.questions
			.filter(
				(question) =>
					isAdmin || question.journalist_profile_id === profile?.id,
			)
			.map((question) => ({
				id: question.id,
				code: question.question_code,
				title: question.title,
				handlingOrg: question.handling_org_id
					? orgName(db, question.handling_org_id)
					: "Đang điều phối",
				status: question.status,
				statusLabel: questionStatus[question.status].label,
				submittedAt: question.submitted_at,
				dueAt: question.due_at ?? null,
				answeredAt: question.answered_at ?? null,
			}))
			.sort((left, right) =>
				right.submittedAt.localeCompare(left.submittedAt),
			);
	}, [db, profile, user]);

	const columns: ColumnDef<Row, unknown>[] = [
		{
			accessorKey: "code",
			header: "Mã câu hỏi",
			cell: ({ row }) => <DocCode>{row.original.code}</DocCode>,
		},
		{
			accessorKey: "title",
			header: "Câu hỏi",
			cell: ({ row }) => (
				<TruncatedText className="max-w-[260px] font-medium">
					{row.original.title}
				</TruncatedText>
			),
		},
		{
			accessorKey: "handlingOrg",
			header: "Đơn vị xử lý",
			cell: ({ row }) => (
				<TruncatedText className="max-w-[160px]">
					{row.original.handlingOrg}
				</TruncatedText>
			),
		},
		{
			accessorKey: "statusLabel",
			header: "Trạng thái",
			cell: ({ row }) => (
				<StatusBadge meta={questionStatus[row.original.status]} />
			),
		},
		{
			accessorKey: "submittedAt",
			header: "Ngày gửi",
			meta: { className: "hidden sm:table-cell" },
			cell: ({ row }) => (
				<span className="font-mono text-xs tabular">
					{formatDate(row.original.submittedAt)}
				</span>
			),
		},
		{
			accessorKey: "dueAt",
			header: "Hạn trả lời",
			cell: ({ row }) => {
				if (row.original.answeredAt) {
					return (
						<ToneText tone="good">
							<span className="text-xs">
								Đã trả lời {formatDate(row.original.answeredAt)}
							</span>
						</ToneText>
					);
				}
				const info = deadlineInfo(row.original.dueAt);
				if (!info)
					return (
						<span className="text-muted-foreground text-xs">
							Chưa ấn định
						</span>
					);
				return (
					<ToneText tone={info.tone}>
						<span className="text-xs">{info.label}</span>
					</ToneText>
				);
			},
		},
	];

	return (
		<div className="space-y-5">
			<PageHeader
				module="E3"
				title="Câu hỏi của tôi"
				description="Theo dõi trạng thái và lịch sử xử lý từng câu hỏi bạn đã gửi tới cơ quan phát ngôn."
				actions={
					<Button asChild>
						<Link to="/cau-hoi/moi">
							<Plus className="size-4" />
							Gửi câu hỏi mới
						</Link>
					</Button>
				}
			/>

			<DataTable
				data={rows}
				columns={columns}
				searchColumn="title"
				searchPlaceholder="Tìm trong câu hỏi đã gửi..."
				facets={[
					{
						columnId: "statusLabel",
						label: "Trạng thái",
						options: Array.from(
							new Set(rows.map((row) => row.statusLabel)),
						).map((value) => ({ value, label: value })),
					},
				]}
				onRowClick={(row) => navigate(`/cau-hoi/${row.id}`)}
				emptyTitle="Bạn chưa gửi câu hỏi nào"
				emptyDescription="Gửi câu hỏi qua nền tảng để được phân luồng tới đúng cơ quan có thẩm quyền trả lời."
			/>
		</div>
	);
}
