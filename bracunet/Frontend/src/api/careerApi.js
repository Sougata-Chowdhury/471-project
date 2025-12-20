import API from "./api";

export const careerApi = {
  // Get all career opportunities
  getOpportunities: async () => {
    const response = await API.get("/career");
    return response.data;
  },

  // Create a new opportunity (faculty only)
  createOpportunity: async (data) => {
    const response = await API.post("/career", data);
    return response.data;
  },

  // Delete an opportunity
  deleteOpportunity: async (id) => {
    const response = await API.delete(`/career/${id}`);
    return response.data;
  },

  // Get all faculty members for recommendation requests
  getFacultyMembers: async () => {
    const response = await API.get("/recommendations/faculty");
    return response.data;
  },

  // Create a recommendation request (students/alumni only)
  createRecommendationRequest: async (data) => {
    const response = await API.post("/recommendations", data);
    return response.data;
  },

  // Get my recommendation requests
  getMyRecommendationRequests: async () => {
    const response = await API.get("/recommendations/my-requests");
    return response.data;
  },

  // Get received recommendation requests (faculty)
  getReceivedRequests: async () => {
    const response = await API.get("/recommendations/received");
    return response.data;
  },

  // Update recommendation request status (faculty)
  updateRequestStatus: async (requestId, status) => {
    const response = await API.patch(`/recommendations/${requestId}/status`, { status });
    return response.data;
  },
};

export default careerApi;
