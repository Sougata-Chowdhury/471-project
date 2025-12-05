// src/pages/AdminNewsModeration.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API_BASE = "http://localhost:3000";

function AdminNewsModeration() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all"); // all | pending | approved | rejected
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchNews();
  }, [user, statusFilter, navigate]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== "all" ? `&status=${statusFilter}` : "";
      const res = await fetch(`${API_BASE}/api/news/admin/all?category=all&page=1&limit=100${statusParam}`, {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch news for admin", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    if (!window.confirm(`Set this post as ${status}?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/news/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to update status");
        return;
      }
      fetchNews();
    } catch (err) {
      console.error("Status update failed", err);
      alert("Status update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post permanently?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/news/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.message || "Failed to delete");
        return;
      }
      setItems((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  };

  const formatCategory = (cat) => {
    if (cat === "announcement") return "Announcement";
    if (cat === "achievement") return "Alumni Achievement";
    if (cat === "event") return "Event";
    return cat;
  };

  const formatStatus = (s) => {
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return "Pending";
  };

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">
            BracuNet Admin – News
          </h1>
          <button
            onClick={() => navigate("/admin/verification")}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            Back to Verification
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">News Moderation</h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={fetchNews}
              className="px-3 py-1 rounded-full text-sm border bg-white/20 text-white border-white/60 hover:bg-white/30"
              title="Refresh list"
            >
              🔄 Refresh
            </button>
            {["all", "pending", "approved", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={
                  "px-3 py-1 rounded-full text-sm border " +
                  (statusFilter === s
                    ? "bg-white text-blue-700 border-white"
                    : "bg-white/40 text-white border-white/60")
                }
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-white/80">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-white/80">No posts found for this filter.</p>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item._id}
                className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-56 object-contain rounded-xl mb-2 bg-white/10"
                  />
                )}

                <div className="flex justify-between items-center mb-1">
                  <div>
                    <h3 className="font-semibold text-lg text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/80">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString()
                        : ""}
                      {" · "}
                      {item.createdBy?.name || "Unknown user"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {formatCategory(item.category)}
                    </span>
                    <span
                      className={
                        "text-[11px] px-2 py-0.5 rounded-full " +
                        (item.status === "approved"
                          ? "bg-green-200 text-green-800"
                          : item.status === "rejected"
                          ? "bg-red-200 text-red-800"
                          : "bg-yellow-200 text-yellow-800")
                      }
                    >
                      {formatStatus(item.status)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-white/90 mb-3 whitespace-pre-line">
                  {item.body}
                </p>

                <div className="flex flex-wrap gap-2">
                  {item.status !== "approved" && (
                    <button
                      onClick={() =>
                        handleStatusChange(item._id, "approved")
                      }
                      className="px-3 py-1 text-xs rounded-lg bg-green-500 hover:bg-green-600 text-white"
                    >
                      Approve
                    </button>
                  )}
                  {item.status !== "pending" && (
                    <button
                      onClick={() =>
                        handleStatusChange(item._id, "pending")
                      }
                      className="px-3 py-1 text-xs rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Mark Pending
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button
                      onClick={() =>
                        handleStatusChange(item._id, "rejected")
                      }
                      className="px-3 py-1 text-xs rounded-lg bg-red-500 hover:bg-red-600 text-white"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="px-3 py-1 text-xs rounded-lg bg-gray-700 hover:bg-gray-800 text-white ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNewsModeration;
