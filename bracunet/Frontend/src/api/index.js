// const API_BASE = "http://localhost:3000/api";
// import API, { setAuthToken } from "../api";


// async function request(path, options = {}) {
//   const url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
//   const res = await fetch(url, {
//     credentials: 'include',
//     ...options,
//   });

//   const contentType = res.headers.get('content-type') || '';
//   let data = null;
//   if (contentType.includes('application/json')) {
//     data = await res.json();
//   } else {
//     data = await res.text();
//   }

//   if (!res.ok) {
//     const err = new Error(data?.message || 'Request failed');
//     err.status = res.status;
//     err.data = data;
//     throw err;
//   }

//   return { data, status: res.status };
// }

// export default {
//   get: (path, opts) => request(path, { method: 'GET', ...opts }),
//   post: (path, body, opts = {}) => {
//     const headers = opts.headers || {};
//     const init = {
//       method: 'POST',
//       headers,
//       body,
//       ...opts,
//     };
//     // if body is FormData, do NOT set Content-Type header (fetch will set it automatically with boundary)
//     if (body instanceof FormData) {
//       delete init.headers['Content-Type']; // Remove explicit Content-Type for FormData
//     } else if (body && typeof body === 'object') {
//       // For plain objects, stringify and set JSON header
//       init.headers = { 'Content-Type': 'application/json', ...init.headers };
//       init.body = JSON.stringify(body);
//     }
//     return request(path, init);
//   },
//   put: (path, body, opts = {}) => {
//     const headers = opts.headers || {};
//     const init = {
//       method: 'PUT',
//       headers,
//       body,
//       ...opts,
//     };
//     if (body && !(body instanceof FormData) && typeof body === 'object') {
//       init.headers = { 'Content-Type': 'application/json', ...init.headers };
//       init.body = JSON.stringify(body);
//     }
//     return request(path, init);
//   },
//   delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
// };




// src/api/index.js
const API_BASE = "http://localhost:3000/api";

async function request(path, options = {}) {
  const url = path.startsWith('/') ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  
  // Add Bearer token to headers if available
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { 
    credentials: 'include',
    ...options,
    headers 
  });

  const contentType = res.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return { data, status: res.status };
}

// Main API object
const API = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts = {}) => {
    const headers = opts.headers || {};
    const init = { method: 'POST', headers, body, ...opts };
    if (body instanceof FormData) delete init.headers['Content-Type'];
    else if (body && typeof body === 'object') {
      init.headers = { 'Content-Type': 'application/json', ...init.headers };
      init.body = JSON.stringify(body);
    }
    return request(path, init);
  },
  put: (path, body, opts = {}) => {
    const headers = opts.headers || {};
    const init = { method: 'PUT', headers, body, ...opts };
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      init.headers = { 'Content-Type': 'application/json', ...init.headers };
      init.body = JSON.stringify(body);
    }
    return request(path, init);
  },
  delete: (path, opts = {}) => request(path, { method: 'DELETE', ...opts }),
};

// Named exports for forum
export const getGroups = () => API.get("/forums/groups");
export const joinGroup = (id) => API.post(`/forums/groups/${id}/join`);
export const getGroupPosts = (groupId) => API.get(`/forums/groups/${groupId}/posts`);
export const createPost = (data) => API.post("/forums/posts", data);
export const getPostComments = (postId) => API.get(`/forums/posts/${postId}/comments`);
export const addComment = (data) => API.post("/forums/comments", data);
export const upvotePost = (id) => API.post(`/forums/posts/${id}/upvote`);
export const upvoteComment = (id) => API.post(`/forums/comments/${id}/upvote`);
export const createGroup = (data) => API.post("/forums/groups", data);

// Add this named export
export const setAuthToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

export default API;
