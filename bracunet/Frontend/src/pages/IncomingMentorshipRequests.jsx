import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { API_BASE } from "../config";

const IncomingMentorshipRequests = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get('/mentorship/incoming');
      setRequests(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load requests");
      setLoading(false);
    }
  };

  const updateStatus = async (mentorshipId, status) => {
    try {
      const res = await API.patch(
        `/mentorship/${mentorshipId}`,
        { status }
      );

      setRequests((prev) =>
        prev.map((r) =>
          r._id === mentorshipId ? { ...r, status } : r
        )
      );

      alert(`Request ${status} ✅`);
    } catch (err) {
      console.error("Error updating request:", err);
      alert(err.response?.data?.message || "Failed to update request");
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading requests...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600 font-semibold">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-white font-semibold hover:underline"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">
          📬 Incoming Mentorship Requests
        </h1>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">No pending requests yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-bold text-blue-600">
                  {request.student.name}
                </h3>
                <p className="text-gray-600 mt-2">
                  <span className="font-semibold">Status:</span> {request.status}
                </p>

                {request.student.skills && request.student.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Skills:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {request.student.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {request.student.interests &&
                  request.student.interests.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Interests:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {request.student.interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {request.student.mentorshipGoals &&
                  request.student.mentorshipGoals.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Goals:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {request.student.mentorshipGoals.map((goal, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {request.status === "pending" && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateStatus(request._id, "accepted")}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-semibold"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(request._id, "rejected")}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {request.status === "accepted" && (
                  <div className="mt-5">
                    <button
                      onClick={() => navigate("/mentorship/chat")}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
                    >
                      Open Chat
                    </button>
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

export default IncomingMentorshipRequests;
