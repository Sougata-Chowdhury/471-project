

// import React, { useState } from "react";
// import axios from "axios";

// export default function ResourceUpload({ token, onUploaded }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [type, setType] = useState("Career Advice");
//   const [file, setFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     if (!file) return setError("Please select a file");

//     const formData = new FormData();
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("type", type);
//     formData.append("file", file);

//     try {
//       setLoading(true);
//       setError("");

//       await axios.post("http://localhost:3000/api/resources", formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       setTitle("");
//       setDescription("");
//       setFile(null);
//       setType("Career Advice");
//       if (onUploaded) onUploaded();
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleUpload} className="mb-4 p-4 border rounded shadow">
//       <h2 className="text-lg font-bold mb-2">Upload Resource</h2>

//       <input
//         type="text"
//         placeholder="Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         required
//         className="mb-2 p-2 border rounded w-full"
//       />

//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="mb-2 p-2 border rounded w-full"
//       />

//       <select
//         value={type}
//         onChange={(e) => setType(e.target.value)}
//         className="mb-2 p-2 border rounded w-full"
//       >
//         <option>Career Advice</option>
//         <option>Research</option>
//         <option>Entrepreneurship</option>
//       </select>

//       <input
//         type="file"
//         onChange={(e) => setFile(e.target.files[0])}
//         className="mb-2"
//       />

//       {error && <div className="text-red-600 mb-2">{error}</div>}

//       <button
//         type="submit"
//         disabled={loading}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         {loading ? "Uploading..." : "Upload"}
//       </button>
//     </form>
//   );
// }





import React, { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function ResourceUpload({ onUploaded }) {
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

      const res = await axios.post(
        "http://localhost:3000/api/resources",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

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
}


