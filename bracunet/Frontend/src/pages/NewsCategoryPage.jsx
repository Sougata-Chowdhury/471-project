
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from '../api/api';

function NewsCategoryPage({ title, category }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        category,
      });

      // admin: see all statuses, user: only approved (backend default)
      if (isAdmin) {
        params.set("status", "all");
      }

      const res = await fetch(
        `${API_BASE}/api/news?${params.toString()}`,
        { credentials: "include" }
      );
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Category page fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, isAdmin]);

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

  const formatStatus = (s) => {
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return "Pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">BracuNet</h1>
          <button
            onClick={() => navigate(isAdmin ? "/news" : "/news")}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            Back to News Hub
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-white/90 mb-4">
          Showing all posts under this section.
        </p>

        {loading && <p className="text-white/80">Loading...</p>}
        {!loading && items.length === 0 && (
          <p className="text-white/80">No posts yet.</p>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4"
            >
              {/* User info with profile picture */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/20">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center flex-shrink-0">
                  {item.createdBy?.profilePicture ? (
                    <img
                      src={item.createdBy.profilePicture}
                      alt={item.createdBy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-lg">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {item.createdBy?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-white/70">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ''}
                  </p>
                </div>
              </div>

              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 rounded-xl mb-3 object-contain bg-white/10"
                />
              )}

              <div className="flex justify-between items-center mb-1">
                <h3 className="font-semibold text-base text-white">
                  {item.title}
                </h3>
                {isAdmin && (
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
                )}
              </div>

              <p className="text-sm text-white/90 whitespace-pre-line">
                {item.body}
              </p>

              {isAdmin && (
                <div className="mt-3 flex flex-wrap gap-2">
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
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsCategoryPage;
