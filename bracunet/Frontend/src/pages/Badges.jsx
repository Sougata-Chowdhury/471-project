import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

export const Badges = () => {
  const { user, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [rank, setRank] = useState(null);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
    } else {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [activityRes, badgesRes] = await Promise.all([
        fetch(`${API_BASE}/api/gamification/my-activity`, { credentials: 'include' }),
        fetch(`${API_BASE}/api/gamification/badges`, { credentials: 'include' }),
      ]);

      const activityData = await activityRes.json();
      const badgesData = await badgesRes.json();

      if (activityData.success) {
        setActivity(activityData.activity);
        setRank(activityData.rank);
      }

      if (badgesData.success) {
        setAllBadges(badgesData.badges);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasBadge = (badgeId) => {
    return activity?.badges?.some(b => b.badge._id === badgeId);
  };

  const getBadgeProgress = (badge) => {
    if (!activity) return 0;
    let current = 0;
    switch (badge.requirementType) {
      case 'forum_posts': current = activity.forumPosts; break;
      case 'forum_upvotes': current = activity.forumUpvotes; break;
      case 'resources_uploaded': current = activity.resourcesUploaded; break;
      case 'events_attended': current = activity.eventsAttended; break;
      case 'mentor_sessions': current = activity.mentorSessions; break;
      case 'news_posts': current = activity.newsPosts; break;
      case 'login_streak': current = activity.currentStreak; break;
      case 'connections': current = activity.connections; break;
      default: current = 0;
    }
    return Math.min(100, (current / badge.requirement) * 100);
  };

  const groupBadgesByCategory = () => {
    const grouped = {};
    allBadges.forEach(badge => {
      if (!grouped[badge.category]) {
        grouped[badge.category] = [];
      }
      grouped[badge.category].push(badge);
    });
    return grouped;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const groupedBadges = groupBadgesByCategory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            BracuNet
          </h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/leaderboard')}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition"
            >
              Leaderboard
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
        {/* Stats Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600">{activity?.totalPoints || 0}</div>
              <div className="text-gray-600">Total Points</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">{activity?.level || 1}</div>
              <div className="text-gray-600">Level</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">#{rank || '—'}</div>
              <div className="text-gray-600">Rank</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600">{activity?.badges?.length || 0}</div>
              <div className="text-gray-600">Badges Earned</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Current Streak: {activity?.currentStreak || 0} days 🔥</span>
              <span>Longest Streak: {activity?.longestStreak || 0} days</span>
            </div>
          </div>
        </div>

        {/* Badges by Category */}
        {Object.keys(groupedBadges).map(category => (
          <div key={category} className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-4 capitalize">{category} Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedBadges[category].map(badge => {
                const earned = hasBadge(badge._id);
                const progress = getBadgeProgress(badge);
                return (
                  <div
                    key={badge._id}
                    className={`bg-white rounded-lg shadow-lg p-4 ${earned ? 'border-4 border-yellow-400' : 'opacity-75'}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`text-4xl ${earned ? '' : 'grayscale opacity-50'}`}>
                        {badge.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800">{badge.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            badge.tier === 'bronze' ? 'bg-orange-200 text-orange-800' :
                            badge.tier === 'silver' ? 'bg-gray-300 text-gray-800' :
                            badge.tier === 'gold' ? 'bg-yellow-300 text-yellow-900' :
                            'bg-purple-300 text-purple-900'
                          }`}>
                            {badge.tier.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">+{badge.points} pts</span>
                        </div>
                        {!earned && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{progress.toFixed(0)}% Complete</p>
                          </div>
                        )}
                        {earned && (
                          <div className="text-xs text-green-600 font-semibold mt-1">✓ Earned!</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
