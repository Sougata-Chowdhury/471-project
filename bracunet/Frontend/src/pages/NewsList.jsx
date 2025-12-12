
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const API_BASE = "http://localhost:3000";

const categories = [
  { value: "all", label: "All" },
  { value: "announcement", label: "University Updates" },
  { value: "achievement", label: "Alumni Achievements" },
  { value: "event", label: "Upcoming Events" },
];

function NewsList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [items, setItems] = useState([]);      // main feed
  const [myItems, setMyItems] = useState([]);  // own posts
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

  // Latest posts:
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
        // admin: sob status
        params.set("status", "all");
      }
      // user: backend default only approved

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
  }, [isAdmin]);

  useEffect(() => {
    fetchMyNews();
  }, [user]);

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

      await fetchNews();
      await fetchMyNews();

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
      await fetchNews();
      await fetchMyNews();
    } catch (err) {
      console.error("Status update failed", err);
      alert("Status update failed");
    }
  };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">BracuNet</h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/directory")}
              className="text-sm text-purple-600 font-semibold hover:text-purple-700"
            >
              📖 Directory
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-blue-600 font-semibold hover:text-blue-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          Newsfeed &amp; Announcement Board
        </h2>
        <p className="text-sm text-white/90 mb-4">
          University updates, alumni achievements, and upcoming events at one
          place.
        </p>

        {/* top buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c.value}
              onClick={() => handleTopButton(c.value)}
              className="px-3 py-1 rounded-full text-sm border bg-white/90 text-gray-800 border-white/80 hover:bg-blue-50"
            >
              {c.label}
            </button>
          ))}
        </div>

        {isAdmin ? (
          /* ============= ADMIN VIEW: single column ============= */
          <div className="max-w-4xl mx-auto space-y-4">
            {/* create post */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
              <p className="text-sm font-semibold text-white mb-2">
                Create your post here:
              </p>

              {createError && (
                <p className="text-xs text-red-200 mb-2">{createError}</p>
              )}

              <input
                className="w-full mb-2 px-3 py-2 rounded-lg bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Title (e.g. CSE Fest 2025)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <textarea
                className="w-full h-20 rounded-lg bg-white/80 mb-2 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write details of your announcement, event, or achievement..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
              />

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-white/80">Category:</span>
                <select
                  className="text-xs px-2 py-1 rounded bg-white/80"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="announcement">University Update</option>
                  <option value="achievement">Alumni Achievement</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <input
                type="file"
                accept="image/*"
                className="w-full mb-3 text-xs text-white/90"
                onChange={(e) => setNewFile(e.target.files[0] || null)}
              />

              <button
                onClick={handleCreatePost}
                disabled={
                  creating || uploadingImage || !newTitle.trim() || !newBody.trim()
                }
                className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
              >
                {creating
                  ? uploadingImage
                    ? "Uploading image..."
                    : "Submitting..."
                  : "POST"}
              </button>
            </div>

            {/* admin latest posts */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">All Posts</h3>
              {loading && <p className="text-white/80">Loading...</p>}
              {items.map((item) => {
                const isMine =
                  user &&
                  item.createdBy &&
                  String(item.createdBy._id || item.createdBy) ===
                    String(user._id);

                return (
                  <div
                    key={item._id}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-64 rounded-xl mb-2 object-contain bg-white/10"
                      />
                    )}

                    <div className="flex justify-between items-center mb-1">
                      <div>
                        <h4 className="font-semibold text-sm text-white">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-white/80">
                          {item.createdBy?.name || "Unknown"} ·{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={
                            "text-[10px] px-2 py-0.5 rounded-full " +
                            (item.status === "approved"
                              ? "bg-green-200 text-green-800"
                              : item.status === "rejected"
                              ? "bg-red-200 text-red-800"
                              : "bg-yellow-200 text-yellow-800")
                          }
                        >
                          {formatStatus(item.status)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {formatCategory(item.category)}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-white/90 mb-3">
                      {item.body}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {/* admin can always delete */}
                      <button
                        onClick={() => handleDeletePost(item._id)}
                        className="text-xs px-3 py-1 rounded-lg bg-red-500/90 hover:bg-red-600 text-white"
                      >
                        Delete
                      </button>

                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(item._id, "approved")
                            }
                            className="text-xs px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(item._id, "rejected")
                            }
                            className="text-xs px-3 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {item.status === "rejected" && (
                        <button
                          onClick={() =>
                            handleStatusChange(item._id, "approved")
                          }
                          className="text-xs px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {!loading && items.length === 0 && (
                <p className="text-white/80">No posts yet.</p>
              )}
            </section>
          </div>
        ) : (
          /* ============= USER VIEW: 3-column with sidebars ============= */
          <div className="grid gap-4 md:grid-cols-4">
            {/* left sidebar */}
            <div className="md:col-span-1 space-y-4">
              <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Latest News
                </h3>
                <div className="space-y-3 text-xs text-white/90">
                  {announcements.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="border-b border-white/20 pb-2 last:border-none"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-32 rounded-lg object-contain mb-1 bg-white/10"
                        />
                      )}
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-white/80 text-[11px]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-white/70 text-xs">No news yet.</p>
                  )}
                </div>
              </section>

              <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Upcoming Events
                </h3>
                <div className="space-y-3 text-xs text-white/90">
                  {events.slice(0, 5).map((item) => (
                    <div
                      key={item._id}
                      className="border-b border-white/20 pb-2 last:border-none"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-32 rounded-lg object-contain mb-1 bg-white/10"
                        />
                      )}
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-white/80 text-[11px]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {events.length === 0 && (
                    <p className="text-white/70 text-xs">
                      No upcoming events.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {/* middle column */}
            <div className="md:col-span-2 space-y-4">
              {/* create post box */}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <p className="text-sm font-semibold text-white mb-2">
                  Create your post here:
                </p>

                {createError && (
                  <p className="text-xs text-red-200 mb-2">
                    {createError}
                  </p>
                )}

                <input
                  className="w-full mb-2 px-3 py-2 rounded-lg bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Title (e.g. CSE Fest 2025)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />

                <textarea
                  className="w-full h-20 rounded-lg bg-white/80 mb-2 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Write details of your announcement, event, or achievement..."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-white/80">Category:</span>
                  <select
                    className="text-xs px-2 py-1 rounded bg-white/80"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="announcement">University Update</option>
                    <option value="achievement">Alumni Achievement</option>
                    <option value="event">Event</option>
                  </select>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="w-full mb-3 text-xs text-white/90"
                  onChange={(e) => setNewFile(e.target.files[0] || null)}
                />

                <button
                  onClick={handleCreatePost}
                  disabled={
                    creating ||
                    uploadingImage ||
                    !newTitle.trim() ||
                    !newBody.trim()
                  }
                  className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
                >
                  {creating
                    ? uploadingImage
                      ? "Uploading image..."
                      : "Submitting..."
                    : "POST"}
                </button>
              </div>

              {/* Latest posts for user */}
              <section className="space-y-3">
                <h3 className="text-lg font-semibold text-white">
                  Latest Posts
                </h3>
                {loading && <p className="text-white/80">Loading...</p>}
                {latestPosts.map((item) => {
                  const isMine =
                    user &&
                    item.createdBy &&
                    String(item.createdBy._id || item.createdBy) ===
                      String(user._id);

                  return (
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
                          className="w-full h-64 rounded-xl mb-2 object-contain bg-white/10"
                        />
                      )}

                      <div className="flex justify-between items-center mb-1">
                        <h4 className="font-semibold text-sm text-white">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {/* user: status badge only for own posts */}
                          {isMine && (
                            <span
                              className={
                                "text-[10px] px-2 py-0.5 rounded-full " +
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
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {formatCategory(item.category)}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-white/90 line-clamp-3">
                        {item.body}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {isMine && (
                          <button
                            onClick={() => handleDeletePost(item._id)}
                            className="text-xs px-3 py-1 rounded-lg bg-red-500/90 hover:bg-red-600 text-white"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!loading && latestPosts.length === 0 && (
                  <p className="text-white/80">No posts yet.</p>
                )}
              </section>
            </div>

            {/* right sidebar */}
            <div className="md:col-span-1 space-y-4">
              <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Announcements
                </h3>
                <div className="space-y-3 text-xs text-white/90">
                  {announcements.slice(0, 5).map((item, idx) => (
                    <div
                      key={item._id}
                      className="border-b border-white/20 pb-2 last:border-none"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-32 rounded-lg object-contain mb-1 bg-white/10"
                        />
                      )}
                      <p className="font-semibold">
                        {idx + 1}. {item.title}
                      </p>
                      <p className="text-white/80 text-[11px]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <p className="text-white/70 text-xs">
                      No announcements.
                    </p>
                  )}
                </div>
              </section>

              <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Alumni Achievements
                </h3>
                <div className="space-y-3 text-xs text-white/90">
                  {achievements.slice(0, 5).map((item, idx) => (
                    <div
                      key={item._id}
                      className="border-b border-white/20 pb-2 last:border-none"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-32 rounded-lg object-contain mb-1 bg-white/10"
                        />
                      )}
                      <p className="font-semibold">
                        {idx + 1}. {item.title}
                      </p>
                      <p className="text-white/80 text-[11px]">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : ""}
                      </p>
                    </div>
                  ))}
                  {achievements.length === 0 && (
                    <p className="text-white/70 text-xs">
                      No achievements yet.
                    </p>
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
