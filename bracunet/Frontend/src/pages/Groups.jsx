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

  if (loading) return <div className="p-6">Loading groups...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Interest Groups</h2>
          {user && user.role === 'admin' && (
            <button
              onClick={() => navigate('/groups/create')}
              className="bg-white text-indigo-600 px-4 py-2 rounded shadow hover:opacity-90"
            >
              + Create Group
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map(group => (
            <div key={group._id}>
              <GroupCard group={group} />
              <div className="mt-3 flex gap-2">
                {!user ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="bg-white text-indigo-600 px-3 py-1 rounded border"
                  >
                    Login to Join
                  </button>
                ) : user.role === 'admin' ? (
                  <button
                    onClick={() => navigate(`/groups/${group._id}/requests`)}
                    className="bg-white text-indigo-600 px-3 py-1 rounded border"
                  >
                    Manage
                  </button>
                ) : group.joinStatus !== 'approved' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleJoin(group._id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                    >
                      {group.joinStatus === 'pending' ? 'Requested' : 'Join'}
                    </button>
                    <button
                      onClick={() => addToDashboard(group)}
                      className="bg-white text-indigo-600 px-3 py-1 rounded border"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.assign(`/groups/${group._id}`)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => addToDashboard(group)}
                      className="bg-white text-indigo-600 px-3 py-1 rounded border"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
