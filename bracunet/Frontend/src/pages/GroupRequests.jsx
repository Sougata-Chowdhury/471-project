import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupRequests, approveJoinRequest, rejectJoinRequest } from '../api';
import { io } from 'socket.io-client';
import config from '../config';

export default function GroupRequests() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      setUnauthorized(true);
      setLoading(false);
      return;
    }

    getGroupRequests(id)
      .then(res => setRequests(res.data.requests || res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // Socket.io for real-time join request updates
    const socket = io(config.socketUrl);

    socket.on('group_join_request', (data) => {
      if (data.groupId === id) {
        console.log('Real-time: New group join request:', data);
        getGroupRequests(id).then(res => setRequests(res.data.requests || res.data));
      }
    });

    socket.on('group_request_approved', (data) => {
      if (data.groupId === id) {
        console.log('Real-time: Group request approved:', data);
        getGroupRequests(id).then(res => setRequests(res.data.requests || res.data));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, user, navigate]);

  const handleApprove = async (userId) => {
    try {
      await approveJoinRequest(id, userId);
      setRequests(prev => prev.filter(r => r._id !== userId));
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (userId) => {
    try {
      await rejectJoinRequest(id, userId);
      setRequests(prev => prev.filter(r => r._id !== userId));
    } catch (err) {
      alert('Failed to reject');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Loading requests...</p>
      </div>
    </div>
  );

  if (unauthorized) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unauthorized Access</h2>
        <p className="text-gray-600 mb-6">You are not authorized to view requests</p>
        <button 
          onClick={() => navigate('/dashboard')} 
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                ⏳
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Join Requests
              </span>
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-semibold"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">👥</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
            Pending Join Requests
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Review and approve or reject user requests to join the group
          </p>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="text-6xl mb-4">✓</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">All Clear!</h3>
            <p className="text-gray-600">No pending requests at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(r => (
              <div key={r._id} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                      {(r.name || r.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-lg">{r.name || 'User'}</div>
                      <div className="text-sm text-gray-500">{r.email}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleApprove(r._id)} 
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      ✅ Approve
                    </button>
                    <button 
                      onClick={() => handleReject(r._id)} 
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
