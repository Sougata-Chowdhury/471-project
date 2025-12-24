import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { donationApi } from '../api/donationApi';
import { useAuth } from '../hooks/useAuth';
import { io } from 'socket.io-client';
import config from '../config';

export const CampaignDetailPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donateAmount, setDonateAmount] = useState('');
  const [donateMessage, setDonateMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is verified
  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-300 text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-white mb-4">Verification Required</h1>
            <p className="text-white/90 text-lg mb-6">
              You must be a verified user to view campaigns and make donations. 
              Please complete the verification process first.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/verification-request')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Request Verification
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadCampaignData();
  }, [id]);

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      const [campaignRes, donationsRes] = await Promise.all([
        donationApi.getCampaign(id),
        donationApi.getCampaignDonations(id),
      ]);
      setCampaign(campaignRes.data);
      setDonations(donationsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!user?.isVerified) {
      alert('Only verified users can make donations. Please get verified first.');
      return;
    }

    if (!donateAmount || parseFloat(donateAmount) < 1) {
      alert('Please enter a valid donation amount (minimum $1)');
      return;
    }

    setProcessing(true);
    try {
      const response = await donationApi.createCheckoutSession({
        campaignId: id,
        amount: parseFloat(donateAmount),
        message: donateMessage,
        isAnonymous,
      });

      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process donation');
      setProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading campaign...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center">
          <p className="text-white text-xl mb-4">{error || 'Campaign not found'}</p>
          <button
            onClick={() => navigate('/donations')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
          >
            Back to Donations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/donations')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition mb-4"
        >
          ← Back to All Campaigns
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Details */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-white">{campaign.title}</h1>
                <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                  {campaign.category}
                </span>
              </div>

              <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
                <span>Created by: <strong>{campaign.creator?.name}</strong></span>
                <span>•</span>
                <span>{formatDate(campaign.createdAt)}</span>
                {campaign.deadline && (
                  <>
                    <span>•</span>
                    <span>Deadline: {formatDate(campaign.deadline)}</span>
                  </>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-white/90 text-lg whitespace-pre-wrap">{campaign.description}</p>
              </div>
            </div>

            {/* Donations List */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">
                Recent Donations ({donations.length})
              </h2>
              {donations.length === 0 ? (
                <p className="text-white/80">No donations yet. Be the first to support!</p>
              ) : (
                <div className="space-y-4">
                  {donations.slice(0, 10).map((donation) => (
                    <div
                      key={donation._id}
                      className="bg-white/10 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-semibold">
                          {donation.isAnonymous ? 'Anonymous' : donation.donor?.name}
                        </p>
                        {donation.message && (
                          <p className="text-white/70 text-sm italic">"{donation.message}"</p>
                        )}
                        <p className="text-white/60 text-xs">{formatDate(donation.createdAt)}</p>
                      </div>
                      <span className="text-white font-bold text-lg">
                        {formatCurrency(donation.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <div className="flex justify-between text-white text-2xl font-bold mb-2">
                  <span>{formatCurrency(campaign.currentAmount)}</span>
                </div>
                <p className="text-white/80 text-sm mb-4">
                  raised of {formatCurrency(campaign.goalAmount)} goal
                </p>
                <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(campaign.progressPercentage)} transition-all`}
                    style={{ width: `${Math.min(100, campaign.progressPercentage)}%` }}
                  />
                </div>
                <p className="text-white/80 text-sm mt-2">
                  {campaign.progressPercentage}% funded
                </p>
              </div>

              <div className="border-t border-white/30 pt-4 mb-4">
                <p className="text-white text-lg">
                  <strong>{campaign.donorsCount}</strong> donors
                </p>
              </div>

              <button
                onClick={() => setShowDonateModal(true)}
                disabled={campaign.status !== 'active'}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg transition font-bold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {campaign.status === 'active' ? 'Donate Now' : 'Campaign Closed'}
              </button>
            </div>

            {/* Creator Info */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Campaign Creator</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {campaign.creator?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-semibold">{campaign.creator?.name}</p>
                  <p className="text-white/70 text-sm capitalize">{campaign.creator?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      {showDonateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Make a Donation</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Donation Amount (USD) *
                </label>
                <input
                  type="number"
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setDonateAmount(amount.toString())}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={donateMessage}
                  onChange={(e) => setDonateMessage(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave a message of support"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700">Make this donation anonymous</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDonate}
                disabled={processing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Proceed to Payment'}
              </button>
              <button
                onClick={() => setShowDonateModal(false)}
                disabled={processing}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
            </div>

            <p className="text-gray-600 text-xs mt-4 text-center">
              You will be redirected to Stripe to complete your payment securely
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
