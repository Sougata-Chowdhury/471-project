import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import careerApi from '../api/careerApi';
import { io } from 'socket.io-client';
import config from '../config';

const CareerHub = () => {
  const navigate = useNavigate();
  const { user, logout, getCurrentUser } = useAuth();
  
  // State for job posting form
  const [showPostForm, setShowPostForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'job',
    description: '',
    externalLink: ''
  });
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // State for recommendation request
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [recommendationData, setRecommendationData] = useState({
    facultyId: '',
    purpose: '',
    additionalInfo: '',
    email: ''
  });
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);

  // Fetch opportunities on mount
  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
      return;
    }

    if (!user.isVerified) {
      setLoading(false);
      return;
    }

    // Fetch opportunities
    const fetchOpportunities = async () => {
      try {
        const data = await careerApi.getOpportunities();
        setOpportunities(data);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError('Failed to load opportunities');
      } finally {
        setLoading(false);
      }
    };

    // Fetch faculty list for recommendation dropdown
    const fetchFaculty = async () => {
      try {
        const data = await careerApi.getFacultyMembers();
        setFacultyList(data);
      } catch (err) {
        console.error('Error fetching faculty:', err);
      }
    };

    // Fetch recommendation requests based on role
    const fetchRecommendationRequests = async () => {
      try {
        if (user.role === 'student' || user.role === 'alumni') {
          const data = await careerApi.getMyRecommendationRequests();
          setMyRequests(data);
        } else if (user.role === 'faculty') {
          const data = await careerApi.getReceivedRequests();
          setReceivedRequests(data);
        }
      } catch (err) {
        console.error('Error fetching recommendation requests:', err);
      }
    };

    fetchOpportunities();
    fetchFaculty();
    fetchRecommendationRequests();

    // Socket.io for real-time job posting updates
    const socket = io(config.socketUrl);

    socket.on('career_opportunity_posted', (data) => {
      console.log('Real-time: New job posted:', data);
      fetchOpportunities();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, getCurrentUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const newOpportunity = await careerApi.createOpportunity(formData);
      // Add to local state immediately
      setOpportunities(prev => [newOpportunity, ...prev]);
      setFormData({ title: '', company: '', type: 'job', description: '', externalLink: '' });
      setShowPostForm(false);
    } catch (err) {
      console.error('Error posting opportunity:', err);
      setError(err.response?.data?.message || 'Failed to post opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (opportunityId) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    
    try {
      await careerApi.deleteOpportunity(opportunityId);
      // Remove from local state immediately
      setOpportunities(prev => prev.filter(opp => opp._id !== opportunityId));
    } catch (err) {
      console.error('Error deleting opportunity:', err);
      setError(err.response?.data?.message || 'Failed to delete opportunity');
    }
  };

  // Recommendation handlers
  const handleRecommendationInputChange = (e) => {
    const { name, value } = e.target;
    setRecommendationData(prev => ({ ...prev, [name]: value }));
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRecommendation(true);
    setError('');

    try {
      const newRequest = await careerApi.createRecommendationRequest(recommendationData);
      setMyRequests(prev => [newRequest, ...prev]);
      setRecommendationData({ facultyId: '', purpose: '', additionalInfo: '', email: '' });
      setShowRecommendationForm(false);
    } catch (err) {
      console.error('Error submitting recommendation request:', err);
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmittingRecommendation(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      const updated = await careerApi.updateRequestStatus(requestId, status);
      setReceivedRequests(prev =>
        prev.map(req => (req._id === requestId ? updated : req))
      );
    } catch (err) {
      console.error('Error updating request status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  // Loading state
  if (!user || (user.isVerified && loading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Not verified - show verification required page
  if (!user.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        {/* Header */}
        <nav className="bg-white shadow">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Career Opportunity & Recommendation Hub</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Verification Required Content */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be a verified user to access the Career Opportunity & Recommendation Hub.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/verification-request')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium"
              >
                Request Verification
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verified user - show the main page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
      {/* Modern Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                💼
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Career Hub
                </h1>
                <p className="text-xs text-gray-500">Opportunities & Recommendations</p>
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 border border-gray-200">
                  {user.role === 'faculty' ? '👨‍🏫' : user.role === 'alumni' ? '🎓' : '📚'}
                </span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                ← Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="text-6xl mb-4">💼</div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Career Opportunities
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
            Discover jobs, internships, and request recommendation letters
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/90 backdrop-blur-sm text-white rounded-xl shadow-lg flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <p className="font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError('')}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Opportunities (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Faculty Post Button */}
            {user.role === 'faculty' && !showPostForm && (
              <button
                onClick={() => setShowPostForm(true)}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 border-2 border-transparent hover:border-blue-200"
              >
                <span className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">+</span>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">Post New Opportunity</span>
              </button>
            )}

            {/* Post Form (Faculty Only) */}
            {user.role === 'faculty' && showPostForm && (
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                    ✨
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Post New Opportunity
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Position Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Software Engineer Intern"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company/Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Google, Microsoft"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    >
                      <option value="job">💼 Full-time Job</option>
                      <option value="internship">🎯 Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe the opportunity, requirements, qualifications..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Application Link</label>
                    <input
                      type="url"
                      name="externalLink"
                      value={formData.externalLink}
                      onChange={handleInputChange}
                      placeholder="https://careers.company.com/apply"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Posting...
                        </span>
                      ) : (
                        'Post Opportunity'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPostForm(false)}
                      disabled={submitting}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Opportunities List */}
            <div>
              {opportunities.length === 0 ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-white mb-2">No Opportunities Yet</h3>
                  <p className="text-white/80 mb-6">
                    {user.role === 'faculty' 
                      ? 'Be the first to post a career opportunity for students!'
                      : 'Check back soon for new job and internship postings.'}
                  </p>
                  {user.role === 'faculty' && (
                    <button
                      onClick={() => setShowPostForm(true)}
                      className="px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Post Your First Opportunity
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-4 px-4">
                    <p className="text-white/90 font-medium">
                      📋 {opportunities.length} {opportunities.length === 1 ? 'Opportunity' : 'Opportunities'} Available
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    {opportunities.map((opp) => (
                      <div
                        key={opp._id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  opp.type === 'job' 
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                                    : 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white'
                                }`}>
                                  {opp.type === 'job' ? '💼 FULL-TIME' : '🎯 INTERNSHIP'}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                                {opp.title}
                              </h3>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {opp.company}
                                </span>
                              </div>
                            </div>
                            
                            {opp.postedBy?._id === user._id && (
                              <button
                                onClick={() => handleDelete(opp._id)}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 border border-red-200 hover:border-red-500"
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                          
                          {opp.description && (
                            <p className="text-gray-600 mb-4 leading-relaxed">{opp.description}</p>
                          )}
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <span>👤</span>
                                <span className="font-medium">{opp.postedBy?.name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>📅</span>
                                <span>{new Date(opp.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {opp.externalLink && (
                              <a
                                href={opp.externalLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                              >
                                Apply Now →
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column - Recommendation Requests (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden sticky top-20">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/20 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                    📝
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Recommendations</h2>
                    <p className="text-xs text-white/80">Request letters from faculty</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Student/Alumni: Request Form */}
                {(user.role === 'student' || user.role === 'alumni') && (
                  <>
                    {!showRecommendationForm ? (
                      <button
                        onClick={() => setShowRecommendationForm(true)}
                        className="w-full px-4 py-3 bg-white hover:bg-gray-50 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 border-2 border-transparent hover:border-purple-200"
                      >
                        <span className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">+</span>
                        <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">New Request</span>
                      </button>
                    ) : (
                      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <span>✨</span> New Request
                        </h3>
                        <form onSubmit={handleRecommendationSubmit} className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Faculty Member <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="facultyId"
                              value={recommendationData.facultyId}
                              onChange={handleRecommendationInputChange}
                              required
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
                            >
                              <option value="">Select faculty...</option>
                              {facultyList.map((faculty) => (
                                <option key={faculty._id} value={faculty._id}>
                                  {faculty.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Purpose <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="purpose"
                              value={recommendationData.purpose}
                              onChange={handleRecommendationInputChange}
                              required
                              placeholder="e.g., Graduate School"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Info</label>
                            <textarea
                              name="additionalInfo"
                              value={recommendationData.additionalInfo}
                              onChange={handleRecommendationInputChange}
                              rows={2}
                              placeholder="Any details..."
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm resize-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={recommendationData.email}
                              onChange={handleRecommendationInputChange}
                              required
                              placeholder="your@email.com"
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              disabled={submittingRecommendation}
                              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm disabled:opacity-50"
                            >
                              {submittingRecommendation ? 'Sending...' : 'Submit'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowRecommendationForm(false)}
                              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* My Requests List */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                        <span>📤</span> Your Requests
                      </h3>
                      {myRequests.length === 0 ? (
                        <div className="bg-white/5 rounded-lg p-4 text-center">
                          <p className="text-white/70 text-sm">No requests yet</p>
                        </div>
                      ) : (
                        myRequests.map((req) => (
                          <div key={req._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 border border-gray-100">
                            <div className="flex items-start justify-between mb-2">
                              <span className="font-semibold text-gray-800 text-sm">{req.requestedTo?.name}</span>
                              <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {req.status === 'pending' ? '⏳' : req.status === 'accepted' ? '✅' : '❌'} {req.status.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-600 text-xs mb-1">{req.purpose}</p>
                            <p className="text-gray-400 text-xs flex items-center gap-1">
                              <span>📅</span>
                              {new Date(req.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {/* Faculty: Received Requests */}
                {user.role === 'faculty' && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span>📥</span> Requests Received
                    </h3>
                    {receivedRequests.length === 0 ? (
                      <div className="bg-white/5 rounded-lg p-4 text-center">
                        <p className="text-white/70 text-sm">No requests received</p>
                      </div>
                    ) : (
                      receivedRequests.map((req) => (
                        <div key={req._id} className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 border border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-semibold text-gray-800 text-sm">{req.requestedBy?.name}</span>
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {req.status === 'pending' ? '⏳' : req.status === 'accepted' ? '✅' : '❌'} {req.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs mb-2">{req.purpose}</p>
                          <div className="bg-blue-50 rounded-lg p-2 mb-2">
                            <p className="text-blue-600 text-xs font-medium break-all">
                              📧 {req.email}
                            </p>
                          </div>
                          {req.status === 'pending' && (
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleUpdateRequestStatus(req._id, 'accepted')}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-200"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => handleUpdateRequestStatus(req._id, 'rejected')}
                                className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:shadow-lg transition-all duration-200"
                              >
                                ❌ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareerHub;
