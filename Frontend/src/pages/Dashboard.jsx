import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
    }
  }, [user, getCurrentUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const roleConfig = {
    student: {
      title: 'Student Dashboard',
      color: 'blue',
      features: ['View Announcements', 'Connect with Alumni', 'Join Events', 'Find Mentors'],
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
      features: ['Manage Users', 'System Settings', 'Reports', 'Content Moderation'],
    },
  };

  const config = roleConfig[user.role] || roleConfig.student;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
            <span
              className={`px-3 py-1 rounded text-white text-sm font-semibold bg-${config.color}-500`}
            >
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">{config.title}</h2>
          <p className="text-gray-600">Welcome, {user.name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {config.features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer border-t-4 border-${config.color}-500`}
            >
              <h3 className="font-bold text-gray-800 text-lg">{feature}</h3>
              <p className="text-gray-600 text-sm mt-2">Explore {feature.toLowerCase()}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">User Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="text-gray-800 font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="text-gray-800 font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Role</p>
              <p className="text-gray-800 font-semibold capitalize">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Member Since</p>
              <p className="text-gray-800 font-semibold">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
