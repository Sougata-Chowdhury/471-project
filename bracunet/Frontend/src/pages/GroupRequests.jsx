import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getGroupRequests, approveJoinRequest, rejectJoinRequest } from '../api';

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

  if (loading) return <div className="p-6">Loading requests...</div>;

  if (unauthorized) return <div className="p-6">You are not authorized to view requests.</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="max-w-3xl mx-auto bg-white/95 rounded p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Join Requests</h2>
        {requests.length === 0 ? (
          <div className="text-gray-600">No pending requests</div>
        ) : (
          <ul className="space-y-3">
            {requests.map(r => (
              <li key={r._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.email}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(r._id)} className="bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                  <button onClick={() => handleReject(r._id)} className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
