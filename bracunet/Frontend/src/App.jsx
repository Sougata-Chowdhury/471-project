


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import VerificationRequest from './pages/VerificationRequest';
import { AdminVerification } from './pages/AdminVerification';
import AdminUsers from './pages/AdminUsers';
import { MyVerificationRequests } from './pages/MyVerificationRequests';
import NewsCategoryPage from "./pages/NewsCategoryPage";
import NewsList from "./pages/NewsList";
import { Settings } from './pages/Settings';
import { Badges } from './pages/Badges';
import { Leaderboard } from './pages/Leaderboard';
import { AlumniDirectory } from './pages/AlumniDirectory';
import ForumList from './pages/ForumList';
import ForumDetail from './pages/ForumDetail';
import { CreateGroup } from './pages/CreateGroup';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import ResourceLibrary from './pages/ResourceLibrary';
import ResourceList from './pages/ResourceList';
import ResourceUpload from './pages/ResourceUpload';
import GroupRequests from './pages/GroupRequests';
import Messages from './pages/Messages';
import AdminNewsModeration from './pages/AdminNewsModeration';
import EventList from './pages/EventList';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import MyRsvps from './pages/MyRsvps';
import Mentorship from './pages/Mentorship';
import MyMentorshipRequests from './pages/MyMentorshipRequests';
import MentorshipChat from './pages/MentorshipChat';
import IncomingMentorshipRequests from './pages/IncomingMentorshipRequests';
import RequestMentorStatus from './pages/RequestMentorStatus';
import AdminMentorRequests from './pages/AdminMentorRequests';
import { DonationsPage } from './pages/DonationsPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { DonationSuccessPage } from './pages/DonationSuccessPage';
import { MyDonationsPage } from './pages/MyDonationsPage';
import { MyCampaignsPage } from './pages/MyCampaignsPage';
import CareerHub from './pages/CareerHub';
import AdminDashboard from './pages/AdminDashboard';
import NotificationSettings from './pages/NotificationSettings';
import InterestGroups from './pages/InterestGroups';
import CreateInterestGroup from './pages/CreateInterestGroup';
import InterestGroupDetail from './pages/InterestGroupDetail';
import InterestGroupChat from './pages/InterestGroupChat';
import MyInterestGroups from './pages/MyInterestGroups';
import GlobalCallManager from './components/GlobalCallManager';

function App() {

  return (
    <Router>
      <AuthProvider>
        <GlobalCallManager />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verification-request" element={<VerificationRequest />} />
          <Route path="/my-verification-requests" element={<MyVerificationRequests />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/news" element={<AdminNewsModeration />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/notifications" element={<NotificationSettings />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/forum" element={<ForumList />} />
          <Route path="/forum/:id" element={<ForumDetail />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/groups/:id/requests" element={<GroupRequests />} />
          <Route path="/groups/create" element={<CreateGroup />} />
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route path="/resources/list" element={<ResourceList />} />
          <Route path="/resources/upload" element={<ResourceUpload />} />
          <Route path="/messages" element={<Messages />} />

          <Route path="/events" element={<EventList />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/events/edit/:id" element={<CreateEvent />} />
          <Route path="/events/my-rsvps" element={<MyRsvps />} />
          <Route path="/events/:id" element={<EventDetail />} />

          <Route path="/news" element={<NewsList />} />
          <Route
            path="/news/university-updates"
            element={
              <NewsCategoryPage title="University Updates" category="announcement" />
            }
          />
          <Route
            path="/news/alumni-achievements"
            element={
              <NewsCategoryPage title="Alumni Achievements" category="achievement" />
            }
          />
          <Route
            path="/news/upcoming-events"
            element={
              <NewsCategoryPage title="Upcoming Events" category="event" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/mentorship/requests" element={<MyMentorshipRequests />} />
          <Route path="/mentorship/incoming-requests" element={<IncomingMentorshipRequests />} />
          <Route path="/mentorship/chat" element={<MentorshipChat />} />
          <Route path="/mentorship/request-to-mentor" element={<RequestMentorStatus />} />
          <Route path="/admin/mentor-requests" element={<AdminMentorRequests />} />
          
          {/* Donation Routes */}
          <Route path="/donations" element={<DonationsPage />} />
          <Route path="/donations/create" element={<CreateCampaignPage />} />
          <Route path="/donations/campaign/:id" element={<CampaignDetailPage />} />
          <Route path="/donations/success" element={<DonationSuccessPage />} />
          <Route path="/donations/my-donations" element={<MyDonationsPage />} />
          <Route path="/donations/my-campaigns" element={<MyCampaignsPage />} />

          {/* Career Hub */}
          <Route path="/career" element={<CareerHub />} />

          {/* Interest Groups */}
          <Route path="/interest-groups" element={<InterestGroups />} />
          <Route path="/interest-groups/create" element={<CreateInterestGroup />} />
          <Route path="/interest-groups/my-groups" element={<MyInterestGroups />} />
          <Route path="/interest-groups/:groupId" element={<InterestGroupDetail />} />
          <Route path="/interest-groups/:groupId/chat" element={<InterestGroupChat />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
