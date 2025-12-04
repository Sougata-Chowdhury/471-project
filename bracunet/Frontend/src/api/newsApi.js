// src/api/newsApi.js
const API_BASE = "http://localhost:3000";

export async function getAllNews({ page = 1, limit = 9, category = "all" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    category,
  });

  const res = await fetch(`${API_BASE}/api/news?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch news");
  }

  return res.json(); // { items, total, page, limit, totalPages }
}

export async function getNewsById(id) {
  const res = await fetch(`${API_BASE}/api/news/${id}`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch news item");
  }
  return res.json(); // { success, news }
}
