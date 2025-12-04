
// import { useEffect, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// const API_BASE = "http://localhost:3000";

// const categories = [
//   { value: "all", label: "All" },
//   { value: "announcement", label: "University Updates" },
//   { value: "achievement", label: "Alumni Achievements" },
//   { value: "event", label: "Upcoming Events" },
// ];

// function NewsList() {
//   const navigate = useNavigate();

//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // create-post form state
//   const [newTitle, setNewTitle] = useState("");
//   const [newBody, setNewBody] = useState("");
//   const [newCategory, setNewCategory] = useState("announcement");
//   const [newFile, setNewFile] = useState(null);
//   const [creating, setCreating] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [createError, setCreateError] = useState("");

//   const fetchNews = async () => {
//     try {
//       setLoading(true);

//       const params = new URLSearchParams({
//         page: "1",
//         limit: "20",
//         category: "all",
//       });

//       const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
//         credentials: "include",
//       });

//       if (!res.ok) {
//         throw new Error("Failed to fetch news");
//       }

//       const data = await res.json();
//       setItems(data.items || []);
//     } catch (err) {
//       console.error("Failed to fetch news", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNews();
//   }, []);

//   const handleTopButton = (value) => {
//     if (value === "all") {
//       fetchNews();
//     } else if (value === "announcement") {
//       navigate("/news/university-updates");
//     } else if (value === "achievement") {
//       navigate("/news/alumni-achievements");
//     } else if (value === "event") {
//       navigate("/news/upcoming-events");
//     }
//   };

//   const formatCategory = (cat) => {
//     if (cat === "announcement") return "University Update";
//     if (cat === "achievement") return "Alumni Achievement";
//     if (cat === "event") return "Event";
//     return cat;
//   };

//   const events = items.filter((i) => i.category === "event");
//   const announcements = items.filter((i) => i.category === "announcement");
//   const achievements = items.filter((i) => i.category === "achievement");

//   const latestPosts = items.slice(0, 5);

//   // Cloudinary upload helper
//   const uploadToCloudinary = async (file) => {
//     const data = new FormData();
//     data.append("file", file);
//     data.append("upload_preset", "bracu_net"); // Cloudinary preset name
//     data.append("folder", "bracunet_news");

//     const res = await fetch(
//       "https://api.cloudinary.com/v1_1/dg0xhxxla/image/upload",
//       {
//         method: "POST",
//         body: data,
//       }
//     );

//     const json = await res.json();
//     if (!res.ok) {
//       throw new Error(json.error?.message || "Image upload failed");
//     }
//     return json.secure_url;
//   };

//   const handleCreatePost = async () => {
//     if (!newTitle.trim() || !newBody.trim()) return;

//     try {
//       setCreating(true);
//       setCreateError("");

//       let imageUrl = null;
//       if (newFile) {
//         setUploadingImage(true);
//         imageUrl = await uploadToCloudinary(newFile);
//         setUploadingImage(false);
//       }

//       const res = await fetch(`${API_BASE}/api/news`, {
//         method: "POST",
//         credentials: "include",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           title: newTitle,
//           body: newBody,
//           category: newCategory,
//           image: imageUrl,
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data?.message || "Failed to create news");
//       }

//       setNewTitle("");
//       setNewBody("");
//       setNewCategory("announcement");
//       setNewFile(null);

//       fetchNews();

//       alert("Post submitted! It will appear after admin approval.");
//     } catch (err) {
//       setCreateError(err.message);
//       setUploadingImage(false);
//     } finally {
//       setCreating(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
//       {/* header navbar */}
//       <nav className="bg-white shadow">
//         <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
//           <h1 className="text-xl font-bold text-blue-600">BracuNet</h1>
//           <button
//             onClick={() => navigate("/dashboard")}
//             className="text-sm text-blue-600 font-semibold hover:text-blue-700"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </nav>

//       <div className="max-w-6xl mx-auto px-4 py-6">
//         <h2 className="text-2xl font-bold text-white mb-1">
//           Newsfeed &amp; Announcement Board
//         </h2>
//         <p className="text-sm text-white/90 mb-4">
//           University updates, alumni achievements, and upcoming events at one
//           place.
//         </p>

//         {/* top buttons */}
//         <div className="flex flex-wrap gap-2 mb-6">
//           {categories.map((c) => (
//             <button
//               key={c.value}
//               onClick={() => handleTopButton(c.value)}
//               className="px-3 py-1 rounded-full text-sm border bg-white/90 text-gray-800 border-white/80 hover:bg-blue-50"
//             >
//               {c.label}
//             </button>
//           ))}
//         </div>

//         {/* three-column layout */}
//         <div className="grid gap-4 md:grid-cols-4">
//           {/* left column */}
//           <div className="md:col-span-1 space-y-4">
//             <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
//               <h3 className="text-sm font-semibold text-white mb-2">
//                 Latest News
//               </h3>
//               <ul className="space-y-2 text-xs text-white/90">
//                 {announcements.slice(0, 5).map((item) => (
//                   <li
//                     key={item._id}
//                     className="border-b border-white/20 pb-1 last:border-none"
//                   >
//                     <p className="truncate">{item.title}</p>
//                   </li>
//                 ))}
//                 {announcements.length === 0 && (
//                   <li className="text-white/70">No news yet.</li>
//                 )}
//               </ul>
//             </section>

//             <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
//               <h3 className="text-sm font-semibold text-white mb-2">
//                 Upcoming Events
//               </h3>
//               <ul className="space-y-2 text-xs text-white/90">
//                 {events.slice(0, 5).map((item) => (
//                   <li
//                     key={item._id}
//                     className="border-b border-white/20 pb-1 last:border-none"
//                   >
//                     <p className="truncate">{item.title}</p>
//                   </li>
//                 ))}
//                 {events.length === 0 && (
//                   <li className="text-white/70">No upcoming events.</li>
//                 )}
//               </ul>
//             </section>
//           </div>

//           {/* middle column */}
//           <div className="md:col-span-2 space-y-4">
//             {/* create post box */}
//             <div className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
//               <p className="text-sm font-semibold text-white mb-2">
//                 Create your post here:
//               </p>

//               {createError && (
//                 <p className="text-xs text-red-200 mb-2">{createError}</p>
//               )}

//               <input
//                 className="w-full mb-2 px-3 py-2 rounded-lg bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Title (e.g. CSE Fest 2025)"
//                 value={newTitle}
//                 onChange={(e) => setNewTitle(e.target.value)}
//               />

//               <textarea
//                 className="w-full h-20 rounded-lg bg-white/80 mb-2 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Write details of your announcement, event, or achievement..."
//                 value={newBody}
//                 onChange={(e) => setNewBody(e.target.value)}
//               />

//               <div className="flex items-center gap-2 mb-2">
//                 <span className="text-xs text-white/80">Category:</span>
//                 <select
//                   className="text-xs px-2 py-1 rounded bg-white/80"
//                   value={newCategory}
//                   onChange={(e) => setNewCategory(e.target.value)}
//                 >
//                   <option value="announcement">University Update</option>
//                   <option value="achievement">Alumni Achievement</option>
//                   <option value="event">Event</option>
//                 </select>
//               </div>

//               <input
//                 type="file"
//                 accept="image/*"
//                 className="w-full mb-3 text-xs text-white/90"
//                 onChange={(e) => setNewFile(e.target.files[0] || null)}
//               />

//               <button
//                 onClick={handleCreatePost}
//                 disabled={
//                   creating || uploadingImage || !newTitle.trim() || !newBody.trim()
//                 }
//                 className="w-full py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-60"
//               >
//                 {creating
//                   ? uploadingImage
//                     ? "Uploading image..."
//                     : "Submitting..."
//                   : "POST"}
//               </button>
//             </div>

//             {/* latest posts – click = details */}
//             <section className="space-y-3">
//               <h3 className="text-lg font-semibold text-white">
//                 Latest Posts
//               </h3>
//               {loading && <p className="text-white/80">Loading...</p>}
//               {latestPosts.map((item) => (
//                 <Link
//                   key={item._id}
//                   to={`/news/${item._id}`}
//                   className="block bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 hover:shadow-xl hover:-translate-y-0.5 transition"
//                 >
//                   {item.image && (
//                     <img
//                       src={item.image}
//                       alt={item.title}
//                       className="w-full h-40 object-cover rounded-xl mb-2"
//                     />
//                   )}
//                   <div className="flex justify-between items-center mb-1">
//                     <h4 className="font-semibold text-sm text-white">
//                       {item.title}
//                     </h4>
//                     <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
//                       {formatCategory(item.category)}
//                     </span>
//                   </div>
//                   <p className="text-xs text-white/80 mb-2">
//                     {item.createdAt
//                       ? new Date(item.createdAt).toLocaleString()
//                       : ""}
//                   </p>
//                   <p className="text-sm text-white/90 line-clamp-3">
//                     {item.body}
//                   </p>
//                 </Link>
//               ))}
//               {!loading && latestPosts.length === 0 && (
//                 <p className="text-white/80">No posts yet.</p>
//               )}
//             </section>
//           </div>

//           {/* right column */}
//           <div className="md:col-span-1 space-y-4">
//             <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
//               <h3 className="text-sm font-semibold text-white mb-2">
//                 Announcements
//               </h3>
//               <ol className="list-decimal list-inside space-y-1 text-xs text-white/90">
//                 {announcements.slice(0, 5).map((item) => (
//                   <li key={item._id}>
//                     <p className="truncate">{item.title}</p>
//                   </li>
//                 ))}
//                 {announcements.length === 0 && (
//                   <li className="text-white/70">No announcements.</li>
//                 )}
//               </ol>
//             </section>

//             <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
//               <h3 className="text-sm font-semibold text-white mb-2">
//                 Alumni Achievements
//               </h3>
//               <ol className="list-decimal list-inside space-y-1 text-xs text-white/90">
//                 {achievements.slice(0, 5).map((item) => (
//                   <li key={item._id}>
//                     <p className="truncate">{item.title}</p>
//                   </li>
//                 ))}
//                 {achievements.length === 0 && (
//                   <li className="text-white/70">No achievements yet.</li>
//                 )}
//               </ol>
//             </section>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default NewsList;
// src/pages/NewsList.jsx
// src/pages/NewsList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

const categories = [
  { value: "all", label: "All" },
  { value: "announcement", label: "University Updates" },
  { value: "achievement", label: "Alumni Achievements" },
  { value: "event", label: "Upcoming Events" },
];

function NewsList() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // create-post form state
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState("announcement");
  const [newFile, setNewFile] = useState(null);
  const [creating, setCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createError, setCreateError] = useState("");

  const fetchNews = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: "1",
        limit: "20",
        category: "all",
      });

      const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error("Failed to fetch news", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

  const formatCategory = (cat) => {
    if (cat === "announcement") return "University Update";
    if (cat === "achievement") return "Alumni Achievement";
    if (cat === "event") return "Event";
    return cat;
  };

  const events = items.filter((i) => i.category === "event");
  const announcements = items.filter((i) => i.category === "announcement");
  const achievements = items.filter((i) => i.category === "achievement");

  const latestPosts = items.slice(0, 5);

  // Cloudinary upload helper
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

      fetchNews();

      alert("Post submitted! It will appear after admin approval.");
    } catch (err) {
      setCreateError(err.message);
      setUploadingImage(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* header navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">BracuNet</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            Back to Dashboard
          </button>
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

        {/* three-column layout */}
        <div className="grid gap-4 md:grid-cols-4">
          {/* left column */}
          <div className="md:col-span-1 space-y-4">
            {/* Latest News (title only or small thumb, as you like) */}
            <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">
                Latest News
              </h3>
              <ul className="space-y-2 text-xs text-white/90">
                {announcements.slice(0, 5).map((item) => (
                  <li
                    key={item._id}
                    className="border-b border-white/20 pb-1 last:border-none"
                  >
                    <p className="truncate">{item.title}</p>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <li className="text-white/70">No news yet.</li>
                )}
              </ul>
            </section>

            {/* Upcoming Events – full image */}
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
                  <p className="text-white/70 text-xs">No upcoming events.</p>
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

            {/* latest posts – static cards, no Link */}
            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-white">
                Latest Posts
              </h3>
              {loading && <p className="text-white/80">Loading...</p>}
              {latestPosts.map((item) => (
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
                    <h4 className="font-semibold text-sm text-white">
                      {item.title}
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {formatCategory(item.category)}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mb-2">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : ""}
                  </p>
                  <p className="text-sm text-white/90 line-clamp-3">
                    {item.body}
                  </p>
                </div>
              ))}
              {!loading && latestPosts.length === 0 && (
                <p className="text-white/80">No posts yet.</p>
              )}
            </section>
          </div>

          {/* right column */}
          <div className="md:col-span-1 space-y-4">
            {/* Announcements (title only or small thumb) */}
            <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">
                Announcements
              </h3>
              <ol className="space-y-1 text-xs text-white/90">
                {announcements.slice(0, 5).map((item, idx) => (
                  <li key={item._id} className="flex items-center gap-2">
                    <span>{idx + 1}.</span>
                    <p className="truncate">{item.title}</p>
                  </li>
                ))}
                {announcements.length === 0 && (
                  <li className="text-white/70">No announcements.</li>
                )}
              </ol>
            </section>

            {/* Alumni achievements */}
            <section className="bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">
                Alumni Achievements
              </h3>
              <ol className="space-y-1 text-xs text-white/90">
                {achievements.slice(0, 5).map((item, idx) => (
                  <li key={item._id} className="flex items-center gap-2">
                    <span>{idx + 1}.</span>
                    <p className="truncate">{item.title}</p>
                  </li>
                ))}
                {achievements.length === 0 && (
                  <li className="text-white/70">No achievements yet.</li>
                )}
              </ol>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsList;
