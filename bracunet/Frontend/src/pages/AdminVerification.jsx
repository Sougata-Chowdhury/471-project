import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const AdminVerification = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [error, setError] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchRequests();
    fetchStats();
  }, [user, navigate, filter]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/verification/requests?status=${filter}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      setError('Failed to fetch verification requests');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/verification/stats', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleApprove = async (requestId) => {
    if (!confirm('Are you sure you want to approve this verification request?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/verification/requests/${requestId}/approve`, {
        method: 'PUT',
        credentials: 'include',
      });
      const data = await response.json();

      if (data.success) {
        alert('Request approved successfully!');
        fetchRequests();
        fetchStats();
      } else {
        alert(data.message || 'Failed to approve request');
      }
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/verification/requests/${requestId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await response.json();

      if (data.success) {
        alert('Request rejected');
        setSelectedRequest(null);
        setRejectReason('');
        fetchRequests();
        fetchStats();
      } else {
        alert(data.message || 'Failed to reject request');
      }
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800',
      alumni: 'bg-purple-100 text-purple-800',
      faculty: 'bg-green-100 text-green-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Navigation */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet Admin</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/admin/news')}
              className="text-gray-600 hover:text-gray-800">
              News moderation
            </button>

            <span className="text-gray-700">{user.name}</span>
            <span className="px-3 py-1 rounded bg-red-500 text-white text-sm font-semibold">
              Admin
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-8">Verification Management</h2>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow p-6 border border-white/30">
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow p-6 border border-white/30">
              <p className="text-gray-600 text-sm">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow p-6 border border-white/30">
              <p className="text-gray-600 text-sm">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow p-6 border border-white/30">
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow p-6 border border-white/30">
              <p className="text-gray-600 text-sm">Verified Users</p>
              <p className="text-3xl font-bold text-purple-600">{stats.verifiedUsers}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white/20 backdrop-blur-md rounded-lg shadow mb-6 border border-white/30">
          <div className="flex border-b border-white/20">
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-3 font-medium ${
                filter === 'pending'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`px-6 py-3 font-medium ${
                filter === 'approved'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-6 py-3 font-medium ${
                filter === 'rejected'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Requests List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white/20 backdrop-blur-md rounded-lg shadow p-12 text-center border border-white/30">
            <p className="text-gray-500">No {filter} verification requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white/20 backdrop-blur-md rounded-lg shadow p-6 border border-white/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{request.user.name}</h3>
                    <p className="text-gray-600">{request.user.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {getStatusBadge(request.status)}
                    {getRoleBadge(request.requestType)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {request.studentId && (
                    <div>
                      <p className="text-gray-600 text-sm">Student ID</p>
                      <p className="text-gray-800 font-semibold">{request.studentId}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 text-sm">Department</p>
                    <p className="text-gray-800 font-semibold">{request.department}</p>
                  </div>
                  {request.batch && (
                    <div>
                      <p className="text-gray-600 text-sm">Batch</p>
                      <p className="text-gray-800 font-semibold">{request.batch}</p>
                    </div>
                  )}
                  {request.graduationYear && (
                    <div>
                      <p className="text-gray-600 text-sm">Graduation Year</p>
                      <p className="text-gray-800 font-semibold">{request.graduationYear}</p>
                    </div>
                  )}
                  {request.officialEmail && (
                    <div>
                      <p className="text-gray-600 text-sm">Official Email</p>
                      <p className="text-gray-800 font-semibold">{request.officialEmail}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-600 text-sm">Submitted</p>
                    <p className="text-gray-800 font-semibold">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {request.additionalInfo && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">Additional Information</p>
                    <p className="text-gray-800">{request.additionalInfo}</p>
                  </div>
                )}

                {request.proofDocument && (
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm mb-2">Proof Document</p>
                    {request.proofDocument.match(/\.(jpg|jpeg|png)$/i) || request.proofDocument.includes('image/upload') ? (
                      <div>
                        <img 
                          src={request.proofDocument} 
                          alt="Proof Document"
                          className="max-w-full h-auto max-h-64 rounded-lg border border-gray-300 mb-2"
                        />
                        <a 
                          href={request.proofDocument} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          Open in new tab
                        </a>
                      </div>
                    ) : (
                      <a 
                        href={request.proofDocument} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
                      >
                        📄 View Document
                      </a>
                    )}
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 text-sm">
                      <strong>Rejection Reason:</strong> {request.rejectionReason}
                    </p>
                  </div>
                )}

                {request.reviewedBy && (
                  <div className="mt-4 text-sm text-gray-600">
                    Reviewed by {request.reviewedBy.name} on{' '}
                    {new Date(request.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reject Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white/20 backdrop-blur-md rounded-lg shadow-xl p-6 max-w-md w-full border border-white/30">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Reject Verification Request</h3>
              <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                placeholder="Reason for rejection..."
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleReject(selectedRequest)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setRejectReason('');
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
