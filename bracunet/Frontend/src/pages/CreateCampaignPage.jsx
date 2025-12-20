import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationApi } from '../api/donationApi';
import { useAuth } from '../hooks/useAuth';

export const CreateCampaignPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'education',
    goalAmount: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const categories = [
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
              You must be a verified user to create fundraising campaigns. 
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
                onClick={() => navigate('/donations')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Back to Donations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.isVerified) {
      setError('Only verified users can create campaigns');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const campaignData = {
        ...formData,
        goalAmount: parseFloat(formData.goalAmount),
      };

      if (!formData.deadline) {
        delete campaignData.deadline;
      }

      const response = await donationApi.createCampaign(campaignData);
      alert('Campaign created successfully!');
      navigate(`/donations/campaign/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Create Fundraising Campaign</h1>
            <button
              onClick={() => navigate('/donations')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              ← Back
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-semibold mb-2">
                Campaign Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Enter a compelling title for your campaign"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                placeholder="Describe your cause and why you need funding"
              />
              <p className="text-white/70 text-sm mt-1">
                {formData.description.length} / 2000 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-gray-800">
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Goal Amount (USD) *
                </label>
                <input
                  type="number"
                  name="goalAmount"
                  value={formData.goalAmount}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  required
                  min="1"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  placeholder="1000"
                />
              </div>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-lg border border-white/30 bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Campaign'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/donations')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
