


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
import ResourceLibrary from './pages/ResourceLibrary';
import ResourceList from './pages/ResourceList';
import ResourceUpload from './pages/ResourceUpload';
import Messages from './pages/Messages';
import AdminNewsModeration from './pages/AdminNewsModeration';
import './index.css';


function App() {

  return (
    <Router>
      <AuthProvider>
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
          <Route path="/settings" element={<Settings />} />
          <Route path="/badges" element={<Badges />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/directory" element={<AlumniDirectory />} />
          <Route path="/forum" element={<ForumList />} />
          <Route path="/forum/:id" element={<ForumDetail />} />
          <Route path="/groups/create" element={<CreateGroup />} />
          <Route path="/resources" element={<ResourceLibrary />} />
          <Route path="/resources/list" element={<ResourceList />} />
          <Route path="/resources/upload" element={<ResourceUpload />} />
          <Route path="/messages" element={<Messages />} />

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
        </Routes>
      </AuthProvider>
    </Router>
  );
}
