import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from '@/components/shell/AppShell'
import { DEFAULT_HOME } from '@/lib/nav'
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
import { CheckIn } from '@/routes/events/CheckIn'
import { ComposeEvent } from '@/routes/events/ComposeEvent'
import { EventDetail } from '@/routes/events/EventDetail'
import { EventsList } from '@/routes/events/EventsList'
import { InterviewRequests } from '@/routes/events/InterviewRequests'
import { MyBadges } from '@/routes/events/MyBadges'
import { MyInvitations } from '@/routes/events/MyInvitations'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={DEFAULT_HOME} replace />} />
        <Route path="/thong-bao" element={<Notifications />} />

        {/* E3 · E4 — hỏi và đáp báo chí */}
        <Route path="/cau-hoi/moi" element={<AskQuestion />} />
        <Route path="/cau-hoi-cua-toi" element={<MyQuestions />} />
        <Route path="/cau-hoi" element={<QuestionsList />} />
        <Route path="/cau-hoi/:id" element={<QuestionDetail />} />
        <Route path="/dieu-phoi" element={<CoordinatorQueue />} />
        <Route path="/viec-cua-toi" element={<MyTasks />} />
        <Route path="/duyet-tra-loi" element={<ApprovalQueue />} />

        {/* E2 — thông tin nguồn */}
        <Route path="/thong-cao" element={<ReleasesList />} />
        <Route path="/thong-cao/moi" element={<ComposeRelease />} />
        <Route path="/thong-cao/:id" element={<ReleaseDetail />} />
        <Route path="/thong-tin-nguon" element={<ReleaseFeed />} />
        <Route path="/hieu-qua-khai-thac" element={<ReleaseAnalytics />} />

        {/* E5 — sự kiện và thẻ tác nghiệp */}
        <Route path="/su-kien" element={<EventsList />} />
        <Route path="/su-kien/moi" element={<ComposeEvent />} />
        <Route path="/su-kien/:id" element={<EventDetail />} />
        <Route path="/giay-moi" element={<MyInvitations />} />
        <Route path="/the-tac-nghiep" element={<MyBadges />} />
        <Route path="/check-in" element={<CheckIn />} />
        <Route path="/phong-van" element={<InterviewRequests />} />
      </Route>
      <Route path="*" element={<Navigate to={DEFAULT_HOME} replace />} />
    </Routes>
  )
}
