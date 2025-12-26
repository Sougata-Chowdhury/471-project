import React, { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from '../hooks/useAuth';
import IncomingCallModal from './IncomingCallModal';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || 'your-pusher-key';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

export default function GlobalCallManager() {
  const { user } = useAuth();
  const [incomingCall, setIncomingCall] = useState(null);

  useEffect(() => {
    if (!user?._id) {
      console.log('⚠️ No user ID, skipping Pusher setup');
      return;
    }

    console.log('🔌 Setting up Pusher for user:', user._id);

    // Initialize Pusher
    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      encrypted: true,
    });

    // Subscribe to user's channel
    const channel = pusher.subscribe(`user-${user._id}`);

    // Listen for incoming calls
    channel.bind('incoming-call', (data) => {
      console.log('📞 Incoming call received:', data);
      setIncomingCall({
        callerName: data.callerName,
        callType: data.callType,
        callUrl: data.callUrl,
        mentorshipId: data.mentorshipId,
        callKey: data.callKey,
      });
    });

    // Listen for call answered (if you're the caller)
    channel.bind('call-answered', (data) => {
      console.log('✅ Call was answered:', data);
      // You can show a toast notification or update UI
    });

    // Listen for call rejected (if you're the caller)
    channel.bind('call-rejected', (data) => {
      console.log('❌ Call was rejected:', data);
      // You can show a toast notification
    });

    // Cleanup
    return () => {
      console.log('🔌 Cleaning up Pusher connection');
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [user?._id]);

  const handleAnswer = () => {
    console.log('✅ User answered the call');
    setIncomingCall(null);
  };

  const handleReject = () => {
    console.log('❌ User rejected the call');
    setIncomingCall(null);
  };

  if (!incomingCall) return null;

  return (
    <IncomingCallModal
      isOpen={!!incomingCall}
      callerName={incomingCall.callerName}
      callType={incomingCall.callType}
      callUrl={incomingCall.callUrl}
      mentorshipId={incomingCall.mentorshipId}
      callKey={incomingCall.callKey}
      onAnswer={handleAnswer}
      onReject={handleReject}
    />
  );
}
