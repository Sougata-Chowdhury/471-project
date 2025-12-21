import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [donationStats, setDonationStats] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      console.log('Fetching analytics from:', `${API_BASE}/api/analytics`);
      console.log('Token:', token ? 'Present' : 'Missing');

      const [users, events, donations] = await Promise.all([
        axios.get(`${API_BASE}/api/analytics/users`, config).catch(err => {
          console.error('Users API error:', err.response?.data || err.message);
          return { data: null };
        }),
        axios.get(`${API_BASE}/api/analytics/events`, config).catch(err => {
          console.error('Events API error:', err.response?.data || err.message);
          return { data: null };
        }),
        axios.get(`${API_BASE}/api/analytics/donations`, config).catch(err => {
          console.error('Donations API error:', err.response?.data || err.message);
          return { data: null };
        })
      ]);

      console.log('Users data:', users.data);
      console.log('Events data:', events.data);
      console.log('Donations data:', donations.data);

      setUserStats(users.data);
      setEventStats(events.data);
      setDonationStats(donations.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      alert('Failed to fetch analytics. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading Analytics...</div>
      </div>
    );
  }

  // Prepare data for charts
  const roleData = userStats?.usersByRole ? Object.entries(userStats.usersByRole).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count
  })) : [];

  const eventMonthData = eventStats?.eventsByMonth?.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    events: item.count,
    registrations: item.registrations
  })) || [];

  const donationMonthData = donationStats?.donationsByMonth?.map(item => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    donations: item.count,
    amount: item.totalRaised
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-blue-600">{userStats?.totalUsers || 0}</p>
                <p className="text-xs text-gray-500 mt-1">+{userStats?.newUsers || 0} this month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-green-600">{eventStats?.totalEvents || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{eventStats?.upcomingEvents || 0} upcoming</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Donations</p>
                <p className="text-3xl font-bold text-orange-600">{donationStats?.totalDonations || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{donationStats?.completedDonations || 0} completed</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Users by Role</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Event Participation Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Event Participation (6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={eventMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="events" stroke="#10b981" name="Events" strokeWidth={2} />
                <Line type="monotone" dataKey="registrations" stroke="#3b82f6" name="Registrations" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donation Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Donation Trends (6 Months)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={donationMonthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="donations" fill="#f59e0b" name="Donations" />
                <Bar dataKey="amount" fill="#ef4444" name="Amount Raised" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8\">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">User Activity</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Users:</span>
                <span className="font-semibold">{userStats?.activeUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verified Users:</span>
                <span className="font-semibold">{userStats?.verifiedUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Users (30d):</span>
                <span className="font-semibold text-green-600">+{userStats?.newUsers || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Event Metrics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Registrations:</span>
                <span className="font-semibold">{eventStats?.totalRegistrations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg. Attendance:</span>
                <span className="font-semibold">{eventStats?.avgAttendance || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Past Events:</span>
                <span className="font-semibold">{eventStats?.pastEvents || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Donation Impact</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Raised:</span>
                <span className="font-semibold">${donationStats?.totalAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Goal:</span>
                <span className="font-semibold">${donationStats?.totalGoal?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-semibold text-green-600">{donationStats?.completionRate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
