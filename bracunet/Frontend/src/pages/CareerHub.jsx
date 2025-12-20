import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import careerApi from '../api/careerApi';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Career Opportunity & Recommendation Hub</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user.name}</span>
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

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Opportunities (2/3 width) */}
          <div className="lg:col-span-2">
            {/* Faculty Post Button */}
            {user.role === 'faculty' && !showPostForm && (
              <button
                onClick={() => setShowPostForm(true)}
                className="mb-6 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-2 font-medium shadow"
              >
                <span className="text-xl">+</span> Post Job/Internship Opportunity
              </button>
            )}

            {/* Post Form (Faculty Only) */}
            {user.role === 'faculty' && showPostForm && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Post New Opportunity</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Software Engineer Intern"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company/Organization *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Google, Microsoft"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="job">Job</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Describe the opportunity, requirements, etc."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
                    <input
                      type="url"
                      name="externalLink"
                      value={formData.externalLink}
                      onChange={handleInputChange}
                      placeholder="https://careers.company.com/apply"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Posting...' : 'Post Opportunity'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPostForm(false)}
                      disabled={submitting}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Opportunities List */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <h2 className="text-xl font-semibold text-white mb-4">
                {opportunities.length > 0 ? 'Available Opportunities' : 'No opportunities posted yet'}
              </h2>
              
              <div className="space-y-4">
                {opportunities.map((opp) => (
                  <div key={opp._id} className="bg-white rounded-lg shadow p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          opp.type === 'job' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {opp.type === 'job' ? 'Job' : 'Internship'}
                        </span>
                        <h3 className="mt-2 text-lg font-semibold text-gray-800">{opp.title}</h3>
                        <p className="text-blue-600 font-medium">{opp.company}</p>
                      </div>
                      {/* Delete button for poster */}
                      {opp.postedBy?._id === user._id && (
                        <button
                          onClick={() => handleDelete(opp._id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                    
                    {opp.description && (
                      <p className="mt-3 text-gray-600">{opp.description}</p>
                    )}
                    
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>Posted by {opp.postedBy?.name || 'Unknown'} on {new Date(opp.createdAt).toLocaleDateString()}</span>
                      {opp.externalLink && (
                        <a
                          href={opp.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          Apply / View Details →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Recommendation Requests (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">📝 Recommendation Letters</h2>
              
              {/* Student/Alumni: Request Form */}
              {(user.role === 'student' || user.role === 'alumni') && (
                <>
                  {!showRecommendationForm ? (
                    <button
                      onClick={() => setShowRecommendationForm(true)}
                      className="w-full mb-4 px-4 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium shadow"
                    >
                      + Request Recommendation
                    </button>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-4 mb-4">
                      <h3 className="font-semibold text-gray-800 mb-3">Request Recommendation Letter</h3>
                      <form onSubmit={handleRecommendationSubmit} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Select Faculty *</label>
                          <select
                            name="facultyId"
                            value={recommendationData.facultyId}
                            onChange={handleRecommendationInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          >
                            <option value="">Choose a faculty member</option>
                            {facultyList.map((faculty) => (
                              <option key={faculty._id} value={faculty._id}>
                                {faculty.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                          <input
                            type="text"
                            name="purpose"
                            value={recommendationData.purpose}
                            onChange={handleRecommendationInputChange}
                            required
                            placeholder="e.g., Graduate School Application"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Info</label>
                          <textarea
                            name="additionalInfo"
                            value={recommendationData.additionalInfo}
                            onChange={handleRecommendationInputChange}
                            rows={2}
                            placeholder="Any additional details..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                          <input
                            type="email"
                            name="email"
                            value={recommendationData.email}
                            onChange={handleRecommendationInputChange}
                            required
                            placeholder="your.email@example.com"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={submittingRecommendation}
                            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50"
                          >
                            {submittingRecommendation ? 'Submitting...' : 'Submit Request'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowRecommendationForm(false)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* My Requests List */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-white text-sm">Your Requests</h3>
                    {myRequests.length === 0 ? (
                      <p className="text-white/70 text-sm">No requests yet</p>
                    ) : (
                      myRequests.map((req) => (
                        <div key={req._id} className="bg-white rounded-lg shadow p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800 text-sm">{req.requestedTo?.name}</span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-xs">{req.purpose}</p>
                          <p className="text-gray-400 text-xs mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}

              {/* Faculty: Received Requests */}
              {user.role === 'faculty' && (
                <div className="space-y-3">
                  <h3 className="font-medium text-white text-sm">Requests Received</h3>
                  {receivedRequests.length === 0 ? (
                    <p className="text-white/70 text-sm">No requests received</p>
                  ) : (
                    receivedRequests.map((req) => (
                      <div key={req._id} className="bg-white rounded-lg shadow p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800 text-sm">{req.requestedBy?.name}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            req.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs mb-1">{req.purpose}</p>
                        <p className="text-blue-600 text-xs mb-1">
                          <span className="text-gray-500">Email:</span> {req.email}
                        </p>
                        {req.status === 'pending' && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateRequestStatus(req._id, 'accepted')}
                              className="flex-1 px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateRequestStatus(req._id, 'rejected')}
                              className="flex-1 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Reject
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
  );
};

export default CareerHub;
