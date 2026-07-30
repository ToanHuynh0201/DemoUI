# Nền tảng Kết nối Báo chí — Phát ngôn số (bản demo giao diện)

Bản UI hoàn chỉnh, dữ liệu giả lập, dựng để hình dung sản phẩm cuối trước khi
xây dựng backend thật. Không có server, không có database — toàn bộ dữ liệu
nạp từ file JSON và giữ trong bộ nhớ trình duyệt (tải lại trang là quay về dữ
liệu gốc).

## Chạy thử

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`, chọn một trong các tài khoản demo để đăng nhập.

```bash
npm run build      # kiểm tra type + build production
npx tsc --noEmit   # chỉ kiểm tra kiểu dữ liệu
```

## Tài khoản demo (9 vai trò theo RBAC_Matrix.md)

| Vai trò | Tên | Đơn vị |
|---|---|---|
| Quản trị viên Sở (`ADMIN`) | Nguyễn Thị Hoài An | Sở Văn hóa, Thể thao và Du lịch |
| Điều phối viên (`COORDINATOR`) | Trần Minh Quân | Sở Văn hóa, Thể thao và Du lịch |
| Lãnh đạo duyệt (`APPROVER`) | Đặng Văn Trí | Sở Y tế |
| Cán bộ xử lý (`STAFF`) | Võ Thị Thanh Tâm | Sở Y tế |
| Cơ quan báo chí (`MEDIA_ORG`) | Nguyễn Văn Định | Báo Thành phố Huế |
| Phóng viên (`JOURNALIST`) | Lê Hoàng Nam | Báo Thành phố Huế |
| Lãnh đạo theo dõi (`LEADER`) | Nguyễn Thanh Bình | Sở Văn hóa, Thể thao và Du lịch |
| Sở/ngành phối hợp (`OTHER_DEPT`) | Trần Đại Dương | Công an thành phố Huế |
| Nhân viên cổng sự kiện (`GATE_STAFF`) | Nguyễn Văn Sáu | Sở Văn hóa, Thể thao và Du lịch |

Đăng xuất và chọn tài khoản khác để xem cùng một nghiệp vụ dưới góc nhìn vai
trò khác — dữ liệu đã thao tác được giữ nguyên trong phiên làm việc (chỉ mất
khi tải lại trang).

## Bản đồ màn hình ↔ use case

| Phân hệ | Đường dẫn chính | Ghi chú |
|---|---|---|
| E0 — Nền tảng & quản trị | `/quan-tri/*` | Tổ chức, người dùng & phân quyền, vai trò, danh mục, tích hợp, nhật ký |
| E1 — Phóng viên & CQ báo chí | `/phong-vien`, `/duyet-ho-so`, `/ho-so-cua-toi`, `/toa-soan` | |
| E2 — Thông tin nguồn | `/thong-cao`, `/thong-tin-nguon`, `/hieu-qua-khai-thac` | |
| E3+E4 — Hỏi & đáp | `/cau-hoi*`, `/dieu-phoi`, `/viec-cua-toi`, `/duyet-tra-loi` | |
| E5 — Sự kiện & tác nghiệp | `/su-kien`, `/giay-moi`, `/the-tac-nghiep`, `/check-in`, `/phong-van` | |
| E6 — Kho dữ liệu | `/kho-du-lieu`, `/quyen-truy-cap` | |
| E7 — Theo dõi & phân tích | `/theo-doi`, `/phan-tich`, `/nguon-theo-doi` | **Schema đề xuất**, xem ghi chú dưới |
| E8 — Cảnh báo & khủng hoảng | `/canh-bao`, `/nhiem-vu` | **Schema đề xuất**, xem ghi chú dưới |
| E9 — Dashboard & báo cáo | `/dashboard`, `/bao-cao` | |

## Ghi chú quan trọng cho đội phát triển

- **`src/mock/types.ts`** đánh dấu rõ 4 bảng (`monitoring_sources`,
  `media_articles`, `crisis_alerts`, `crisis_tasks`) là **đề xuất mới** —
  không có trong `DB/schema.plantuml` gốc vì phân hệ E7/E8 chưa được mô hình
  hóa ở đó. Cần đối chiếu với đội DB trước khi triển khai thật.
- **`src/lib/permissions.ts`** mã hóa `RBAC_Matrix.md` thành `ROLE_CAPABILITIES`.
  Đổi quyền ở một chỗ này, sidebar (`lib/nav.ts`) và route guard
  (`components/shell/RequireCapability.tsx`) tự động theo.
- **`src/mock/store.ts`** là toàn bộ "backend giả" — mọi hành động nghiệp vụ
  đều tự sinh `question_status_history` / `audit_logs` / `notifications`
  tương ứng. Khi nối API thật, đây là danh sách hàm cần thay bằng lời gọi
  server.
- Khi cần thay lớp mock bằng API thật: `src/mock/seed.ts` + `src/mock/store.ts`
  là ranh giới duy nhất cần thay; các route/component không import trực tiếp
  từ `data/*.json`.
