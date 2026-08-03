import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { AiPanel } from "@/components/common/AiPanel";
import { Field } from "@/components/common/ActionDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { securityLevel } from "@/lib/enums";
import { useDb, useStore } from "@/mock/store";
import type { SecurityLevel } from "@/mock/types";

type SimpleScope = "ALL" | "ORGANIZATION";

/** E2 — soạn thảo thông tin nguồn: thông cáo, chọn phạm vi phát hành, gợi ý AI. */
export function ComposeRelease() {
	const db = useDb();
	const navigate = useNavigate();
	const { id: routeId } = useParams();
	const createRelease = useStore((state) => state.createRelease);
	const updateRelease = useStore((state) => state.updateRelease);
	const submitRelease = useStore((state) => state.submitRelease);

	const release = routeId ? db.press_releases.find((item) => item.id === routeId) : undefined;
	const isEdit = Boolean(routeId);
	const editable = !isEdit || (release && (release.status === "DRAFT" || release.status === "NEEDS_REVISION"));

	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [topicId, setTopicId] = useState("");
	const [level, setLevel] = useState<SecurityLevel>("PUBLIC");
	const [scopeType, setScopeType] = useState<SimpleScope>("ALL");
	const [scopeOrgIds, setScopeOrgIds] = useState<string[]>([]);

	useEffect(() => {
		if (!release) return;
		setTitle(release.title);
		setSummary(release.summary ?? "");
		setContent(release.content);
		setTopicId(release.topic_id ?? "");
		setLevel(release.security_level);
		const scopes = db.release_scopes.filter((item) => item.release_id === release.id);
		if (scopes.some((item) => item.scope_type === "ORGANIZATION")) {
			setScopeType("ORGANIZATION");
			setScopeOrgIds(
				scopes
					.filter((item) => item.scope_type === "ORGANIZATION" && item.org_id)
					.map((item) => item.org_id as string),
			);
		} else {
			setScopeType("ALL");
			setScopeOrgIds([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [release?.id]);

	if (isEdit && !release) {
		return <p className="text-muted-foreground py-10 text-center text-sm">Không tìm thấy thông cáo.</p>;
	}
	if (isEdit && !editable) {
		return <p className="text-muted-foreground py-10 text-center text-sm">Thông cáo này không còn ở trạng thái nháp nên không thể sửa.</p>;
	}

	const ready =
		title.trim().length > 8 &&
		content.trim().length > 40 &&
		topicId !== "" &&
		level !== null;
	const pressAgencies = db.organizations.filter(
		(org) => org.org_type === "PRESS_AGENCY",
	);

	const saveDraft = () => {
		const patch = {
			title: title.trim(),
			summary: summary.trim(),
			content: content.trim(),
			topicId: topicId || null,
			securityLevel: level,
			scopeType,
			scopeOrgIds: scopeType === "ORGANIZATION" ? scopeOrgIds : undefined,
		};
		if (isEdit && release) {
			updateRelease(release.id, patch);
			return release.id;
		}
		return createRelease(patch);
	};

	return (
		<div className="mx-auto max-w-3xl space-y-5">
			<PageHeader
				module="E2"
				title={isEdit ? "Sửa thông tin nguồn" : "Soạn thông tin nguồn"}
				description={
					isEdit
						? "Chỉnh sửa nội dung, lĩnh vực, mức bảo mật và phạm vi phát hành của bản nháp."
						: "Thông cáo, tài liệu, ảnh hoặc video gửi tới báo chí qua một kênh chính thống duy nhất."
				}
			/>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">Nội dung</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<Field label="Tiêu đề">
						<Input
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Tiêu đề thông cáo"
						/>
					</Field>
					<Field
						label="Tóm tắt"
						hint="Hiển thị đầu thông cáo, giúp phóng viên nắm nhanh nội dung.">
						<Textarea
							value={summary}
							onChange={(event) => setSummary(event.target.value)}
							rows={3}
						/>
					</Field>
					<Field label="Nội dung đầy đủ">
						<Textarea
							value={content}
							onChange={(event) => setContent(event.target.value)}
							rows={14}
							placeholder="Trình bày bối cảnh, số liệu và đề nghị đối với cơ quan báo chí..."
							className="text-sm leading-6"
						/>
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label="Lĩnh vực">
							<Select
								value={topicId}
								onValueChange={setTopicId}>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Chọn lĩnh vực" />
								</SelectTrigger>
								<SelectContent>
									{db.topics
										.filter((topic) => topic.is_active)
										.map((topic) => (
											<SelectItem
												key={topic.id}
												value={topic.id}>
												{topic.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</Field>
						<Field label="Mức bảo mật">
							<Select
								value={level}
								onValueChange={(value) =>
									setLevel(value as SecurityLevel)
								}>
								<SelectTrigger className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{(
										Object.keys(
											securityLevel,
										) as SecurityLevel[]
									).map((key) => (
										<SelectItem
											key={key}
											value={key}>
											{securityLevel[key].label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Phạm vi phát hành
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<RadioGroup
						value={scopeType}
						onValueChange={(value) =>
							setScopeType(value as SimpleScope)
						}>
						<label className="flex items-center gap-2 text-sm">
							<RadioGroupItem value="ALL" /> Toàn bộ cơ quan báo
							chí đã đăng ký
						</label>
						<label className="flex items-center gap-2 text-sm">
							<RadioGroupItem value="ORGANIZATION" /> Một số cơ
							quan báo chí cụ thể
						</label>
					</RadioGroup>
					{scopeType === "ORGANIZATION" && (
						<div className="max-w-sm max-h-64 space-y-1 overflow-y-auto rounded border p-2">
							{pressAgencies.map((org) => (
								<label
									key={org.id}
									className="hover:bg-accent flex items-center gap-2 rounded px-2 py-1.5 text-sm">
									<Checkbox
										checked={scopeOrgIds.includes(org.id)}
										onCheckedChange={(checked) =>
											setScopeOrgIds((previous) =>
												checked
													? [...previous, org.id]
													: previous.filter(
															(id) => id !== org.id,
														),
											)
										}
									/>
									<span>{org.org_name}</span>
								</label>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<AiPanel
				kind="suggest_title"
				acceptLabel="Dùng tiêu đề này"
				onAccept={(result) => {
					const firstOption = result.items?.[0]?.label;
					if (firstOption) {
						setTitle(firstOption);
						toast.success("Đã áp dụng tiêu đề gợi ý.");
					}
				}}
			/>

			<div className="flex justify-end gap-2">
				<Button
					variant="outline"
					onClick={() => navigate(isEdit && release ? `/thong-cao/${release.id}` : "/thong-cao")}>
					Hủy
				</Button>
				<Button
					variant="outline"
					disabled={!ready}
					onClick={() => {
						const id = saveDraft();
						toast.success("Đã lưu bản thảo.");
						navigate(`/thong-cao/${id}`);
					}}>
					Lưu nháp
				</Button>
				<Button
					disabled={!ready}
					onClick={() => {
						const id = saveDraft();
						submitRelease(id);
						toast.success("Đã trình lãnh đạo duyệt.");
						navigate(`/thong-cao/${id}`);
					}}>
					Lưu và trình duyệt
				</Button>
			</div>
		</div>
	);
}
