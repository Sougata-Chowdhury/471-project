
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

      await axios.post("http://localhost:3000/api/resources", formData, {
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
    <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-white mb-4">Upload Resource</h2>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes("success") ? "bg-green-500" : "bg-red-500"
          } text-white`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-white font-semibold">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded mt-1 text-gray-700"
            placeholder="Enter resource title"
          />
        </div>

        <div>
          <label className="text-white font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 rounded mt-1 text-gray-700"
            placeholder="Optional description"
            rows={3}
          />
        </div>

        <div>
          <label className="text-white font-semibold">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2 rounded mt-1 text-gray-700"
          >
            <option>Career Advice</option>
            <option>Research</option>
            <option>Entrepreneurship</option>
            <option>Study Materials</option>
            <option>Recorded Talks</option>
          </select>
        </div>

        <div>
          <label className="text-white font-semibold">File</label>
          <input
            type="file"
            accept="*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full mt-1 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

// Main Resource Library Component
export default function ResourceLibrary() {
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/resources", {
        withCredentials: true, // cookie support
      });
      setResources(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Download file
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
      console.error(err);
    }
  };

  // Approve/Reject (admin)
  const handleApprove = async (id, approve = true) => {
    try {
      await axios.put(
        `http://localhost:3000/api/resources/approve/${id}`,
        { approve },
        { withCredentials: true } // cookie/token support
      );
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  // Delete resource
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/resources/${id}`, {
        withCredentials: true,
      });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // Filter + sort
  const filtered = resources
    .filter((r) =>
      [r.title, r.description, r.type, r.uploadedBy?.name]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (a.uploadedBy?._id === user._id) return -1;
      if (b.uploadedBy?._id === user._id) return 1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Resource Library</h1>
          <button
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Upload Form */}
        <ResourceUpload onUploaded={fetchResources} />

        {/* Search */}
        <input
          type="text"
          placeholder="Search resources..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-6 p-3 rounded-lg w-full border border-white/50 bg-white/20 text-white placeholder-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
        />

        {/* Resource List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => (
            <div
              key={r._id}
              className="bg-white/20 backdrop-blur-sm border-t-4 border-blue-400 rounded-lg shadow-lg p-4 hover:shadow-2xl transition relative"
            >
              <h3 className="font-bold text-white text-lg">{r.title}</h3>
              <p className="text-white/80 text-sm mb-1">{r.description}</p>
              <p className="text-xs mb-1 text-white/70">
                <strong>Type:</strong> {r.type} | <strong>Uploaded by:</strong>{" "}
                {r.uploadedBy?.name || "Unknown"}
              </p>
              <p className="text-xs mb-2 text-white/70">
                <strong>Status:</strong> {r.status || "Pending"}
              </p>

              <button
                onClick={() => handleDownload(r.fileUrl, r.title)}
                className="bg-green-600 text-white px-3 py-1 rounded mb-2"
              >
                Download
              </button>

              <div className="mt-2 flex flex-wrap gap-2">
                {/* Own post edit/delete */}
                {r.uploadedBy?._id === user._id && (
                  <>
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                      onClick={() => alert("Edit functionality")}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(r._id)}
                    >
                      Delete
                    </button>
                  </>
                )}

                {/* Admin approve/reject */}
                {user.role === "admin" && r.status === "pending" && (
                  <>
                    <button
                      className="bg-blue-600 text-white px-2 py-1 rounded"
                      onClick={() => handleApprove(r._id, true)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-gray-600 text-white px-2 py-1 rounded"
                      onClick={() => handleApprove(r._id, false)}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

