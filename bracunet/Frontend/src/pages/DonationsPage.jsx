import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '../api/donationApi';
import { useAuth } from '../hooks/useAuth';
import { io } from 'socket.io-client';
import config from '../config';

export const DonationsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'education', label: 'Education' },
    { value: 'medical', label: 'Medical' },
    { value: 'community', label: 'Community' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'research', label: 'Research' },
    { value: 'other', label: 'Other' },
  ];

  // Check if user is verified
  if (!user?.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center">
            <div className="text-yellow-300 text-6xl mb-4">🔒</div>
            <h1 className="text-3xl font-bold text-white mb-4">Verification Required</h1>
            <p className="text-white/90 text-lg mb-6">
              You must be a verified user to access the Donation & Fundraising portal. 
              Please complete the verification process to create campaigns and support causes.
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
    loadCampaigns();

    // Socket.io for real-time campaign updates
    const socket = io(config.socketUrl);

    socket.on('campaign_created', (data) => {
      console.log('Real-time: New campaign created:', data);
      loadCampaigns();
    });

    socket.on('donation_received', (data) => {
      console.log('Real-time: Donation received:', data);
      loadCampaigns();
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedCategory, searchTerm]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await donationApi.getAllCampaigns({
        category: selectedCategory,
        search: searchTerm,
      });
      setCampaigns(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleCreateCampaign = () => {
    if (!user?.isVerified) {
      alert('Only verified users can create campaigns. Please get verified first.');
      return;
    }
    navigate('/donations/create');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">💝 Donation & Fundraising Portal</h1>
              <p className="text-white/90">Support causes that matter to our community</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={() => navigate('/donations/my-campaigns')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                My Campaigns
              </button>
              <button
                onClick={() => navigate('/donations/my-donations')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                My Donations
              </button>
              <button
                onClick={handleCreateCampaign}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                + Create Campaign
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-gray-800">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center text-white text-xl">Loading campaigns...</div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && !error && (
          <>
            {campaigns.length === 0 ? (
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-12">
                <p className="text-white text-xl mb-4">No campaigns found</p>
                <button
                  onClick={handleCreateCampaign}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
                >
                  Create the First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign._id}
                    className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => navigate(`/donations/campaign/${campaign._id}`)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-white line-clamp-2">
                          {campaign.title}
                        </h3>
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full whitespace-nowrap ml-2">
                          {campaign.category}
                        </span>
                      </div>
                      
                      <p className="text-white/80 text-sm mb-4 line-clamp-3">
                        {campaign.description}
                      </p>

                      <div className="mb-4">
                        <div className="flex justify-between text-white text-sm mb-2">
                          <span className="font-semibold">
                            {formatCurrency(campaign.currentAmount)}
                          </span>
                          <span>Goal: {formatCurrency(campaign.goalAmount)}</span>
                        </div>
                        <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(campaign.progressPercentage)} transition-all`}
                            style={{ width: `${Math.min(100, campaign.progressPercentage)}%` }}
                          />
                        </div>
                        <p className="text-white/80 text-xs mt-1">
                          {campaign.progressPercentage}% funded
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-white/70 text-sm">
                        <span>👥 {campaign.donorsCount} donors</span>
                        <span>by {campaign.creator?.name}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
