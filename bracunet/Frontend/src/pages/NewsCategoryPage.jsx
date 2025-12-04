

// export default NewsCategoryPage;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:3000";

function NewsCategoryPage({ title, category }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: "1",
        limit: "50",
        category,
      });
      const res = await fetch(`${API_BASE}/api/news?${params.toString()}`);
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
  }, [category]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">BracuNet</h1>
          <button
            onClick={() => navigate("/news")}
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
              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-64 rounded-xl mb-3 object-contain bg-white/10"
                />
              )}
              <h3 className="font-semibold text-base mb-1 text-white">
                {item.title}
              </h3>
              <p className="text-xs text-white/80 mb-2">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ""}
              </p>
              <p className="text-sm text-white/90 whitespace-pre-line">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsCategoryPage;
