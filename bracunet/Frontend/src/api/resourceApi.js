import API from "./api";

const resourceApi = {
  getAllResources: async (page = 1, limit = 12, category = null, type = null) => {
    const params = new URLSearchParams({ page, limit });

    if (category) params.append("category", category);
    if (type) params.append("type", type);

    const { data } = await API.get(`/resources?${params.toString()}`);
    return data;
  },

  getResourceById: async (resourceId) => {
    const { data } = await API.get(`/resources/${resourceId}`);
    return data;
  },

  uploadResource: async (formData) => {
    const { data } = await API.post("/resources", formData);
    return data;
  },

  upvoteResource: async (resourceId) => {
    const { data } = await API.put(`/resources/${resourceId}/upvote`);
    return data;
  },

  trackDownload: async (resourceId) => {
    const { data } = await API.put(`/resources/${resourceId}/download`);
    return data;
  },

  addComment: async (resourceId, commentData) => {
    const { data } = await API.post(`/resources/${resourceId}/comment`, commentData);
    return data;
  },
};

export default resourceApi;
