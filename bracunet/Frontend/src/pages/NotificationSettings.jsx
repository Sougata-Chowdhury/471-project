import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

export default function NotificationSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState({
    account: true,
    messages: true,
    mentions: true,
    comments: true,
    groups: true,
    events: true,
    resources: true,
    donations: true,
    career: true,
    gamification: true,
    news: true,
    admin: true,
    mentorship: true,
    system: true,
    emailNotifications: false,
    pushNotifications: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/settings/notification-preferences`, {
        withCredentials: true,
      });
      if (response.data.success && response.data.preferences) {
        setPreferences({ ...preferences, ...response.data.preferences });
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      const response = await axios.put(
        `${API_BASE}/api/settings/notification-preferences`,
        { preferences },
        { withCredentials: true }
      );
      if (response.data.success) {
        setMessage('✅ Preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('❌ Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const notificationCategories = [
    { key: 'account', label: 'Account & Security', description: 'Verification, password changes, security alerts' },
    { key: 'messages', label: 'Direct Messages', description: 'New messages and message requests' },
    { key: 'mentions', label: 'Mentions & Tags', description: 'When someone mentions or tags you' },
    { key: 'comments', label: 'Comments & Reactions', description: 'Comments on your posts and reactions' },
    { key: 'groups', label: 'Groups & Forums', description: 'Group invitations, join requests, new posts' },
    { key: 'events', label: 'Events', description: 'RSVP confirmations, event reminders and updates' },
    { key: 'resources', label: 'Resources', description: 'Resource uploads, approvals, and comments' },
    { key: 'donations', label: 'Donations & Campaigns', description: 'Campaign updates and donation receipts' },
    { key: 'career', label: 'Career Opportunities', description: 'Job postings and application updates' },
    { key: 'gamification', label: 'Points & Badges', description: 'Points earned, badges unlocked, leaderboard' },
    { key: 'news', label: 'News & Announcements', description: 'Approved/rejected news posts' },
    { key: 'mentorship', label: 'Mentorship', description: 'Mentorship requests and updates' },
    { key: 'admin', label: 'Admin & Moderation', description: 'Moderation requests and content flags (admins only)' },
    { key: 'system', label: 'System Updates', description: 'Maintenance, policy updates, new features' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading preferences...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Notification Settings</h1>
              <p className="text-white/80">Manage your notification preferences</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${message.includes('✅') ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {message}
          </div>
        )}

        {/* Channel Preferences */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Delivery Channels</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
              <div>
                <h3 className="text-white font-semibold text-lg">Push Notifications</h3>
                <p className="text-white/70 text-sm">Real-time notifications in your browser</p>
              </div>
              <button
                onClick={() => handleToggle('pushNotifications')}
                className={`w-16 h-8 rounded-full transition ${
                  preferences.pushNotifications ? 'bg-green-500' : 'bg-gray-400'
                } relative`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                    preferences.pushNotifications ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/10 p-4 rounded-lg">
              <div>
                <h3 className="text-white font-semibold text-lg">Email Notifications</h3>
                <p className="text-white/70 text-sm">Receive important updates via email</p>
              </div>
              <button
                onClick={() => handleToggle('emailNotifications')}
                className={`w-16 h-8 rounded-full transition ${
                  preferences.emailNotifications ? 'bg-green-500' : 'bg-gray-400'
                } relative`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                    preferences.emailNotifications ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Category Preferences */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Notification Categories</h2>
          
          <div className="space-y-3">
            {notificationCategories.map((category) => (
              <div
                key={category.key}
                className="flex items-center justify-between bg-white/10 p-4 rounded-lg hover:bg-white/15 transition"
              >
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{category.label}</h3>
                  <p className="text-white/70 text-sm">{category.description}</p>
                </div>
                <button
                  onClick={() => handleToggle(category.key)}
                  className={`w-16 h-8 rounded-full transition flex-shrink-0 ml-4 ${
                    preferences[category.key] ? 'bg-green-500' : 'bg-gray-400'
                  } relative`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${
                      preferences[category.key] ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}
