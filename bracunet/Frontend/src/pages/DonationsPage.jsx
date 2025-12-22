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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Modern Sticky Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BracuNet
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
              )}
              <button
                onClick={() => navigate('/donations/my-campaigns')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                📋 My Campaigns
              </button>
              <button
                onClick={() => navigate('/donations/my-donations')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                💰 My Donations
              </button>
              <button
                onClick={handleCreateCampaign}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ➕ Create
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4">
            <span className="text-6xl sm:text-7xl">💝</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4">Fundraising Campaigns</h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Support meaningful causes and make a difference in our community
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="🔍 Search campaigns by title or creator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 sm:px-6 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="lg:col-span-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🏷️</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 text-sm sm:text-base appearance-none bg-white cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16 sm:py-24">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
            <p className="mt-6 text-white text-lg font-medium">Loading campaigns...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 mb-6 rounded-xl shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Campaigns Grid */}
        {!loading && !error && (
          <>
            {campaigns.length === 0 ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 sm:p-16 text-center">
                <span className="text-6xl mb-6 block">🔍</span>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Campaigns Found</h3>
                <p className="text-gray-600 mb-6">Be the first to create a campaign and make a difference!</p>
                {user?.isVerified && (
                  <button
                    onClick={handleCreateCampaign}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    ➕ Create First Campaign
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-4 py-3">
                  <p className="text-gray-700 font-semibold text-center">
                    <span className="text-2xl">💝</span> Found <span className="text-blue-600 font-bold">{campaigns.length}</span> active campaigns
                  </p>
                </div>

                {/* Campaign Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign._id}
                      className="group bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-105"
                      onClick={() => navigate(`/donations/campaign/${campaign._id}`)}
                    >
                      {/* Campaign Header */}
                      <div className="relative p-6 pb-4 bg-gradient-to-br from-blue-50 to-purple-50">
                        {/* Category Badge */}
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                            campaign.category === 'education' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                            campaign.category === 'medical' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' :
                            campaign.category === 'community' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                            campaign.category === 'emergency' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                            campaign.category === 'research' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                            'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                          }`}>
                            {campaign.category === 'education' ? '📚' : 
                             campaign.category === 'medical' ? '🏥' :
                             campaign.category === 'community' ? '🤝' :
                             campaign.category === 'emergency' ? '🚨' :
                             campaign.category === 'research' ? '🔬' : '📌'} {campaign.category}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-800 line-clamp-2 pr-24 mb-3 group-hover:text-blue-600 transition-colors">
                          {campaign.title}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                          {campaign.description}
                        </p>
                      </div>

                      {/* Campaign Progress */}
                      <div className="p-6 pt-0">
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-gray-800">
                              {formatCurrency(campaign.currentAmount)}
                            </span>
                            <span className="text-gray-600">
                              Goal: {formatCurrency(campaign.goalAmount)}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                            <div
                              className={`h-full transition-all duration-500 ${getProgressColor(campaign.progressPercentage)} shadow-md`}
                              style={{ width: `${Math.min(100, campaign.progressPercentage)}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs font-semibold text-gray-600">
                              {campaign.progressPercentage}% funded
                            </p>
                            {campaign.progressPercentage >= 100 && (
                              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                ✓ Goal Reached!
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Campaign Stats */}
                        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">👥</span>
                            <span className="text-sm font-semibold">{campaign.donorsCount} donors</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span className="text-lg">👤</span>
                            <span className="text-sm font-medium">{campaign.creator?.name}</span>
                          </div>
                        </div>

                        {/* Donate Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/donations/campaign/${campaign._id}`);
                          }}
                          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          💰 Donate Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
