import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';

export const Leaderboard = () => {
  const { user, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:3000';

  const [leaderboard, setLeaderboard] = useState([]);
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
    } else {
      fetchLeaderboard();
    }

    // Socket.io for real-time leaderboard updates
    const socket = io(config.socketUrl);

    socket.on('leaderboard_update', (data) => {
      console.log('Real-time leaderboard update:', data);
      // Refresh leaderboard when points are earned
      fetchLeaderboard();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/gamification/leaderboard?timeframe=${timeframe}&limit=50`,
        { credentials: 'include' }
      );
      const data = await response.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  const getRankColor = (index) => {
    if (index === 0) return 'bg-yellow-100 border-yellow-400';
    if (index === 1) return 'bg-gray-100 border-gray-400';
    if (index === 2) return 'bg-orange-100 border-orange-400';
    return 'bg-white';
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            BracuNet
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/badges')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            >
              My Badges
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-white">🏆 Leaderboard</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeframe === 'all'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeframe === 'monthly'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('weekly')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                timeframe === 'weekly'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">Rank</th>
                  <th className="px-6 py-4 text-left">User</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-center">Level</th>
                  <th className="px-6 py-4 text-center">Points</th>
                  <th className="px-6 py-4 text-center">Badges</th>
                  <th className="px-6 py-4 text-center">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr
                    key={entry._id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                      entry.user?._id === user?.id ? 'bg-blue-50 font-semibold' : ''
                    } ${index < 3 ? getRankColor(index) + ' border-2' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-2xl font-bold">{getRankBadge(index)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {entry.user?.profilePicture ? (
                            <img
                              src={entry.user.profilePicture}
                              alt={entry.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-400">👤</span>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold">{entry.user?.name || 'Unknown'}</div>
                          {entry.user?._id === user?.id && (
                            <span className="text-xs text-blue-600 font-semibold">(You)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        entry.user?.role === 'admin' ? 'bg-red-100 text-red-800' :
                        entry.user?.role === 'faculty' ? 'bg-green-100 text-green-800' :
                        entry.user?.role === 'alumni' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.user?.role || 'student'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-800 font-bold">
                        {entry.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-blue-600">
                      {entry.totalPoints.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold">
                        🏅 {entry.badges?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1">
                        🔥 {entry.currentStreak || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leaderboard.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No leaderboard data available yet. Start contributing to earn points!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
