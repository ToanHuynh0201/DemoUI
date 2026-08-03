import { QRCodeSVG } from "qrcode.react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { badgeStatus } from "@/lib/enums";
import { formatDateTime } from "@/lib/format";
import { useCurrentUser, useDb } from "@/mock/store";
import { orgName, profileOfUser } from "@/mock/selectors";
import type { EventItem, PressBadge } from "@/mock/types";

function TabLabel({ children, count }: { children: React.ReactNode; count: number }) {
	return (
		<>
			{children}
			<span className="bg-muted text-muted-foreground rounded px-1.5 text-xs font-medium tabular">{count}</span>
		</>
	);
}

function BadgeGrid({
	items,
	emptyDescription,
}: {
	items: { badge: PressBadge; event: EventItem }[];
	emptyDescription: string;
}) {
	const db = useDb();

	if (items.length === 0) {
		return (
			<div className="bg-card rounded-md border">
				<EmptyState
					title="Bạn chưa có thẻ tác nghiệp nào"
					description={emptyDescription}
				/>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{items.map(({ badge, event }) => (
				<Card
					key={badge.id}
					className="border-primary/20 overflow-hidden">
					<div className="bg-sidebar text-sidebar-foreground px-4 py-2 text-xs font-medium">
						THẺ TÁC NGHIỆP ĐIỆN TỬ ·{" "}
						{orgName(db, event.org_id)}
					</div>
					<CardContent className="flex flex-col items-center gap-3 py-5">
						<p className="text-center text-sm font-semibold">
							{event.event_name}
						</p>
						<div className="rounded border bg-white p-2">
							<QRCodeSVG
								value={badge.qr_code}
								size={140}
							/>
						</div>
						<p className="font-mono text-xs tabular">
							{badge.qr_code}
						</p>
						<StatusBadge meta={badgeStatus[badge.status]} />
						<p className="text-muted-foreground text-center text-xs">
							Hiệu lực {formatDateTime(badge.valid_from)}{" "}
							— {formatDateTime(badge.valid_to)}
						</p>
					</CardContent>
				</Card>
			))}
		</div>
	);
}

/** E5 — thẻ tác nghiệp điện tử của phóng viên, dạng thẻ đứng để đưa máy quét. */
export function MyBadges() {
	const db = useDb();
	const user = useCurrentUser();
	const profile = profileOfUser(db, user?.id);
	const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

	const badges = db.press_badges
		.filter(
			(item) => isAdmin || item.journalist_profile_id === profile?.id,
		)
		.map((badge) => ({
			badge,
			event: db.events.find((event) => event.id === badge.event_id),
		}))
		.filter(
			(
				item,
			): item is {
				badge: typeof item.badge;
				event: NonNullable<typeof item.event>;
			} => Boolean(item.event),
		)
		.sort((left, right) =>
			right.badge.issued_at.localeCompare(left.badge.issued_at),
		);

	const valid = badges.filter(({ badge }) => badge.status === "VALID");
	const invalid = badges.filter(({ badge }) => badge.status !== "VALID");

	return (
		<div className="space-y-5">
			<PageHeader
				module="E5"
				title="Thẻ tác nghiệp điện tử"
				description="Xuất trình mã QR tại cổng sự kiện để check-in."
			/>

			<Tabs defaultValue="all">
				<TabsList variant="line">
					<TabsTrigger value="all">
						<TabLabel count={badges.length}>Tất cả</TabLabel>
					</TabsTrigger>
					<TabsTrigger value="valid">
						<TabLabel count={valid.length}>Còn hiệu lực</TabLabel>
					</TabsTrigger>
					<TabsTrigger value="invalid">
						<TabLabel count={invalid.length}>Hết hiệu lực</TabLabel>
					</TabsTrigger>
				</TabsList>
				<TabsContent value="all">
					<BadgeGrid items={badges} emptyDescription="Xác nhận tham dự sự kiện để nhận thẻ." />
				</TabsContent>
				<TabsContent value="valid">
					<BadgeGrid items={valid} emptyDescription="Không có thẻ nào đang còn hiệu lực." />
				</TabsContent>
				<TabsContent value="invalid">
					<BadgeGrid items={invalid} emptyDescription="Không có thẻ nào đã hết hiệu lực." />
				</TabsContent>
			</Tabs>
		</div>
	);
}
