import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { donationApi } from '../api/donationApi';

export const DonationSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [confirming, setConfirming] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      confirmPayment(sessionId);
    } else {
      setError('No session ID found');
      setConfirming(false);
    }
  }, [searchParams]);

  const confirmPayment = async (sessionId) => {
    try {
      await donationApi.confirmPayment(sessionId);
      setConfirming(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm payment');
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Confirming your donation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">✗</div>
          <h1 className="text-3xl font-bold text-white mb-4">Payment Error</h1>
          <p className="text-white/90 mb-6">{error}</p>
          <button
            onClick={() => navigate('/donations')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Back to Donations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-8 text-center max-w-md">
        <div className="text-green-500 text-6xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-white mb-4">Thank You!</h1>
        <p className="text-white/90 text-lg mb-6">
          Your donation has been successfully processed. You're making a difference!
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/donations')}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Browse More Campaigns
          </button>
          <button
            onClick={() => navigate('/donations/my-donations')}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            My Donations
          </button>
        </div>
      </div>
    </div>
  );
};
