import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchGroups, requestJoinGroup } from '../api';
import GroupCard from '../components/GroupCard';
import { io } from 'socket.io-client';
import config from '../config';

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGroups()
      .then(res => {
        setGroups(res.data.groups || res.data);
      })
      .catch(err => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));

    // Socket.io for real-time group updates
    const socket = io(config.socketUrl);

    socket.on('group_join_request', (data) => {
      console.log('Real-time: Group join request:', data);
      // Refresh groups to show updated request counts
      fetchGroups().then(res => setGroups(res.data.groups || res.data));
    });

    socket.on('group_request_approved', (data) => {
      console.log('Real-time: Group request approved:', data);
      fetchGroups().then(res => setGroups(res.data.groups || res.data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = async (id) => {
    try {
      await requestJoinGroup(id);
      // optimistic UI: mark pending
      setGroups(prev => prev.map(g => g._id === id ? { ...g, joinStatus: 'pending' } : g));
    } catch (err) {
      console.error('Join error:', err);
      // Show detailed error when available
      const details = err?.data ? JSON.stringify(err.data) : (err?.message || 'Failed to request join');
      alert(`Join failed: ${details}`);
    }
  };

  const addToDashboard = (group) => {
    try {
      const pinned = JSON.parse(localStorage.getItem('pinnedGroups') || '[]');
      if (!pinned.includes(group._id)) {
        pinned.push(group._id);
        localStorage.setItem('pinnedGroups', JSON.stringify(pinned));
        alert('Added to dashboard (local)');
      } else {
        alert('Already added');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to add');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white text-lg font-medium">Loading groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Modern Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                👥
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Interest Groups
                </h1>
                <p className="text-xs text-gray-500">Connect & Collaborate</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {user && user.role === 'admin' && (
                <button
                  onClick={() => navigate('/groups/create')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
                >
                  <span className="text-lg">+</span>
                  <span className="hidden sm:inline">Create Group</span>
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Interest Groups
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Join communities, share ideas, and collaborate with peers
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/90 backdrop-blur-sm text-white rounded-xl shadow-lg flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Groups Count */}
        {groups.length > 0 && (
          <div className="mb-6 px-4">
            <p className="text-white/90 font-medium">
              🌟 {groups.length} {groups.length === 1 ? 'Group' : 'Groups'} Available
            </p>
          </div>
        )}

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No Groups Yet</h3>
            <p className="text-white/80 mb-6">
              {user?.role === 'admin'
                ? 'Create the first interest group to get started!'
                : 'Check back soon for new interest groups.'}
            </p>
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/groups/create')}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Create First Group
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map(group => (
              <div key={group._id} className="space-y-3">
                <GroupCard group={group} />
                <div className="flex gap-2">
                  {!user ? (
                    <button
                      onClick={() => navigate('/login')}
                      className="flex-1 px-4 py-2.5 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      🔐 Login to Join
                    </button>
                  ) : user.role === 'admin' ? (
                    <button
                      onClick={() => navigate(`/groups/${group._id}/requests`)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      ⚙️ Manage Requests
                    </button>
                  ) : group.joinStatus !== 'approved' ? (
                    <>
                      <button
                        onClick={() => handleJoin(group._id)}
                        disabled={group.joinStatus === 'pending'}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {group.joinStatus === 'pending' ? '⏳ Requested' : '✨ Join Group'}
                      </button>
                      <button
                        onClick={() => addToDashboard(group)}
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                        title="Add to Dashboard"
                      >
                        📌
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => window.location.assign(`/groups/${group._id}`)}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        💬 Open Chat
                      </button>
                      <button
                        onClick={() => addToDashboard(group)}
                        className="px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
                        title="Add to Dashboard"
                      >
                        📌
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
