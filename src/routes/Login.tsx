import { useNavigate } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { initials } from '@/lib/format'
import { roleCode as roleLabels } from '@/lib/enums'
import { HOME_BY_ROLE } from '@/lib/nav'
import { useDb, useStore } from '@/mock/store'
import { orgName } from '@/mock/selectors'
import type { RoleCode } from '@/mock/types'

/**
 * Đăng nhập giả lập: chọn một trong các tài khoản mẫu để xem hệ thống dưới đúng
 * vai trò đó. Nhóm tài khoản bám theo mục III của tài liệu yêu cầu.
 */
const DEMO_ACCOUNTS: { group: string; note: string; userIds: string[] }[] = [
  {
    group: 'Sở Văn hóa, Thể thao và Du lịch',
    note: 'Đơn vị quản trị và vận hành nền tảng',
    userIds: ['u-superadmin', 'u-admin', 'u-coord'],
  },
  {
    group: 'Cơ quan phát ngôn',
    note: 'Các sở, ban, ngành cung cấp thông tin và trả lời báo chí',
    userIds: ['u-appr-yte', 'u-staff-yte'],
  },
  {
    group: 'Cơ quan báo chí và phóng viên',
    note: 'Tiếp nhận thông tin nguồn, đặt câu hỏi, tác nghiệp sự kiện',
    userIds: ['u-org-baotp', 'u-jn-01'],
  },
  {
    group: 'Vai trò chuyên biệt',
    note: 'Theo dõi điều hành, phối hợp xử lý khủng hoảng, phục vụ sự kiện',
    userIds: ['u-leader', 'u-otherdept', 'u-gate'],
  },
]

export function Login() {
  const db = useDb()
  const login = useStore((state) => state.login)
  const navigate = useNavigate()

  const signIn = (userId: string, role: RoleCode) => {
    login(userId)
    navigate(HOME_BY_ROLE[role])
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section className="bg-sidebar text-sidebar-foreground flex flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded bg-white/10 font-mono text-sm font-bold text-white">
            PN
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold text-white">Nền tảng Kết nối Báo chí</span>
            <span className="block text-xs">Phát ngôn số — Thành phố Huế</span>
          </span>
        </div>

        <div className="max-w-md space-y-5 py-10">
          <h1 className="text-3xl leading-tight font-semibold text-balance text-white">
            Một kênh chính thống duy nhất giữa cơ quan phát ngôn và báo chí.
          </h1>
          <p className="text-sm leading-6">
            Mọi tương tác đều được định danh, phân luồng, lưu vết và đo lường: từ thông tin nguồn,
            câu hỏi báo chí, giấy mời sự kiện đến kho dữ liệu truyền thông.
          </p>
          <dl className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { value: '10', label: 'phân hệ nghiệp vụ' },
              { value: '10', label: 'vai trò phân quyền' },
              { value: '3', label: 'luồng nghiệp vụ chính' },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-2xl font-semibold text-white tabular">{item.value}</dt>
                <dd className="text-xs">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="text-xs">
          Bản demo giao diện. Toàn bộ tổ chức, cá nhân và số liệu trong hệ thống là dữ liệu giả lập.
        </p>
      </section>

      <section className="flex items-center justify-center overflow-y-auto p-8">
        <div className="w-full max-w-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Chọn tài khoản để đăng nhập</h2>
            <p className="text-muted-foreground text-sm">
              Mỗi tài khoản mở ra một bộ chức năng khác nhau theo ma trận phân quyền. Bạn có thể đăng
              xuất và đổi vai trò bất cứ lúc nào.
            </p>
          </div>

          <div className="space-y-5">
            {DEMO_ACCOUNTS.map((group) => (
              <div key={group.group}>
                <div className="mb-2">
                  <p className="text-sm font-medium">{group.group}</p>
                  <p className="text-muted-foreground text-xs">{group.note}</p>
                </div>
                <div className="divide-y overflow-hidden rounded-md border bg-card">
                  {group.userIds.map((userId) => {
                    const user = db.users.find((item) => item.id === userId)
                    if (!user) return null
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => signIn(user.id, user.role)}
                        className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 px-3 py-2.5 text-left focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                            {initials(user.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{user.full_name}</span>
                          <span className="text-muted-foreground block truncate text-xs">
                            {user.job_title} · {orgName(db, user.org_id)}
                          </span>
                        </span>
                        <span className="border-primary/25 bg-primary/5 text-primary hidden shrink-0 rounded border px-2 py-0.5 text-xs font-medium sm:inline">
                          {roleLabels[user.role].label}
                        </span>
                        <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
