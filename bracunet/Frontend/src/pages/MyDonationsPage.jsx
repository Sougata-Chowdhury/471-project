import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '../api/donationApi';
import { useAuth } from '../hooks/useAuth';

export const MyDonationsPage = () => {
  const [donations, setDonations] = useState([]);
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
              You must be a verified user to view your donation history. 
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
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const response = await donationApi.getMyDonations();
      setDonations(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donations');
    } finally {
      setLoading(false);
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

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl">Loading donations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Donations</h1>
              <p className="text-white/90">Track your contribution history</p>
            </div>
            <button
              onClick={() => navigate('/donations')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
            >
              ← Back to Campaigns
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <p className="text-white/70 text-sm mb-2">Total Donated</p>
            <p className="text-white text-3xl font-bold">{formatCurrency(totalDonated)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <p className="text-white/70 text-sm mb-2">Campaigns Supported</p>
            <p className="text-white text-3xl font-bold">{donations.length}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <p className="text-white/70 text-sm mb-2">Impact Level</p>
            <p className="text-white text-3xl font-bold">
              {totalDonated >= 1000 ? '🌟 Platinum' : totalDonated >= 500 ? '💎 Gold' : totalDonated >= 100 ? '🥈 Silver' : '🥉 Bronze'}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Donations List */}
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Donation History</h2>
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/80 text-lg mb-4">You haven't made any donations yet</p>
              <button
                onClick={() => navigate('/donations')}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Make Your First Donation
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <div
                  key={donation._id}
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition cursor-pointer"
                  onClick={() => navigate(`/donations/campaign/${donation.campaign._id}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-1">
                        {donation.campaign.title}
                      </h3>
                      {donation.message && (
                        <p className="text-white/70 text-sm italic mb-2">"{donation.message}"</p>
                      )}
                      <p className="text-white/60 text-sm">
                        Donated on {formatDate(donation.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-2xl">{formatCurrency(donation.amount)}</p>
                      {donation.isAnonymous && (
                        <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded mt-1 inline-block">
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Campaign Progress:</span>
                      <span>
                        {formatCurrency(donation.campaign.currentAmount)} / {formatCurrency(donation.campaign.goalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
