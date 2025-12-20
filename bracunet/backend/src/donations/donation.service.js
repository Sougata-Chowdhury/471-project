import Stripe from 'stripe';
import { config } from '../config/index.js';
import { DonationCampaign, Donation } from './donation.model.js';
import { User } from '../users/user.model.js';

// Initialize Stripe (will be configured via environment variables)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

export const donationService = {
  // Create a new donation campaign
  async createCampaign(campaignData, userId) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.isVerified) {
        throw new Error('Only verified users can create donation campaigns');
      }

      const campaign = new DonationCampaign({
        ...campaignData,
        creator: userId,
      });

      await campaign.save();
      await campaign.populate('creator', 'name email role');
      return campaign;
    } catch (error) {
      throw error;
    }
  },

  // Get all active campaigns
  async getAllCampaigns(filters = {}) {
    try {
      const query = { status: 'active' };

      if (filters.category) {
        query.category = filters.category;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const campaigns = await DonationCampaign.find(query)
        .populate('creator', 'name email role')
        .sort({ createdAt: -1 });

      return campaigns;
    } catch (error) {
      throw error;
    }
  },

  // Get a single campaign by ID
  async getCampaignById(campaignId) {
    try {
      const campaign = await DonationCampaign.findById(campaignId)
        .populate('creator', 'name email role')
        .populate({
          path: 'donations',
          populate: {
            path: 'donor',
            select: 'name email',
          },
        });

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      return campaign;
    } catch (error) {
      throw error;
    }
  },

  // Get campaigns created by a specific user
  async getCampaignsByUser(userId) {
    try {
      const campaigns = await DonationCampaign.find({ creator: userId })
        .populate('creator', 'name email role')
        .sort({ createdAt: -1 });

      return campaigns;
    } catch (error) {
      throw error;
    }
  },

  // Update a campaign
  async updateCampaign(campaignId, userId, updateData) {
    try {
      const campaign = await DonationCampaign.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.creator.toString() !== userId) {
        throw new Error('You are not authorized to update this campaign');
      }

      // Prevent updating certain fields
      delete updateData.currentAmount;
      delete updateData.creator;
      delete updateData.donations;

      Object.assign(campaign, updateData);
      await campaign.save();
      await campaign.populate('creator', 'name email role');

      return campaign;
    } catch (error) {
      throw error;
    }
  },

  // Delete a campaign
  async deleteCampaign(campaignId, userId) {
    try {
      const campaign = await DonationCampaign.findById(campaignId);

      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.creator.toString() !== userId) {
        throw new Error('You are not authorized to delete this campaign');
      }

      if (campaign.currentAmount > 0) {
        throw new Error('Cannot delete a campaign that has received donations');
      }

      await campaign.deleteOne();
      return { message: 'Campaign deleted successfully' };
    } catch (error) {
      throw error;
    }
  },

  // Create a Stripe Checkout Session for donation
  async createCheckoutSession(campaignId, donorId, amount, message, isAnonymous) {
    try {
      const campaign = await DonationCampaign.findById(campaignId).populate('creator', 'name');
      if (!campaign) {
        throw new Error('Campaign not found');
      }

      if (campaign.status !== 'active') {
        throw new Error('This campaign is not accepting donations');
      }

      const user = await User.findById(donorId);
      if (!user || !user.isVerified) {
        throw new Error('Only verified users can make donations');
      }

      // Create a pending donation record
      const donation = new Donation({
        campaign: campaignId,
        donor: donorId,
        amount,
        message,
        isAnonymous,
        paymentStatus: 'pending',
      });
      await donation.save();

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: campaign.currency.toLowerCase(),
              product_data: {
                name: `Donation to: ${campaign.title}`,
                description: `Support ${campaign.creator.name}'s fundraising campaign`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donations/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/donations/${campaignId}`,
        metadata: {
          campaignId: campaignId,
          donorId: donorId,
          donationId: donation._id.toString(),
        },
      });

      // Update donation with session ID
      donation.stripeSessionId = session.id;
      await donation.save();

      return {
        sessionId: session.id,
        url: session.url,
        donationId: donation._id,
      };
    } catch (error) {
      throw error;
    }
  },

  // Handle successful payment (webhook or manual confirmation)
  async confirmPayment(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        throw new Error('Payment not completed');
      }

      const { campaignId, donationId } = session.metadata;

      const donation = await Donation.findById(donationId);
      if (!donation) {
        throw new Error('Donation record not found');
      }

      if (donation.paymentStatus === 'completed') {
        return { message: 'Payment already processed', donation };
      }

      // Update donation status
      donation.paymentStatus = 'completed';
      donation.stripePaymentIntentId = session.payment_intent;
      await donation.save();

      // Update campaign
      const campaign = await DonationCampaign.findById(campaignId);
      campaign.currentAmount += donation.amount;
      campaign.donorsCount += 1;
      campaign.donations.push(donation._id);

      if (campaign.currentAmount >= campaign.goalAmount) {
        campaign.status = 'completed';
      }

      await campaign.save();

      return {
        message: 'Donation confirmed successfully',
        donation: await donation.populate('donor', 'name email'),
        campaign,
      };
    } catch (error) {
      throw error;
    }
  },

  // Get donations made by a user
  async getDonationsByUser(userId) {
    try {
      const donations = await Donation.find({ donor: userId, paymentStatus: 'completed' })
        .populate('campaign', 'title description goalAmount currentAmount')
        .sort({ createdAt: -1 });

      return donations;
    } catch (error) {
      throw error;
    }
  },

  // Get donations for a campaign
  async getDonationsForCampaign(campaignId) {
    try {
      const donations = await Donation.find({
        campaign: campaignId,
        paymentStatus: 'completed',
      })
        .populate('donor', 'name email')
        .sort({ createdAt: -1 });

      return donations;
    } catch (error) {
      throw error;
    }
  },
};
