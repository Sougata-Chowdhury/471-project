import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiArrowLeft, FiCheck, FiX, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

export default function MentorRequestsAdmin() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get(
        `${API_BASE}/mentorship/mentor-request/admin/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequests(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch requests");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId, userId, userName) => {
    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("authToken");
      const notes = adminNotes[requestId] || `Approved on ${new Date().toLocaleDateString()}`;
      
      await axios.post(
        `${API_BASE}/mentorship/mentor-request/${requestId}/approve`,
        { adminNotes: notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(requests.filter((r) => r._id !== requestId));
      setAdminNotes((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId) => {
    const notes = window.prompt(
      "Enter reason for rejection (optional):",
      adminNotes[requestId] || ""
    );
    if (notes === null) return; // User cancelled

    setProcessingId(requestId);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `${API_BASE}/mentorship/mentor-request/${requestId}/reject`,
        { adminNotes: notes },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRequests(requests.filter((r) => r._id !== requestId));
      setAdminNotes((prev) => {
        const updated = { ...prev };
        delete updated[requestId];
        return updated;
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Mentor Request Approvals</h1>
          <p className="text-gray-600 mb-6">
            Review and approve student requests to become mentors
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="animate-spin text-blue-600 text-4xl" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No pending mentor requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {request.user?.name || "Unknown User"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.user?.email} • {request.user?.studentId || "N/A"}
                      </p>
                      {request.user?.department && (
                        <p className="text-sm text-gray-500">
                          {request.user.department}
                        </p>
                      )}
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                      Pending
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-2">
                      Why they want to be a mentor:
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">
                      {request.reason}
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Admin Notes (optional):
                    </label>
                    <textarea
                      value={adminNotes[request._id] || ""}
                      onChange={(e) =>
                        setAdminNotes((prev) => ({
                          ...prev,
                          [request._id]: e.target.value,
                        }))
                      }
                      placeholder="Add notes about approval/rejection..."
                      className="w-full p-2 border border-gray-300 rounded text-sm resize-none h-20"
                      disabled={processingId === request._id}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleApprove(request._id, request.user._id, request.user.name)
                      }
                      disabled={processingId === request._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                        processingId === request._id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {processingId === request._id ? (
                        <>
                          <FiLoader className="animate-spin" /> Processing
                        </>
                      ) : (
                        <>
                          <FiCheck /> Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleReject(request._id)}
                      disabled={processingId === request._id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                        processingId === request._id
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {processingId === request._id ? (
                        <>
                          <FiLoader className="animate-spin" /> Processing
                        </>
                      ) : (
                        <>
                          <FiX /> Reject
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
