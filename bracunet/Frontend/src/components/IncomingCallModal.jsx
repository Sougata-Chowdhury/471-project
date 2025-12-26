import React, { useState, useEffect } from 'react';
import API from '../api/api';

export default function IncomingCallModal({ 
  isOpen, 
  callerName, 
  callType, 
  callUrl, 
  mentorshipId,
  callKey,
  onAnswer, 
  onReject 
}) {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Play ringing sound (optional - you can add audio element)
      setRinging(true);
      console.log('📞 Incoming call modal opened:', { callerName, callType, mentorshipId });
    } else {
      setRinging(false);
    }
  }, [isOpen]);

  const handleAnswer = async () => {
    console.log('✅ Call answered');
    setRinging(false);
    
    try {
      // Notify backend that call was answered
      await API.post('/mentorship/call/answer', {
        mentorshipId,
        callKey,
        callType
      });
      console.log('✅ Backend notified of answer');
    } catch (err) {
      console.error('❌ Failed to notify answer:', err);
    }

    // Open Jitsi meeting
    if (callUrl) {
      window.open(callUrl, '_blank', 'noopener,noreferrer');
    }

    onAnswer();
  };

  const handleReject = async () => {
    console.log('❌ Call rejected');
    setRinging(false);
    
    try {
      // Notify backend that call was rejected
      await API.post('/mentorship/call/reject', {
        mentorshipId,
        callKey,
        callType
      });
      console.log('✅ Backend notified of rejection');
    } catch (err) {
      console.error('❌ Failed to notify rejection:', err);
    }

    onReject();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce-slow">
        {/* Call Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
            ringing ? 'bg-gradient-to-br from-green-400 to-blue-500 animate-pulse' : 'bg-gray-300'
          }`}>
            <span className="text-5xl">
              {callType === 'video' ? '📹' : '🎧'}
            </span>
          </div>
        </div>

        {/* Caller Info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {callerName || 'Unknown Caller'}
          </h2>
          <p className="text-lg text-gray-600">
            {callType === 'video' ? 'Video Call' : 'Audio Call'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {ringing ? 'Incoming call...' : 'Call waiting'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Reject Button */}
          <button
            onClick={handleReject}
            className="flex flex-col items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs mt-1">Decline</span>
          </button>

          {/* Answer Button */}
          <button
            onClick={handleAnswer}
            className="flex flex-col items-center justify-center w-20 h-20 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all transform hover:scale-110 active:scale-95"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="text-xs mt-1">Answer</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by Jitsi Meet
          </p>
        </div>
      </div>
    </div>
  );
}
