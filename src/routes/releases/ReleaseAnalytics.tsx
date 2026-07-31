import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { SimpleBarChart } from "@/components/common/SimpleBarChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatNumber } from "@/lib/format";
import type { AccessAction } from "@/mock/types";
import { useCurrentUser, useDb } from "@/mock/store";
import { orgName, topicName } from "@/mock/selectors";

const ALL = "__all__";

/** E2 — hiệu quả khai thác: lượt xem/tải theo cơ quan báo chí và theo thông cáo. */
export function ReleaseAnalytics() {
	const db = useDb();
	const user = useCurrentUser();

	const [dateFrom, setDateFrom] = useState("");
	const [dateTo, setDateTo] = useState("");
	const [orgFilter, setOrgFilter] = useState(ALL);
	const [actionFilter, setActionFilter] = useState<"ALL" | AccessAction>(
		"ALL",
	);
	const [topicFilter, setTopicFilter] = useState(ALL);
	const [search, setSearch] = useState("");

	const hasFilters =
		dateFrom ||
		dateTo ||
		orgFilter !== ALL ||
		actionFilter !== "ALL" ||
		topicFilter !== ALL ||
		search.trim();

	function clearFilters() {
		setDateFrom("");
		setDateTo("");
		setOrgFilter(ALL);
		setActionFilter("ALL");
		setTopicFilter(ALL);
		setSearch("");
	}

	const scoped = useMemo(() => {
		const keyword = search.trim().toLowerCase();
		const releaseIds = new Set(
			db.press_releases
				.filter(
					(release) =>
						(user?.role === "ADMIN" ||
							user?.role === "SUPERADMIN" ||
							release.publishing_org_id === user?.org_id) &&
						(topicFilter === ALL ||
							release.topic_id === topicFilter) &&
						(!keyword ||
							release.title.toLowerCase().includes(keyword)),
				)
				.map((release) => release.id),
		);
		return db.release_accesses.filter(
			(access) =>
				releaseIds.has(access.release_id) &&
				(orgFilter === ALL || access.org_id === orgFilter) &&
				(actionFilter === "ALL" || access.action === actionFilter) &&
				(!dateFrom || access.occurred_at.slice(0, 10) >= dateFrom) &&
				(!dateTo || access.occurred_at.slice(0, 10) <= dateTo),
		);
	}, [
		db,
		user,
		orgFilter,
		actionFilter,
		topicFilter,
		search,
		dateFrom,
		dateTo,
	]);

	const byAgency = useMemo(() => {
		const counts = new Map<string, number>();
		scoped.forEach((access) => {
			const key = orgName(db, access.org_id);
			counts.set(key, (counts.get(key) ?? 0) + 1);
		});
		return Array.from(counts, ([label, value]) => ({ label, value })).sort(
			(left, right) => right.value - left.value,
		);
	}, [db, scoped]);

	const byRelease = useMemo(() => {
		const counts = new Map<
			string,
			{ title: string; views: number; downloads: number }
		>();
		scoped.forEach((access) => {
			const release = db.press_releases.find(
				(item) => item.id === access.release_id,
			);
			if (!release) return;
			const entry = counts.get(release.id) ?? {
				title: release.title,
				views: 0,
				downloads: 0,
			};
			if (access.action === "VIEW") entry.views += 1;
			else entry.downloads += 1;
			counts.set(release.id, entry);
		});
		return Array.from(counts.values()).sort(
			(left, right) =>
				right.views + right.downloads - (left.views + left.downloads),
		);
	}, [db, scoped]);

	const totalViews = scoped.filter((item) => item.action === "VIEW").length;
	const totalDownloads = scoped.filter(
		(item) => item.action === "DOWNLOAD",
	).length;

	return (
		<div className="space-y-5">
			<PageHeader
				module="E2"
				title="Hiệu quả khai thác thông tin nguồn"
				description="Đo lường lượt tiếp cận và tái khai thác thông cáo đã phát hành."
			/>

			<Card>
				<CardContent className="flex flex-col gap-3 py-4">
					{/* Hàng 1: Các bộ lọc chiếm tràn chiều ngang */}
					<div className="flex flex-wrap items-center gap-2 w-full">
						{/* Nhóm khoảng ngày */}
						<div className="flex flex-1 items-center gap-2 min-w-[420px]">
							<Input
								type="date"
								value={dateFrom}
								onChange={(event) =>
									setDateFrom(event.target.value)
								}
								className="h-9 flex-1 bg-card"
								aria-label="Từ ngày"
							/>
							<span className="text-muted-foreground text-sm shrink-0">
								đến
							</span>
							<Input
								type="date"
								value={dateTo}
								onChange={(event) =>
									setDateTo(event.target.value)
								}
								className="h-9 flex-1 bg-card"
								aria-label="Đến ngày"
							/>
						</div>

						{/* Filter Hành động */}
						<Select
							value={actionFilter}
							onValueChange={(value) =>
								setActionFilter(value as "ALL" | AccessAction)
							}>
							<SelectTrigger className="h-9 flex-1 min-w-[140px] bg-card">
								<SelectValue placeholder="Hành động" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ALL">
									Hành động: tất cả
								</SelectItem>
								<SelectItem value="VIEW">Lượt xem</SelectItem>
								<SelectItem value="DOWNLOAD">
									Lượt tải
								</SelectItem>
							</SelectContent>
						</Select>

						{/* Filter Chủ đề */}
						<Select
							value={topicFilter}
							onValueChange={setTopicFilter}>
							<SelectTrigger className="h-9 flex-1 min-w-[150px] bg-card">
								<SelectValue placeholder="Chủ đề" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={ALL}>
									Chủ đề: tất cả
								</SelectItem>
								{db.topics.map((topic) => (
									<SelectItem
										key={topic.id}
										value={topic.id}>
										{topicName(db, topic.id)}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						{/* Nút Xóa lọc */}
						{hasFilters && (
							<Button
								variant="outline"
								size="sm"
								className="h-9 shrink-0"
								onClick={clearFilters}>
								<X className="size-4" />
								Xóa lọc
							</Button>
						)}
					</div>

					{/* Hàng 2: Ô tìm kiếm ở dưới chiếm 100% chiều ngang */}
					<div className="relative w-full">
						<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
						<Input
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Tìm theo tiêu đề thông cáo..."
							className="h-9 w-full bg-card pl-8"
						/>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-4 sm:grid-cols-3">
				{[
					{ label: "Tổng lượt xem", value: totalViews },
					{ label: "Tổng lượt tải", value: totalDownloads },
					{
						label: "Cơ quan báo chí đã tiếp cận",
						value: byAgency.length,
					},
				].map((stat) => (
					<Card key={stat.label}>
						<CardContent className="py-5">
							<p className="text-muted-foreground text-xs">
								{stat.label}
							</p>
							<p className="mt-1 font-mono text-2xl font-semibold tabular">
								{formatNumber(stat.value)}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Lượt tiếp cận theo cơ quan báo chí
					</CardTitle>
				</CardHeader>
				<CardContent>
					{byAgency.length === 0 ? (
						<p className="text-muted-foreground py-8 text-center text-sm">
							Chưa có dữ liệu truy cập.
						</p>
					) : (
						<SimpleBarChart
							data={byAgency}
							valueLabel="Lượt truy cập"
						/>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						Chi tiết theo thông cáo
					</CardTitle>
				</CardHeader>
				<CardContent>
					{byRelease.length === 0 ? (
						<p className="text-muted-foreground py-8 text-center text-sm">
							Không có thông cáo nào khớp bộ lọc.
						</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-muted-foreground border-b text-left text-xs">
										<th className="pb-2 font-medium">
											Thông cáo
										</th>
										<th className="pb-2 text-right font-medium">
											Lượt xem
										</th>
										<th className="pb-2 text-right font-medium">
											Lượt tải
										</th>
									</tr>
								</thead>
								<tbody>
									{byRelease.map((item) => (
										<tr
											key={item.title}
											className="border-b last:border-0">
											<td className="max-w-md truncate py-2 pr-3">
												{item.title}
											</td>
											<td className="py-2 text-right font-mono tabular">
												{formatNumber(item.views)}
											</td>
											<td className="py-2 text-right font-mono tabular">
												{formatNumber(item.downloads)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
