// src/api/newsApi.js
import API from './api';

export async function getAllNews({ page = 1, limit = 9, category = "all" } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    category,
  });

  const res = await API.get(`/news?${params.toString()}`);
  return res.data; // { items, total, page, limit, totalPages }
}

export async function getNewsById(id) {
  const res = await API.get(`/news/${id}`);
  return res.data; // { success, news }
}
