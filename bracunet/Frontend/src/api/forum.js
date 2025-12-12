import API from "./api.js";

// Groups
export const getGroups = () => API.get("/forums/groups");
export const createGroup = (data) => API.post("/forums/groups", data);
export const joinGroup = (id) => API.post(`/forums/groups/${id}/join`);
export const approveJoin = (groupId, userId) => API.post(`/forums/groups/${groupId}/approve/${userId}`);
export const rejectJoin = (groupId, userId) => API.post(`/forums/groups/${groupId}/reject/${userId}`);

// Posts
export const getGroupPosts = (groupId) => API.get(`/forums/groups/${groupId}/posts`);
export const createPost = (groupId, data) => API.post(`/forums/groups/${groupId}/posts`, data);
export const addComment = (postId, data) => API.post(`/forums/posts/${postId}/comments`, data);
export const reactPost = (postId) => API.post(`/forums/posts/${postId}/react`);

// **Add this for fetching comments**
// export const getPostComments = (postId) => API.get(`/forums/posts/${postId}/comments`);
