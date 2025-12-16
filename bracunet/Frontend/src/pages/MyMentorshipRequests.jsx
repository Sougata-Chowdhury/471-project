import React, { useEffect, useState } from "react";
import axios from "axios";

const MyMentorshipRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get(
        "http://localhost:5000/api/mentorship/my-requests",
        { withCredentials: true }
      );
      setRequests(res.data);
    };
    fetchRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">
          📩 My Mentorship Requests
        </h2>

        {requests.length === 0 ? (
          <p>No requests yet</p>
        ) : (
          requests.map((req) => (
            <div
              key={req._id}
              className="border p-4 rounded mb-3 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{req.mentor.name}</p>
                <p className="text-sm text-gray-500">
                  Status: {req.status}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded text-white text-sm ${
                  req.status === "accepted"
                    ? "bg-green-500"
                    : req.status === "rejected"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                }`}
              >
                {req.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyMentorshipRequests;
