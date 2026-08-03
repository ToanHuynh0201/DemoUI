# Nền tảng Kết nối Báo chí — Phát ngôn số (bản demo giao diện)

Bản UI hoàn chỉnh, dữ liệu giả lập, dựng để hình dung sản phẩm cuối trước khi
xây dựng backend thật. Không có server, không có database — toàn bộ dữ liệu
nạp từ file JSON và giữ trong bộ nhớ trình duyệt (tải lại trang là quay về dữ
liệu gốc).

Bản demo này chỉ tập trung vào **3 luồng nghiệp vụ chính** theo mục V tài liệu
yêu cầu (`YeuCau_NenTangKetNoiBaoChi-TruyenThong.md`); các phân hệ khác (quản
trị, hồ sơ phóng viên, kho dữ liệu, theo dõi & phân tích, cảnh báo khủng
hoảng, dashboard & báo cáo) đã được lược bỏ để demo gọn, dễ trình bày. Không
còn màn hình đăng nhập hay phân quyền theo vai trò — mở ứng dụng là vào thẳng
với một tài khoản "superadmin" duy nhất, thao tác được mọi bước của cả 3
luồng.

## Chạy thử

### Local (cần Node 22+)

```bash
npm install
npm run dev
```

Mở `http://localhost:5173` — vào thẳng ứng dụng, không cần đăng nhập.

```bash
npm run build      # kiểm tra type + build production
npx tsc --noEmit   # chỉ kiểm tra kiểu dữ liệu
```

### Docker (dev, hot-reload)

Không cần cài Node trên máy, chỉ cần Docker.

```bash
docker compose up
```

Windows Git Bash — cần `MSYS_NO_PATHCONV=1 docker compose up`, nếu không
Git Bash tự convert sai đường dẫn `/app` (VD: thành `C:\Program Files\Git\app`)
và mount lệch chỗ. cmd/PowerShell không bị lỗi này, chạy lệnh gốc bình thường.

Không có Docker Compose thì dùng thẳng `docker`:

```bash
docker build -t webapp-dev .
docker run --rm -p 5173:5173 -v "$(pwd):/app" -v /app/node_modules webapp-dev
```

Mở `http://localhost:5173`. Sửa code ngoài host, container tự reload (Vite dev
server dùng polling để bắt thay đổi qua bind mount, xem `vite.config.ts`).

## Bản đồ màn hình ↔ use case

| Luồng | Đường dẫn chính | Ghi chú |
|---|---|---|
| Luồng 1 — Cung cấp thông tin nguồn (E2) | `/thong-cao`, `/thong-tin-nguon`, `/hieu-qua-khai-thac` | |
| Luồng 2 — Báo chí đặt câu hỏi (E3+E4) | `/cau-hoi*`, `/dieu-phoi`, `/viec-cua-toi`, `/duyet-tra-loi` | |
| Luồng 3 — Sự kiện báo chí (E5) | `/su-kien`, `/giay-moi`, `/the-tac-nghiep`, `/check-in`, `/phong-van` | |

## Ghi chú quan trọng cho đội phát triển

- **`src/mock/store.ts`** là toàn bộ "backend giả" — mọi hành động nghiệp vụ
  đều tự sinh `question_status_history` / `audit_logs` / `notifications`
  tương ứng. Khi nối API thật, đây là danh sách hàm cần thay bằng lời gọi
  server.
- Không còn phân quyền theo vai trò (`lib/permissions.ts`, `RequireCapability`
  đã xóa) — mọi hành động trên giao diện đều khả dụng cho tài khoản demo duy
  nhất (`u-superadmin`). Khi nối backend thật, đây là chỗ cần bổ sung lại lớp
  kiểm soát quyền theo `RBAC_Matrix.md`.
- Khi cần thay lớp mock bằng API thật: `src/mock/seed.ts` + `src/mock/store.ts`
  là ranh giới duy nhất cần thay; các route/component không import trực tiếp
  từ `data/*.json`.
