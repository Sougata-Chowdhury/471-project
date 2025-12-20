import api from './api';

export const donationApi = {
  // Campaign APIs
  async createCampaign(campaignData) {
    const response = await api.post('/donations/campaigns', campaignData);
    return response.data;
  },

  async getAllCampaigns(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/donations/campaigns?${params.toString()}`);
    return response.data;
  },

  async getCampaign(id) {
    const response = await api.get(`/donations/campaigns/${id}`);
    return response.data;
  },

  async getMyCampaigns() {
    const response = await api.get('/donations/campaigns/my');
    return response.data;
  },

  async updateCampaign(id, updateData) {
    const response = await api.put(`/donations/campaigns/${id}`, updateData);
    return response.data;
  },

  async deleteCampaign(id) {
    const response = await api.delete(`/donations/campaigns/${id}`);
    return response.data;
  },

  // Donation APIs
  async createCheckoutSession(donationData) {
    const response = await api.post('/donations/checkout', donationData);
    return response.data;
  },

  async confirmPayment(sessionId) {
    const response = await api.post('/donations/confirm-payment', { sessionId });
    return response.data;
  },

  async getMyDonations() {
    const response = await api.get('/donations/my-donations');
    return response.data;
  },

  async getCampaignDonations(campaignId) {
    const response = await api.get(`/donations/campaigns/${campaignId}/donations`);
    return response.data;
  },
};
