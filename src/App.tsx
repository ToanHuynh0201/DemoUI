import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/components/shell/AppShell'
import { RequireCapability } from '@/components/shell/RequireCapability'
import { HOME_BY_ROLE } from '@/lib/nav'
import { useCurrentUser } from '@/mock/store'
import { Login } from '@/routes/Login'
import { Notifications } from '@/routes/Notifications'
import { AskQuestion } from '@/routes/questions/AskQuestion'
import { MyQuestions } from '@/routes/questions/MyQuestions'
import { QuestionDetail } from '@/routes/questions/QuestionDetail'
import { QuestionsList } from '@/routes/questions/QuestionsList'
import { ApprovalQueue, CoordinatorQueue, MyTasks } from '@/routes/questions/WorkQueues'
import { ComposeRelease } from '@/routes/releases/ComposeRelease'
import { ReleaseAnalytics } from '@/routes/releases/ReleaseAnalytics'
import { ReleaseDetail } from '@/routes/releases/ReleaseDetail'
import { ReleaseFeed } from '@/routes/releases/ReleaseFeed'
import { ReleasesList } from '@/routes/releases/ReleasesList'
import { AccessRules } from '@/routes/assets/AccessRules'
import { AssetDetail } from '@/routes/assets/AssetDetail'
import { AssetLibrary } from '@/routes/assets/AssetLibrary'
import { AgencyJournalists } from '@/routes/journalists/AgencyJournalists'
import { JournalistDetail } from '@/routes/journalists/JournalistDetail'
import { JournalistsList } from '@/routes/journalists/JournalistsList'
import { MyProfile } from '@/routes/journalists/MyProfile'
import { ProfileApprovals } from '@/routes/journalists/ProfileApprovals'
import { AuditLog } from '@/routes/admin/AuditLog'
import { Catalogs } from '@/routes/admin/Catalogs'
import { Integrations } from '@/routes/admin/Integrations'
import { Organizations } from '@/routes/admin/Organizations'
import { RolesAdmin } from '@/routes/admin/RolesAdmin'
import { UsersAdmin } from '@/routes/admin/UsersAdmin'
import { CheckIn } from '@/routes/events/CheckIn'
import { ComposeEvent } from '@/routes/events/ComposeEvent'
import { EventDetail } from '@/routes/events/EventDetail'
import { EventsList } from '@/routes/events/EventsList'
import { InterviewRequests } from '@/routes/events/InterviewRequests'
import { MyBadges } from '@/routes/events/MyBadges'
import { MyInvitations } from '@/routes/events/MyInvitations'
import { MonitoringFeed } from '@/routes/monitoring/MonitoringFeed'
import { SourcesAdmin } from '@/routes/monitoring/SourcesAdmin'
import { TrendAnalysis } from '@/routes/monitoring/TrendAnalysis'
import { AlertDetail } from '@/routes/crisis/AlertDetail'
import { CrisisDashboard } from '@/routes/crisis/CrisisDashboard'
import { CrisisTasks } from '@/routes/crisis/CrisisTasks'
import { Dashboard } from '@/routes/dashboard/Dashboard'
import { Reports } from '@/routes/dashboard/Reports'

function HomeRedirect() {
  const user = useCurrentUser()
  if (!user) return <Navigate to="/dang-nhap" replace />
  return <Navigate to={HOME_BY_ROLE[user.role]} replace />
}

export function App() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<Login />} />
      <Route
        element={
          <RequireCapability capabilities={[]}>
            <AppShell />
          </RequireCapability>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route path="/thong-bao" element={<Notifications />} />

        {/* E3 · E4 — hỏi và đáp báo chí */}
        <Route
          path="/cau-hoi/moi"
          element={
            <RequireCapability capabilities={['e3.question.ask']}>
              <AskQuestion />
            </RequireCapability>
          }
        />
        <Route
          path="/cau-hoi-cua-toi"
          element={
            <RequireCapability capabilities={['e3.question.own']}>
              <MyQuestions />
            </RequireCapability>
          }
        />
        <Route
          path="/cau-hoi"
          element={
            <RequireCapability capabilities={['e3.question.viewAll']}>
              <QuestionsList />
            </RequireCapability>
          }
        />
        <Route
          path="/cau-hoi/:id"
          element={
            <RequireCapability capabilities={['e3.question.own', 'e3.question.viewAll', 'e3.question.route']}>
              <QuestionDetail />
            </RequireCapability>
          }
        />
        <Route
          path="/dieu-phoi"
          element={
            <RequireCapability capabilities={['e3.question.route']}>
              <CoordinatorQueue />
            </RequireCapability>
          }
        />
        <Route
          path="/viec-cua-toi"
          element={
            <RequireCapability capabilities={['e4.inbox.own']}>
              <MyTasks />
            </RequireCapability>
          }
        />
        <Route
          path="/duyet-tra-loi"
          element={
            <RequireCapability capabilities={['e4.answer.approve']}>
              <ApprovalQueue />
            </RequireCapability>
          }
        />

        {/* E2 — thông tin nguồn */}
        <Route
          path="/thong-cao"
          element={
            <RequireCapability capabilities={['e2.release.draft', 'e2.release.approve', 'e2.release.viewInternal']}>
              <ReleasesList />
            </RequireCapability>
          }
        />
        <Route
          path="/thong-cao/moi"
          element={
            <RequireCapability capabilities={['e2.release.draft']}>
              <ComposeRelease />
            </RequireCapability>
          }
        />
        <Route
          path="/thong-cao/:id"
          element={
            <RequireCapability
              capabilities={['e2.release.draft', 'e2.release.approve', 'e2.release.viewInternal', 'e2.release.receive']}
            >
              <ReleaseDetail />
            </RequireCapability>
          }
        />
        <Route
          path="/thong-tin-nguon"
          element={
            <RequireCapability capabilities={['e2.release.receive']}>
              <ReleaseFeed />
            </RequireCapability>
          }
        />
        <Route
          path="/hieu-qua-khai-thac"
          element={
            <RequireCapability capabilities={['e2.release.analytics']}>
              <ReleaseAnalytics />
            </RequireCapability>
          }
        />

        {/* E6 — kho dữ liệu truyền thông */}
        <Route
          path="/kho-du-lieu"
          element={
            <RequireCapability capabilities={['e6.asset.browse']}>
              <AssetLibrary />
            </RequireCapability>
          }
        />
        <Route
          path="/kho-du-lieu/:id"
          element={
            <RequireCapability capabilities={['e6.asset.browse']}>
              <AssetDetail />
            </RequireCapability>
          }
        />
        <Route
          path="/quyen-truy-cap"
          element={
            <RequireCapability capabilities={['e6.accessRule.manage']}>
              <AccessRules />
            </RequireCapability>
          }
        />

        {/* E1 — phóng viên và cơ quan báo chí */}
        <Route
          path="/phong-vien"
          element={
            <RequireCapability capabilities={['e1.journalist.viewAll']}>
              <JournalistsList />
            </RequireCapability>
          }
        />
        <Route
          path="/phong-vien/:id"
          element={
            <RequireCapability capabilities={['e1.journalist.viewAll']}>
              <JournalistDetail />
            </RequireCapability>
          }
        />
        <Route
          path="/duyet-ho-so"
          element={
            <RequireCapability capabilities={['e1.profile.approve']}>
              <ProfileApprovals />
            </RequireCapability>
          }
        />
        <Route
          path="/ho-so-cua-toi"
          element={
            <RequireCapability capabilities={['e1.profile.own']}>
              <MyProfile />
            </RequireCapability>
          }
        />
        <Route
          path="/toa-soan"
          element={
            <RequireCapability capabilities={['e1.agency.manageJournalists']}>
              <AgencyJournalists />
            </RequireCapability>
          }
        />

        {/* E0 — nền tảng và quản trị */}
        <Route
          path="/quan-tri/to-chuc"
          element={
            <RequireCapability capabilities={['e0.org.manage']}>
              <Organizations />
            </RequireCapability>
          }
        />
        <Route
          path="/quan-tri/nguoi-dung"
          element={
            <RequireCapability capabilities={['e0.user.manage']}>
              <UsersAdmin />
            </RequireCapability>
          }
        />
        <Route
          path="/quan-tri/vai-tro"
          element={
            <RequireCapability capabilities={['e0.role.manage']}>
              <RolesAdmin />
            </RequireCapability>
          }
        />
        <Route
          path="/quan-tri/danh-muc"
          element={
            <RequireCapability capabilities={['e0.catalog.manage']}>
              <Catalogs />
            </RequireCapability>
          }
        />
        <Route
          path="/quan-tri/tich-hop"
          element={
            <RequireCapability capabilities={['e0.integration.manage']}>
              <Integrations />
            </RequireCapability>
          }
        />
        <Route
          path="/quan-tri/nhat-ky"
          element={
            <RequireCapability capabilities={['e0.audit.view']}>
              <AuditLog />
            </RequireCapability>
          }
        />

        {/* E5 — sự kiện và thẻ tác nghiệp */}
        <Route
          path="/su-kien"
          element={
            <RequireCapability capabilities={['e5.event.manage', 'e5.event.viewList']}>
              <EventsList />
            </RequireCapability>
          }
        />
        <Route
          path="/su-kien/moi"
          element={
            <RequireCapability capabilities={['e5.event.manage']}>
              <ComposeEvent />
            </RequireCapability>
          }
        />
        <Route
          path="/su-kien/:id"
          element={
            <RequireCapability capabilities={['e5.event.manage', 'e5.event.viewList']}>
              <EventDetail />
            </RequireCapability>
          }
        />
        <Route
          path="/giay-moi"
          element={
            <RequireCapability capabilities={['e5.invitation.own']}>
              <MyInvitations />
            </RequireCapability>
          }
        />
        <Route
          path="/the-tac-nghiep"
          element={
            <RequireCapability capabilities={['e5.badge.own']}>
              <MyBadges />
            </RequireCapability>
          }
        />
        <Route
          path="/check-in"
          element={
            <RequireCapability capabilities={['e5.checkin.scan']}>
              <CheckIn />
            </RequireCapability>
          }
        />
        <Route
          path="/phong-van"
          element={
            <RequireCapability capabilities={['e5.interview.request', 'e5.interview.handle']}>
              <InterviewRequests />
            </RequireCapability>
          }
        />

        {/* E7 — theo dõi và phân tích truyền thông */}
        <Route
          path="/theo-doi"
          element={
            <RequireCapability capabilities={['e7.monitor.view']}>
              <MonitoringFeed />
            </RequireCapability>
          }
        />
        <Route
          path="/phan-tich"
          element={
            <RequireCapability capabilities={['e7.monitor.view']}>
              <TrendAnalysis />
            </RequireCapability>
          }
        />
        <Route
          path="/nguon-theo-doi"
          element={
            <RequireCapability capabilities={['e7.source.manage']}>
              <SourcesAdmin />
            </RequireCapability>
          }
        />

        {/* E8 — cảnh báo và xử lý khủng hoảng */}
        <Route
          path="/canh-bao"
          element={
            <RequireCapability capabilities={['e8.alert.view']}>
              <CrisisDashboard />
            </RequireCapability>
          }
        />
        <Route
          path="/canh-bao/:id"
          element={
            <RequireCapability capabilities={['e8.alert.view']}>
              <AlertDetail />
            </RequireCapability>
          }
        />
        <Route
          path="/nhiem-vu"
          element={
            <RequireCapability capabilities={['e8.task.own']}>
              <CrisisTasks />
            </RequireCapability>
          }
        />

        {/* E9 — dashboard và báo cáo */}
        <Route
          path="/dashboard"
          element={
            <RequireCapability capabilities={['e9.dashboard.view']}>
              <Dashboard />
            </RequireCapability>
          }
        />
        <Route
          path="/bao-cao"
          element={
            <RequireCapability capabilities={['e9.report.export']}>
              <Reports />
            </RequireCapability>
          }
        />
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
