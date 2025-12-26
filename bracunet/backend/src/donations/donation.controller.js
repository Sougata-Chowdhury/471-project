import { donationService } from './donation.service.js';
import { sanitizeError } from '../utils/errorHandler.js';

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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error fetching campaign:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(404).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
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
      console.error('Error in donation controller:', error);
      const sanitized = sanitizeError(error, process.env.NODE_ENV === 'development');
      res.status(400).json({
        success: false,
        ...sanitized
      });
    }
  },
};

