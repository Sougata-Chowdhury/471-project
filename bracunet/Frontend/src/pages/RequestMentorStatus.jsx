import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiX, FiClock } from "react-icons/fi";
import { API_BASE } from "../config";

export default function RequestMentorStatus() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Check current request status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          `${API_BASE}/mentorship/mentor-request/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStatus(response.data);
      } catch (err) {
        console.error("Error checking status:", err);
      }
    };

    checkStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (reason.trim().length < 10) {
      setError("Please provide a reason with at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${API_BASE}/mentorship/mentor-request/submit`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMsg("✓ Your mentor request has been submitted for approval");
      setReason("");
      setStatus(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!status || status.status === "none") return null;
    switch (status.status) {
      case "pending":
        return <FiClock className="text-yellow-500 text-5xl mb-4" />;
      case "approved":
        return <FiCheck className="text-green-500 text-5xl mb-4" />;
      case "rejected":
        return <FiX className="text-red-500 text-5xl mb-4" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (!status || status.status === "none") return null;
    switch (status.status) {
      case "pending":
        return (
          <div className="text-center py-8">
            <p className="text-yellow-600 text-lg font-semibold mb-2">
              Request Pending Review
            </p>
            <p className="text-gray-600">
              Your request is under review by administrators. You'll be notified once a decision is made.
            </p>
          </div>
        );
      case "approved":
        return (
          <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200 p-4">
            <p className="text-green-600 text-lg font-semibold mb-2">
              Congratulations! You're Now a Mentor
            </p>
            <p className="text-gray-600 mb-4">
              You can now help students by accepting mentorship requests.
            </p>
            <button
              onClick={() => navigate("/mentorship")}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Go to Mentorship
            </button>
          </div>
        );
      case "rejected":
        return (
          <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200 p-4">
            <p className="text-red-600 text-lg font-semibold mb-2">
              Request Not Approved
            </p>
            <p className="text-gray-600">
              {status.adminNotes || "Your request was not approved at this time."}
            </p>
            {status.status === "rejected" && (
              <p className="text-sm text-gray-500 mt-2">
                You can submit another request after 30 days.
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <FiArrowLeft /> Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Request Mentor Status</h1>
          <p className="text-gray-600 mb-6">
            Be a mentor and help fellow students succeed in their careers
          </p>

          {/* Current Status */}
          {status && status.status !== "none" && (
            <div className="text-center mb-8">
              {getStatusIcon()}
              {getStatusMessage()}
            </div>
          )}

          {/* Request Form */}
          {!status || status.status === "none" || status.status === "rejected" ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="reason" className="block text-lg font-semibold mb-3">
                  Why do you want to be a mentor?
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Please explain your motivation and what you can offer to students (minimum 10 characters)
                </p>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="I want to be a mentor because... I have experience in... I can help students with..."
                  className="w-full p-4 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {reason.length} / 500
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                  {successMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || reason.trim().length < 10}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  loading || reason.trim().length < 10
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit Mentor Request"}
              </button>
            </form>
          ) : status.status === "approved" ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                You're already approved as a mentor!
              </p>
              <button
                onClick={() => navigate("/mentorship")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                View Mentees
              </button>
            </div>
          ) : null}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Mentor Requirements</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Be willing to share your knowledge and experience</li>
            <li>✓ Respond to mentee messages within 48 hours</li>
            <li>✓ Provide constructive feedback and guidance</li>
            <li>✓ Be respectful and professional at all times</li>
            <li>✓ Commit to at least 1-2 hours per week</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
