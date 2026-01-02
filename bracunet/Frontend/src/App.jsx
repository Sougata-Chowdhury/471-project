


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
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
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/verification-request" element={<ProtectedRoute><VerificationRequest /></ProtectedRoute>} />
          <Route path="/my-verification-requests" element={<ProtectedRoute><MyVerificationRequests /></ProtectedRoute>} />
          <Route path="/admin/verification" element={<ProtectedRoute><AdminVerification /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute><AdminNewsModeration /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
          <Route path="/badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute><AlumniDirectory /></ProtectedRoute>} />
          <Route path="/forum" element={<ProtectedRoute><ForumList /></ProtectedRoute>} />
          <Route path="/forum/:id" element={<ProtectedRoute><ForumDetail /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
          <Route path="/groups/:id/requests" element={<ProtectedRoute><GroupRequests /></ProtectedRoute>} />
          <Route path="/groups/create" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><ResourceLibrary /></ProtectedRoute>} />
          <Route path="/resources/list" element={<ProtectedRoute><ResourceList /></ProtectedRoute>} />
          <Route path="/resources/upload" element={<ProtectedRoute><ResourceUpload /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

          <Route path="/events" element={<ProtectedRoute><EventList /></ProtectedRoute>} />
          <Route path="/events/create" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/events/edit/:id" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/events/my-rsvps" element={<ProtectedRoute><MyRsvps /></ProtectedRoute>} />
          <Route path="/events/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />

          <Route path="/news" element={<ProtectedRoute><NewsList /></ProtectedRoute>} />
          <Route
            path="/news/university-updates"
            element={
              <ProtectedRoute><NewsCategoryPage title="University Updates" category="announcement" /></ProtectedRoute>
            }
          />
          <Route
            path="/news/alumni-achievements"
            element={
              <ProtectedRoute><NewsCategoryPage title="Alumni Achievements" category="achievement" /></ProtectedRoute>
            }
          />
          <Route
            path="/news/upcoming-events"
            element={
              <ProtectedRoute><NewsCategoryPage title="Upcoming Events" category="event" /></ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/mentorship" element={<ProtectedRoute><Mentorship /></ProtectedRoute>} />
          <Route path="/mentorship/requests" element={<ProtectedRoute><MyMentorshipRequests /></ProtectedRoute>} />
          <Route path="/mentorship/incoming-requests" element={<ProtectedRoute><IncomingMentorshipRequests /></ProtectedRoute>} />
          <Route path="/mentorship/chat" element={<ProtectedRoute><MentorshipChat /></ProtectedRoute>} />
          <Route path="/mentorship/request-to-mentor" element={<ProtectedRoute><RequestMentorStatus /></ProtectedRoute>} />
          <Route path="/admin/mentor-requests" element={<ProtectedRoute><AdminMentorRequests /></ProtectedRoute>} />
          
          {/* Donation Routes */}
          <Route path="/donations" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} />
          <Route path="/donations/create" element={<ProtectedRoute><CreateCampaignPage /></ProtectedRoute>} />
          <Route path="/donations/campaign/:id" element={<ProtectedRoute><CampaignDetailPage /></ProtectedRoute>} />
          <Route path="/donations/success" element={<ProtectedRoute><DonationSuccessPage /></ProtectedRoute>} />
          <Route path="/donations/my-donations" element={<ProtectedRoute><MyDonationsPage /></ProtectedRoute>} />
          <Route path="/donations/my-campaigns" element={<ProtectedRoute><MyCampaignsPage /></ProtectedRoute>} />

          {/* Career Hub */}
          <Route path="/career" element={<ProtectedRoute><CareerHub /></ProtectedRoute>} />

          {/* Interest Groups */}
          <Route path="/interest-groups" element={<ProtectedRoute><InterestGroups /></ProtectedRoute>} />
          <Route path="/interest-groups/create" element={<ProtectedRoute><CreateInterestGroup /></ProtectedRoute>} />
          <Route path="/interest-groups/my-groups" element={<ProtectedRoute><MyInterestGroups /></ProtectedRoute>} />
          <Route path="/interest-groups/:groupId" element={<ProtectedRoute><InterestGroupDetail /></ProtectedRoute>} />
          <Route path="/interest-groups/:groupId/chat" element={<ProtectedRoute><InterestGroupChat /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
