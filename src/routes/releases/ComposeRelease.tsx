import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { AiPanel } from "@/components/common/AiPanel";
import { Field } from "@/components/common/ActionDialog";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
	const createRelease = useStore((state) => state.createRelease);
	const submitRelease = useStore((state) => state.submitRelease);

	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [topicId, setTopicId] = useState("");
	const [level, setLevel] = useState<SecurityLevel>("PUBLIC");
	const [scopeType, setScopeType] = useState<SimpleScope>("ALL");
	const [scopeOrgId, setScopeOrgId] = useState("");

	const ready =
		title.trim().length > 8 &&
		content.trim().length > 40 &&
		topicId !== "" &&
		level !== null;
	const pressAgencies = db.organizations.filter(
		(org) => org.org_type === "PRESS_AGENCY",
	);

	const saveDraft = () => {
		const id = createRelease({
			title: title.trim(),
			summary: summary.trim(),
			content: content.trim(),
			topicId: topicId || null,
			securityLevel: level,
			scopeType,
			scopeOrgId:
				scopeType === "ORGANIZATION" ? scopeOrgId || null : null,
		});
		return id;
	};

	return (
		<div className="mx-auto max-w-3xl space-y-5">
			<PageHeader
				module="E2"
				title="Soạn thông tin nguồn"
				description="Thông cáo, tài liệu, ảnh hoặc video gửi tới báo chí qua một kênh chính thống duy nhất."
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
							<RadioGroupItem value="ORGANIZATION" /> Một cơ quan
							báo chí cụ thể
						</label>
					</RadioGroup>
					{scopeType === "ORGANIZATION" && (
						<Select
							value={scopeOrgId}
							onValueChange={setScopeOrgId}>
							<SelectTrigger className="w-full max-w-sm">
								<SelectValue placeholder="Chọn cơ quan báo chí" />
							</SelectTrigger>
							<SelectContent>
								{pressAgencies.map((org) => (
									<SelectItem
										key={org.id}
										value={org.id}>
										{org.org_name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
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
					onClick={() => navigate("/thong-cao")}>
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
