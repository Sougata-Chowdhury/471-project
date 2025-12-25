
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { io } from 'socket.io-client';
import config from '../config';

import { API_BASE } from '../config.js';

const categories = [
  { value: "all", label: "All" },
  { value: "announcement", label: "University Updates" },
  { value: "achievement", label: "Alumni Achievements" },
  { value: "event", label: "Upcoming Events" },
];

function NewsList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState([]);     
  const [myItems, setMyItems] = useState([]);  
  const [loading, setLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("announcement");
  const [newFile, setNewFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createError, setCreateError] = useState("");

  const isAdmin = user && user.role === "admin";

  const formatCategory = (cat) => {
    if (cat === "announcement") return "University Update";
    if (cat === "achievement") return "Alumni Achievement";
    if (cat === "event") return "Event";
    return cat;
  };

  const formatStatus = (s) => {
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return "Pending approval";
  };

  const events = items.filter((i) => i.category === "event");
  const announcements = items.filter((i) => i.category === "announcement");
  const achievements = items.filter((i) => i.category === "achievement");

  const approvedPosts = items.filter((item) => item.status === "approved");
  const myExtraPosts = myItems.filter((item) => item.status !== "approved");
  const latestPosts = [...myExtraPosts, ...approvedPosts].slice(0, 20);

  const fetchNews = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        category: "all",
      });

      if (isAdmin) {
        params.set("status", "all");
      }
      const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch news", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyNews = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_BASE}/api/news/me/mine`, {
        credentials: "include",
      });
      const data = await res.json();
      setMyItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch my news", err);
    }
  };

  useEffect(() => {
    fetchNews();
    fetchMyNews();

    // Single Socket.io connection for all real-time news updates
    const socket = io(config.socketUrl);

    socket.on('news_created', (data) => {
      console.log('Real-time: New news post:', data);
      fetchNews();
      if (user && data.createdBy === user._id) {
        fetchMyNews();
      }
    });

    socket.on('news_status_updated', (data) => {
      console.log('Real-time: News status updated:', data);
      fetchNews();
      if (user && data.createdBy === user._id) {
        fetchMyNews();
      }
    });

    socket.on('news_deleted', (data) => {
      console.log('Real-time: News deleted:', data);
      setItems((prev) => prev.filter((n) => n._id !== data.newsId));
      setMyItems((prev) => prev.filter((n) => n._id !== data.newsId));
    });

    return () => {
      socket.disconnect();
    };
  }, [isAdmin, user]);

  const handleTopButton = (value) => {
    if (value === "all") {
      fetchNews();
    } else if (value === "announcement") {
      navigate("/news/university-updates");
    } else if (value === "achievement") {
      navigate("/news/alumni-achievements");
    } else if (value === "event") {
      navigate("/news/upcoming-events");
    }
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "bracu_net");
    data.append("folder", "bracunet_news");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dg0xhxxla/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || "Image upload failed");
    }
    return json.secure_url;
  };

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;

    try {
      setCreating(true);
      setCreateError("");

      let imageUrl = null;
      if (newFile) {
        setUploadingImage(true);
        imageUrl = await uploadToCloudinary(newFile);
        setUploadingImage(false);
      }

      const res = await fetch(`${API_BASE}/api/news`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          body: newBody,
          category: newCategory,
          image: imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create news");
      }

      setNewTitle("");
      setNewBody("");
      setNewCategory("announcement");
      setNewFile(null);

      // Socket.IO will handle the update automatically
      alert("Post submitted! It will appear after admin approval.");
    } catch (err) {
      setCreateError(err.message);
      setUploadingImage(false);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Do you really want to delete this post?")) return;

    try {
      await fetch(`${API_BASE}/api/news/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setItems((prev) => prev.filter((n) => n._id !== id));
      setMyItems((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Could not delete post");
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
      // Socket.IO will handle the update automatically
    } catch (err) {
      console.error("Status update failed", err);
      alert("Status update failed");
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Modern Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                📰
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Newsfeed
                </h1>
                <p className="text-xs text-gray-500">Stay Updated</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/directory")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                📖 Directory
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                ← Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Newsfeed & Announcements
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            University updates, alumni achievements, and upcoming events
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => handleTopButton(c.value)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
            >
              {c.label}
            </button>
          ))}
        </div>

        {isAdmin ? (
          // ========== ADMIN VIEW ==========
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Create Post Form */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                  ✨
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Post
                </h2>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {createError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="e.g., CSE Fest 2025"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="w-full h-32 rounded-xl border-2 border-gray-200 p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    placeholder="Write details of your announcement, event, or achievement..."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-200"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="announcement">📢 University Update</option>
                    <option value="achievement">🏆 Alumni Achievement</option>
                    <option value="event">📅 Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-white"
                    onChange={(e) => setNewFile(e.target.files[0] || null)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCreatePost}
                  disabled={
                    creating || uploadingImage || !newTitle.trim() || !newBody.trim()
                  }
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {creating
                    ? uploadingImage
                      ? "📤 Uploading image..."
                      : "✨ Submitting..."
                    : "🚀 POST"}
                </button>
              </div>
            </div>

            {/* All Posts Section */}
            <section className="space-y-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <span>📋</span> All Posts {!loading && `(${items.length})`}
              </h3>
              
              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                  <p className="text-white">Loading...</p>
                </div>
              )}
              
              {!loading && items.length === 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                  <div className="text-6xl mb-4">📭</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Posts Yet</h3>
                  <p className="text-white/80">Create your first post to get started!</p>
                </div>
              )}
              
              {items.map((item) => {
                const isMine =
                  user &&
                  item.createdBy &&
                  String(item.createdBy._id || item.createdBy) ===
                    String(user._id);

                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* User Header */}
                    <div className="p-5 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                          {item.createdBy?.profilePicture ? (
                            <img
                              src={item.createdBy.profilePicture}
                              alt={item.createdBy.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-xl">👤</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {item.createdBy?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                              item.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : item.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status === "approved" ? "✅" : item.status === "rejected" ? "❌" : "⏳"} {formatStatus(item.status)}
                          </span>
                          <span className="text-xs px-3 py-1.5 rounded-full font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                            {formatCategory(item.category)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full max-h-96 object-cover"
                      />
                    )}

                    {/* Content */}
                    <div className="p-5">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        {item.title}
                      </h4>
                      <p className="text-gray-700 leading-relaxed">
                        {item.body}
                      </p>

                      {/* Action Buttons */}
                      <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleDeletePost(item._id)}
                          className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          🗑️ Delete
                        </button>

                        {item.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(item._id, "approved")
                              }
                              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              ✅ Approve
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleStatusChange(item._id, "rejected")
                              }
                              className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}

                        {item.status === "rejected" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(item._id, "approved")
                            }
                            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            ✅ Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          </div>
        ) : (
          // ========== REGULAR USER VIEW ==========
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Left Sidebar - Latest News */}
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5 sticky top-20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>📰</span> Latest News
                </h3>
                <div className="space-y-4">
                  {announcements.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-24 rounded-lg object-cover mb-2"
                        />
                      )}
                      <p className="font-bold text-white text-sm line-clamp-2">{item.title}</p>
                      <p className="text-white/70 text-xs mt-1">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-white/70 text-sm text-center py-4">No news yet.</p>
                  )}
                </div>
              </section>

              <section className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>📅</span> Events
                </h3>
                <div className="space-y-4">
                  {events.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-24 rounded-lg object-cover mb-2"
                        />
                      )}
                      <p className="font-bold text-white text-sm line-clamp-2">{item.title}</p>
                      <p className="text-white/70 text-xs mt-1">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-white/70 text-sm text-center py-4">No events.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Center Feed - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Create Post Form */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl">
                    ✨
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    What's on your mind?
                  </h3>
                </div>

                {createError && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {createError}
                  </div>
                )}

                <div className="space-y-3">
                  <input
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="Post title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />

                  <textarea
                    className="w-full h-24 rounded-xl border-2 border-gray-200 p-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
                    placeholder="Share something interesting..."
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                  />

                  <div className="flex items-center gap-3">
                    <select
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-white transition-all duration-200 text-sm"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                    >
                      <option value="announcement">📢 University Update</option>
                      <option value="achievement">🏆 Alumni Achievement</option>
                      <option value="event">📅 Event</option>
                    </select>

                    <label className="cursor-pointer px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 text-sm font-medium text-gray-700">
                      📷 Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setNewFile(e.target.files[0] || null)}
                      />
                    </label>
                  </div>

                  {newFile && (
                    <p className="text-sm text-gray-600">Selected: {newFile.name}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleCreatePost}
                    disabled={
                      creating ||
                      uploadingImage ||
                      !newTitle.trim() ||
                      !newBody.trim()
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {creating
                      ? uploadingImage
                        ? "📤 Uploading..."
                        : "✨ Posting..."
                      : "🚀 POST"}
                  </button>
                </div>
              </div>

              {/* Latest Posts */}
              <section className="space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>📋</span> Latest Posts
                </h3>
                
                {loading && (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
                    <p className="text-white">Loading...</p>
                  </div>
                )}
                
                {!loading && latestPosts.length === 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Posts Yet</h3>
                    <p className="text-white/80">Be the first to share something!</p>
                  </div>
                )}
                
                {latestPosts.map((item) => {
                  const isMine =
                    user &&
                    item.createdBy &&
                    String(item.createdBy._id || item.createdBy) ===
                      String(user._id);

                  return (
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      {/* User Header */}
                      <div className="p-5 pb-4">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
                            {item.createdBy?.profilePicture ? (
                              <img
                                src={item.createdBy.profilePicture}
                                alt={item.createdBy.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white text-xl">👤</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              {item.createdBy?.name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.createdAt
                                ? new Date(item.createdAt).toLocaleString()
                                : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isMine && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-bold ${
                                  item.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : item.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {item.status === "approved" ? "✅" : item.status === "rejected" ? "❌" : "⏳"}
                              </span>
                            )}
                            <span className="text-xs px-2 py-1 rounded-full font-bold bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                              {formatCategory(item.category)}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-xl font-bold text-gray-900 mb-2">
                          {item.title}
                        </h4>
                      </div>

                      {/* Image */}
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full max-h-96 object-cover"
                        />
                      )}

                      {/* Content */}
                      <div className="p-5">
                        <p className="text-gray-700 leading-relaxed">
                          {item.body}
                        </p>

                        {isMine && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => handleDeletePost(item._id)}
                              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>

            {/* Right Sidebar - Achievements */}
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-5 sticky top-20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span>🏆</span> Achievements
                </h3>
                <div className="space-y-4">
                  {achievements.slice(0, 5).map((item, idx) => (
                    <div
                      key={item._id}
                      className="bg-white/10 rounded-xl p-3 hover:bg-white/20 transition-all duration-200 cursor-pointer"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-24 rounded-lg object-cover mb-2"
                        />
                      )}
                      <p className="font-bold text-white text-sm line-clamp-2">
                        {idx + 1}. {item.title}
                      </p>
                      <p className="text-white/70 text-xs mt-1">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-white/70 text-sm text-center py-4">No achievements yet.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsList;
