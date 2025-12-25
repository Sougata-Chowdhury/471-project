
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE } from '../config';

// Resource Upload Component
const ResourceUpload = ({ onUploaded }) => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("Career Advice");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setMessage("Title and file are required!");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage("");

      await axios.post(`${API_BASE}/api/resources`, formData, {
        withCredentials: true, // cookie support
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Resource uploaded successfully!");
      setTitle("");
      setDescription("");
      setType("Career Advice");
      setFile(null);

      if (onUploaded) onUploaded();
    } catch (err) {
      setMessage(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
          📤
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Upload Resource
        </h2>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-xl ${
            message.includes("success") 
              ? "bg-green-100 text-green-700 border border-green-200" 
              : "bg-red-100 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            placeholder="e.g., Machine Learning Study Guide"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 resize-none"
            placeholder="Describe the resource..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-200"
          >
            <option>📚 Study Materials</option>
            <option>💼 Career Advice</option>
            <option>🔬 Research</option>
            <option>🚀 Entrepreneurship</option>
            <option>🎤 Recorded Talks</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-white"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? "📤 Uploading..." : "🚀 Upload Resource"}
        </button>
      </form>
    </div>
  );
};

// Main Resource Library Component
export default function ResourceLibrary() {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/resources`, {
        withCredentials: true,
      });
      setResources(res.data);
      setFilteredResources(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResources(resources);
    } else {
      setFilteredResources(
        resources.filter(
          (r) =>
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.description &&
              r.description.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );
    }
  }, [searchQuery, resources]);

  const handleDownload = async (fileUrl, title) => {
    try {
      const response = await fetch(fileUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = fileUrl.split(".").pop().split("?")[0];
      link.download = `${title}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Download failed");
    }
  };

  const handleApprove = async (id, approve = true) => {
    try {
      await axios.put(
        `${API_BASE}/api/resources/approve/${id}`,
        { approve },
        { withCredentials: true }
      );
      fetchResources();
    } catch (err) {
      alert("Approval failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/resources/${id}`, {
        withCredentials: true,
      });
      fetchResources();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const getCategoryColor = (type) => {
    const colors = {
      "Career Advice": "from-green-500 to-emerald-500",
      "Research": "from-purple-500 to-indigo-500",
      "Entrepreneurship": "from-orange-500 to-red-500",
      "Study Materials": "from-blue-500 to-cyan-500",
      "Recorded Talks": "from-pink-500 to-rose-500",
    };
    return colors[type] || "from-gray-500 to-gray-600";
  };

  const getCategoryBadgeColor = (type) => {
    const colors = {
      "Career Advice": "bg-green-100 text-green-700 border-green-200",
      "Research": "bg-purple-100 text-purple-700 border-purple-200",
      "Entrepreneurship": "bg-orange-100 text-orange-700 border-orange-200",
      "Study Materials": "bg-blue-100 text-blue-700 border-blue-200",
      "Recorded Talks": "bg-pink-100 text-pink-700 border-pink-200",
    };
    return colors[type] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getCategoryEmoji = (type) => {
    const emojis = {
      "Study Materials": "📚",
      "Career Advice": "💼",
      "Research": "🔬",
      "Entrepreneurship": "🚀",
      "Recorded Talks": "🎤",
    };
    return emojis[type] || "📄";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Modern Navbar */}
      <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                📚
              </div>
              <span className="text-xl font-bold text-white">
                Resource Library
              </span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold border border-white/30"
            >
              ← Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Resource Library
          </h1>
          <p className="text-white/90 max-w-2xl mx-auto text-lg">
            Access study materials, career advice, research papers, and more shared by the BRACU community
          </p>
        </div>

        {/* Upload Form */}
        <div className="mb-8">
          <ResourceUpload onUploaded={fetchResources} />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search resources by title, category, or description..."
              className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm"
            />
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 text-lg">No resources found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group hover:scale-105 border border-gray-100"
              >
                {/* Card Header with Gradient */}
                <div className={`h-32 bg-gradient-to-br ${getCategoryColor(resource.type)} p-6 flex items-center justify-center`}>
                  <div className="text-white text-5xl">
                    {getCategoryEmoji(resource.type)}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {resource.title}
                  </h3>

                  {/* Category Badge */}
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-3 ${getCategoryBadgeColor(resource.type)}`}>
                    {resource.type}
                  </span>

                  {/* Description */}
                  {resource.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-2 mb-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      👤 {resource.uploadedBy?.name || "Anonymous"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      📅 {new Date(resource.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    {resource.status === "approved" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                        ✅ Approved
                      </span>
                    ) : resource.status === "rejected" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold border border-red-200">
                        ❌ Rejected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-200">
                        ⏳ Pending
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {/* Download Button */}
                    {resource.status === "approved" && (
                      <button
                        onClick={() => handleDownload(resource.fileUrl, resource.title)}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 font-semibold text-sm"
                      >
                        📥 Download
                      </button>
                    )}

                    {/* Admin Actions */}
                    {user?.role === "admin" && resource.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(resource._id, true)}
                          className="flex-1 py-2 px-4 bg-green-500 text-white rounded-xl hover:bg-green-600 hover:scale-105 transition-all duration-200 font-semibold text-sm"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleApprove(resource._id, false)}
                          className="flex-1 py-2 px-4 bg-red-500 text-white rounded-xl hover:bg-red-600 hover:scale-105 transition-all duration-200 font-semibold text-sm"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {/* Delete Button */}
                    {(user?.role === "admin" || user?._id === resource.uploadedBy?._id) && (
                      <button
                        onClick={() => handleDelete(resource._id)}
                        className="py-2 px-4 bg-gray-500 text-white rounded-xl hover:bg-gray-600 hover:scale-105 transition-all duration-200 font-semibold text-sm"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

