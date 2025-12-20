import { donationService } from './donation.service.js';

export const donationController = {
  // Create a new donation campaign
  async createCampaign(req, res) {
    try {
      const campaign = await donationService.createCampaign(req.body, req.user.id);
      res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get all campaigns
  async getAllCampaigns(req, res) {
    try {
      const { category, search } = req.query;
      const campaigns = await donationService.getAllCampaigns({ category, search });
      res.status(200).json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get a single campaign
  async getCampaign(req, res) {
    try {
      const campaign = await donationService.getCampaignById(req.params.id);
      res.status(200).json({
        success: true,
        data: campaign,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get campaigns by current user
  async getMyCampaigns(req, res) {
    try {
      const campaigns = await donationService.getCampaignsByUser(req.user.id);
      res.status(200).json({
        success: true,
        data: campaigns,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Update a campaign
  async updateCampaign(req, res) {
    try {
      const campaign = await donationService.updateCampaign(
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Campaign updated successfully',
        data: campaign,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete a campaign
  async deleteCampaign(req, res) {
    try {
      await donationService.deleteCampaign(req.params.id, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Campaign deleted successfully',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Create a checkout session for donation
  async createCheckoutSession(req, res) {
    try {
      const { campaignId, amount, message, isAnonymous } = req.body;
      const result = await donationService.createCheckoutSession(
        campaignId,
        req.user.id,
        amount,
        message || '',
        isAnonymous || false
      );
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Confirm payment after successful checkout
  async confirmPayment(req, res) {
    try {
      const { sessionId } = req.body;
      const result = await donationService.confirmPayment(sessionId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get user's donation history
  async getMyDonations(req, res) {
    try {
      const donations = await donationService.getDonationsByUser(req.user.id);
      res.status(200).json({
        success: true,
        data: donations,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Get donations for a specific campaign
  async getCampaignDonations(req, res) {
    try {
      const donations = await donationService.getDonationsForCampaign(req.params.id);
      res.status(200).json({
        success: true,
        data: donations,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  },
};
