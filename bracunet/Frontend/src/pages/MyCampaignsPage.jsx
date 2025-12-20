import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '../api/donationApi';
import { useAuth } from '../hooks/useAuth';

export const MyCampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
              You must be a verified user to create and manage campaigns. 
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
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const response = await donationApi.getMyCampaigns();
      setCampaigns(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await donationApi.deleteCampaign(id);
        alert('Campaign deleted successfully');
        loadCampaigns();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete campaign');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'bg-green-500 text-white',
      completed: 'bg-blue-500 text-white',
      cancelled: 'bg-red-500 text-white',
    };
    return badges[status] || 'bg-gray-500 text-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading campaigns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Campaigns</h1>
              <p className="text-white/90">Manage your fundraising campaigns</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/donations')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                ← Back
              </button>
              <button
                onClick={() => navigate('/donations/create')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                + Create New Campaign
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Campaigns List */}
        <div className="space-y-6">
          {campaigns.length === 0 ? (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-12 text-center">
              <p className="text-white text-xl mb-4">You haven't created any campaigns yet</p>
              <button
                onClick={() => navigate('/donations/create')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{campaign.title}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm">
                          {campaign.category}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm line-clamp-2">{campaign.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Raised</p>
                      <p className="text-white font-bold text-xl">{formatCurrency(campaign.currentAmount)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Goal</p>
                      <p className="text-white font-bold text-xl">{formatCurrency(campaign.goalAmount)}</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Progress</p>
                      <p className="text-white font-bold text-xl">{campaign.progressPercentage}%</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-4">
                      <p className="text-white/70 text-sm mb-1">Donors</p>
                      <p className="text-white font-bold text-xl">{campaign.donorsCount}</p>
                    </div>
                  </div>

                  <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden mb-4">
                    <div
                      className={`h-full ${getProgressColor(campaign.progressPercentage)} transition-all`}
                      style={{ width: `${Math.min(100, campaign.progressPercentage)}%` }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/donations/campaign/${campaign._id}`)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                    >
                      View Campaign
                    </button>
                    {campaign.currentAmount === 0 && (
                      <button
                        onClick={(e) => handleDelete(campaign._id, e)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
