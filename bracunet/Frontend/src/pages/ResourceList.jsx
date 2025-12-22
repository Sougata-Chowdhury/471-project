
import React, { useEffect, useState } from "react";
import axios from "axios";
import { io } from 'socket.io-client';
import config from '../config';

export default function ResourceList({ currentUser }) {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch resources
  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:3000/api/resources");
      setResources(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    // Socket.io for real-time resource updates
    const socket = io(config.socketUrl);

    socket.on('resource_uploaded', (data) => {
      console.log('Real-time: New resource uploaded:', data);
      fetchResources();
    });

    socket.on('resource_approved', (data) => {
      console.log('Real-time: Resource approved:', data);
      fetchResources();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Delete resource
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/resources/${id}`, {
        withCredentials: true,
      });
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Approve / Reject resource (admin)
  const handleApprove = async (id, approve = true) => {
    try {
      await axios.put(
        `http://localhost:3000/api/resources/approve/${id}`,
        { approve },
        { withCredentials: true }
      );
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  // Download file
  const handleDownload = async (fileUrl, title) => {
    try {
      const res = await axios.get(fileUrl, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Download failed");
    }
  };

  // Filter + sort: user’s own first
  const filtered = resources
    .filter((r) =>
      [r.title, r.description, r.type, r.uploadedBy?.name]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (currentUser && a.uploadedBy?._id === currentUser._id) return -1;
      if (currentUser && b.uploadedBy?._id === currentUser._id) return 1;
      return 0;
    });

  if (loading) return <div className="text-white">Loading resources...</div>;
  if (error) return <div className="text-red-200">{error}</div>;
  if (filtered.length === 0) return <div className="text-white">No resources available.</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search resources..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 p-2 rounded w-full border text-gray-700"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r) => (
          <div
            key={r._id}
            className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-5 hover:shadow-xl transition"
          >
            <h3 className="font-bold text-lg text-white">{r.title}</h3>
            <p className="text-white/80 mb-2">{r.description}</p>
            <p className="text-white/70 text-sm mb-2">
              <strong>Type:</strong> {r.type} | <strong>Uploaded by:</strong>{" "}
              {r.uploadedBy?.name || "Unknown"}
            </p>
            <p className="text-white/70 text-sm mb-4">
              <strong>Status:</strong> {r.status || "pending"}
            </p>

            {/* Download Button */}
            <button
              onClick={() => handleDownload(r.fileUrl, r.title)}
              className="bg-green-600 text-white px-3 py-1 rounded mb-2"
            >
              Download
            </button>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Own post */}
              {currentUser && r.uploadedBy?._id === currentUser._id && (
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
              {currentUser?.role === "admin" && r.status === "pending" && (
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
  );
}


// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function ResourceList({ token, currentUser }) {
//   const [resources, setResources] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Fetch resources
//   const fetchResources = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get("http://localhost:3000/api/resources");
//       setResources(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchResources();
//   }, []);

//   // Delete resource
//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`http://localhost:3000/api/resources/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       fetchResources();
//     } catch (err) {
//       alert(err.response?.data?.message || err.message);
//     }
//   };

//   // Approve / Reject resource (admin)
//   const handleApprove = async (id, approve = true) => {
//     try {
//       await axios.put(
//         `http://localhost:3000/api/resources/approve/${id}`,
//         { approve },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       fetchResources();
//     } catch (err) {
//       alert(err.response?.data?.message || err.message);
//     }
//   };

//   // Correct Download function
//   const handleDownload = (fileUrl, title) => {
//     const link = document.createElement("a");
//     link.href = fileUrl;

//     // Keep extension from URL
//     const extension = fileUrl.split(".").pop().split("?")[0];
//     link.download = `${title}.${extension}`;

//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // Filter + sort: user's own first
//   const filtered = resources
//     .filter((r) =>
//       [r.title, r.description, r.type, r.uploadedBy?.name]
//         .join(" ")
//         .toLowerCase()
//         .includes(search.toLowerCase())
//     )
//     .sort((a, b) => {
//       if (currentUser && a.uploadedBy?._id === currentUser._id) return -1;
//       if (currentUser && b.uploadedBy?._id === currentUser._id) return 1;
//       return 0;
//     });

//   if (loading) return <div className="text-white">Loading resources...</div>;
//   if (error) return <div className="text-red-200">{error}</div>;
//   if (filtered.length === 0) return <div className="text-white">No resources available.</div>;

//   return (
//     <div>
//       {/* Search */}
//       <input
//         type="text"
//         placeholder="Search resources..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="mb-6 p-2 rounded w-full border text-gray-700"
//       />

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filtered.map((r) => (
//           <div
//             key={r._id}
//             className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-5 hover:shadow-xl transition"
//           >
//             <h3 className="font-bold text-lg text-white">{r.title}</h3>
//             <p className="text-white/80 mb-2">{r.description}</p>
//             <p className="text-white/70 text-sm mb-2">
//               <strong>Type:</strong> {r.type} | <strong>Uploaded by:</strong>{" "}
//               {r.uploadedBy?.name || "Unknown"}
//             </p>
//             <p className="text-white/70 text-sm mb-4">
//               <strong>Status:</strong> {r.status || "pending"}
//             </p>

//             {/* Download Button */}
//             <button
//               onClick={() => handleDownload(r.fileUrl, r.title)}
//               className="bg-green-600 text-white px-3 py-1 rounded mb-2"
//             >
//               Download
//             </button>

//             {/* Action buttons */}
//             <div className="flex flex-wrap gap-2 mt-3">
//               {/* Own post */}
//               {currentUser && r.uploadedBy?._id === currentUser._id && (
//                 <>
//                   <button
//                     className="bg-yellow-500 text-white px-2 py-1 rounded"
//                     onClick={() => alert("Edit functionality")}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="bg-red-600 text-white px-2 py-1 rounded"
//                     onClick={() => handleDelete(r._id)}
//                   >
//                     Delete
//                   </button>
//                 </>
//               )}

//               {/* Admin approve/reject */}
//               {currentUser?.role === "admin" && r.status === "pending" && (
//                 <>
//                   <button
//                     className="bg-blue-600 text-white px-2 py-1 rounded"
//                     onClick={() => handleApprove(r._id, true)}
//                   >
//                     Approve
//                   </button>
//                   <button
//                     className="bg-gray-600 text-white px-2 py-1 rounded"
//                     onClick={() => handleApprove(r._id, false)}
//                   >
//                     Reject
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
