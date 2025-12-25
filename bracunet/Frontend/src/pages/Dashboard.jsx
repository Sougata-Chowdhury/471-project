




import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../components/NotificationBell';
import { io } from 'socket.io-client';
import config from '../config';

export const Dashboard = () => {
  const { user, logout, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
    }
  }, [user, getCurrentUser, navigate]);

  useEffect(() => {
    if (!user) return;

    // Connect to Socket.io for real-time verification status updates
    const socket = io(config.socketUrl);

    // Join user's personal room for verification updates
    socket.emit('joinUserRoom', { userId: user._id || user.id });

    socket.on('verification_status', (data) => {
      console.log('🔔 Real-time: Verification status update:', data);
      if (data.verified) {
        // Refresh user data to show new verification status
        getCurrentUser();
        // Show success notification
        alert(`🎉 Congratulations! Your account has been verified as ${data.role}.`);
      } else if (data.status === 'rejected') {
        getCurrentUser();
        alert(`❌ ${data.reason}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, getCurrentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const roleConfig = {
    student: {
      title: 'Student Dashboard',
      color: 'blue',
      features: ['View Announcements', 'Connect with Alumni', 'Join Events'],
    },
    alumni: {
      title: 'Alumni Dashboard',
      color: 'purple',
      features: ['Update Profile', 'Mentor Students', 'Job Board', 'Alumni Events'],
    },
    faculty: {
      title: 'Faculty Dashboard',
      color: 'green',
      features: ['Manage Classes', 'View Students', 'Announcements', 'Research Collaboration'],
    },
    admin: {
      title: 'Admin Dashboard',
      color: 'red',
      features: ['Manage Users', 'Verification Requests', 'System Settings', 'Reports'],
    },
  };

  const config = roleConfig[user.role] || roleConfig.student;

  const getVerificationBadge = () => {
    if (user.isVerified) {
      return (
        <span className="px-3 py-1 rounded bg-green-500 text-white text-sm font-semibold">
          ✓ Verified
        </span>
      );
    }
    if (user.verificationStatus === 'pending') {
      return (
        <span className="px-3 py-1 rounded bg-yellow-500 text-white text-sm font-semibold">
          ⏳ Pending Verification
        </span>
      );
    }
    if (user.verificationStatus === 'rejected') {
      return (
        <span className="px-3 py-1 rounded bg-red-500 text-white text-sm font-semibold">
          ✗ Verification Rejected
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Improved Navigation Bar */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
              <span className="hidden sm:inline-block text-gray-400">|</span>
              <span className="hidden sm:inline-block text-sm text-gray-600">{user.name}</span>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Bell */}
              <NotificationBell />

              {/* Verification Badge */}
              {getVerificationBadge()}

              {/* Role Badge */}
              <span
                className={`hidden sm:inline-flex px-3 py-1 rounded-full text-white text-xs font-semibold bg-${config.color}-500`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>

              {/* Settings Dropdown for non-admins */}
              {user.role !== 'admin' && (
                <div className="relative group">
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition text-gray-700"
                    title="Settings"
                  >
                    ⚙️
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <button
                      onClick={() => navigate('/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={() => navigate('/settings/notifications')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Notifications
                    </button>
                  </div>
                </div>
              )}

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-white/90 text-lg">Welcome back, {user.name}!</p>
        </div>

        {/* Verification Alerts */}
        {!user.isVerified && user.verificationStatus !== 'pending' && user.role !== 'admin' && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mb-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔒</span>
                <div>
                  <h3 className="font-bold text-blue-800 text-lg">Get Verified to Access Full Features</h3>
                  <p className="text-blue-700 text-sm">Submit your verification information to unlock all platform features</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/verification-request')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Request Verification
              </button>
            </div>
          </div>
        )}

        {user.verificationStatus === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mb-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⏳</span>
                <div>
                  <h3 className="font-bold text-yellow-800 text-lg">Verification Pending</h3>
                  <p className="text-yellow-700 text-sm">Your verification request is being reviewed by an administrator. You'll be notified once it's processed.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/my-verification-requests')}
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                View Status
              </button>
            </div>
          </div>
        )}

        {user.verificationStatus === 'rejected' && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">❌</span>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">Verification Request Rejected</h3>
                  <p className="text-red-700 text-sm">Your verification request was not approved. Please submit a new request with correct information.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/verification-request')}
                className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Resubmit Request
              </button>
            </div>
          </div>
        )}

        {user.role === 'admin' && (
          <div className="bg-purple-50 border-l-4 border-purple-500 p-5 mb-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👨‍💼</span>
                <div>
                  <h3 className="font-bold text-purple-800 text-lg">Admin Panel</h3>
                  <p className="text-purple-700 text-sm">Manage verification requests and moderate news posts</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate('/admin/verification')}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Verifications
                </button>
                <button
                  onClick={() => navigate('/admin/news')}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  News
                </button>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Reports
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feature Grid + Discussion Forum */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {/* Quick Access Cards - Prominent Features */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-blue-500"
            onClick={() => navigate('/news')}
          >
            <div className="text-3xl mb-3">📰</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Newsfeed</h3>
            <p className="text-gray-600 text-sm">Latest announcements and updates</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-indigo-500"
            onClick={() => navigate('/interest-groups')}
          >
            <div className="text-3xl mb-3">👥</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Interest Groups</h3>
            <p className="text-gray-600 text-sm">Join communities & discussions</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-cyan-500"
            onClick={() => navigate('/mentorship')}
          >
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Mentorship</h3>
            <p className="text-gray-600 text-sm">Connect with mentors</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-pink-500"
            onClick={() => navigate('/events')}
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Events</h3>
            <p className="text-gray-600 text-sm">Meetups, webinars & reunions</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-green-500"
            onClick={() => navigate('/resources')}
          >
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Resources</h3>
            <p className="text-gray-600 text-sm">Study materials & guides</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-purple-500"
            onClick={() => navigate('/career')}
          >
            <div className="text-3xl mb-3">💼</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Career Hub</h3>
            <p className="text-gray-600 text-sm">Jobs & recommendations</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-rose-500"
            onClick={() => navigate('/donations')}
          >
            <div className="text-3xl mb-3">💝</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Fundraising</h3>
            <p className="text-gray-600 text-sm">Support causes & campaigns</p>
          </div>

          <div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border-l-4 border-yellow-500"
            onClick={() => navigate('/directory')}
          >
            <div className="text-3xl mb-3">📖</div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">Directory</h3>
            <p className="text-gray-600 text-sm">Browse alumni network</p>
          </div>
        </div>

        {/* Secondary Features - Gamification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/badges')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏆</div>
              <div>
                <h3 className="font-bold text-white text-lg">Badges</h3>
                <p className="text-white/90 text-sm">View your achievements</p>
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/leaderboard')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">🏅</div>
              <div>
                <h3 className="font-bold text-white text-lg">Leaderboard</h3>
                <p className="text-white/90 text-sm">Check your ranking</p>
              </div>
            </div>
          </div>

          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate('/mentorship/chat')}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">💬</div>
              <div>
                <h3 className="font-bold text-white text-lg">Messages</h3>
                <p className="text-white/90 text-sm">Mentorship conversations</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Information */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">User Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">Name</p>
              <p className="text-white font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Email</p>
              <p className="text-white font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Role</p>
              <p className="text-white font-semibold capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">Member Since</p>
              <p className="text-white font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

