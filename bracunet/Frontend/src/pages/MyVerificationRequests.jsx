import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const MyVerificationRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [user, navigate]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/verification/my-requests', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              Dashboard
            </button>
            <span className="text-gray-700">{user.name}</span>
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
        <h2 className="text-4xl font-bold text-gray-800 mb-8">My Verification Requests</h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't submitted any verification requests yet</p>
            <button
              onClick={() => navigate('/verification-request')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              Submit Verification Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 capitalize">
                      {request.requestType} Verification
                    </h3>
                    <p className="text-gray-600">
                      Submitted on {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
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
                </div>

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
      </div>
    </div>
  );
};
