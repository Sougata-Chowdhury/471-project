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
import { API_BASE } from '../config.js';
const API_BASE_WITH_PATH = `${API_BASE}/api`;

async function request(path, options = {}) {
  const url = path.startsWith('/') ? `${API_BASE_WITH_PATH}${path}` : `${API_BASE_WITH_PATH}/${path}`;
  
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
// forum group posts helper moved to src/api/forum.js to avoid name collisions
// export const getGroupPosts = (groupId) => API.get(`/forums/groups/${groupId}/posts`);
export const createPost = (data) => API.post("/forums/posts", data);
export const getPostComments = (postId) => API.get(`/forums/posts/${postId}/comments`);
export const addComment = (data) => API.post("/forums/comments", data);
export const upvotePost = (id) => API.post(`/forums/posts/${id}/upvote`);
export const upvoteComment = (id) => API.post(`/forums/comments/${id}/upvote`);
export const createGroup = (data) => API.post("/forums/groups", data);
// Create an interest group (backend mounted at /api/groups -> route /groups)
export const createInterestGroup = (data) => API.post('/groups/groups', data);

// Groups & Group Messages (use backend /api/groups and /api/group-messages)
export const fetchGroups = () => API.get('/groups/groups');
export const requestJoinGroup = (id) => API.post(`/groups/${id}/join`);
export const createGroupMeeting = (id) => API.post(`/groups/${id}/meetings`);

export const fetchGroupMessages = (groupId) => API.get(`/group-messages/${groupId}/messages`);
export const postGroupMessage = (groupId, body) => API.post(`/group-messages/${groupId}/messages`, body);

// Admin: group join requests
export const getGroupRequests = (groupId) => API.get(`/groups/${groupId}/requests`);
export const approveJoinRequest = (groupId, userId) => API.post(`/groups/${groupId}/approve/${userId}`);
export const rejectJoinRequest = (groupId, userId) => API.post(`/groups/${groupId}/reject/${userId}`);

// Group posts (feed)
export const getGroupPosts = (groupId) => API.get(`/groups/${groupId}/posts`);
export const createGroupPost = (groupId, body) => API.post(`/groups/${groupId}/posts`, body);
export const reactToPost = (postId, body) => API.post(`/posts/${postId}/react`, body);
export const addPostComment = (postId, body) => API.post(`/posts/${postId}/comments`, body);

// Group details
export const getGroupDetails = (groupId) => API.get(`/groups/${groupId}/details`);

// Meeting token
export const createMeetingToken = (groupId, roomName) => API.post(`/groups/${groupId}/meetings/${roomName}/token`);

// Add this named export
export const setAuthToken = (token) => {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
};

export default API;
