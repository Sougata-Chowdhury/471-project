import express from 'express';
import { donationController } from './donation.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Campaign routes
router.post('/campaigns', protect, donationController.createCampaign);
router.get('/campaigns', donationController.getAllCampaigns);
router.get('/campaigns/my', protect, donationController.getMyCampaigns);
router.get('/campaigns/:id', donationController.getCampaign);
router.put('/campaigns/:id', protect, donationController.updateCampaign);
router.delete('/campaigns/:id', protect, donationController.deleteCampaign);

// Donation routes
router.post('/checkout', protect, donationController.createCheckoutSession);
router.post('/confirm-payment', protect, donationController.confirmPayment);
router.get('/my-donations', protect, donationController.getMyDonations);
router.get('/campaigns/:id/donations', donationController.getCampaignDonations);

export default router;
