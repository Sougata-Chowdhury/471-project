import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

export const Settings = () => {
  const { user, getCurrentUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    department: '',
    batch: '',
    graduationYear: '',
    studentId: '',
    position: '',
  });
  
  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Profile picture
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // Skills, Goals, Interests
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [options, setOptions] = useState({ skills: [], goals: [], interests: [] });
  const [skillSearch, setSkillSearch] = useState('');
  const [goalSearch, setGoalSearch] = useState('');
  const [interestSearch, setInterestSearch] = useState('');

  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
    } else {
      setProfileForm({
        name: user.name || '',
        department: user.department || '',
        batch: user.batch || '',
        graduationYear: user.graduationYear || '',
        studentId: user.studentId || '',
        position: user.position || '',
      });
      setProfilePicturePreview(user.profilePicture);
      setSelectedSkills(user.skills || []);
      setSelectedGoals(user.goals || []);
      setSelectedInterests(user.interests || []);
    }
  }, [user, getCurrentUser, navigate]);

  // Fetch options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/settings/options`, {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.success) {
          setOptions(data.options);
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    fetchOptions();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_BASE}/api/settings/me/settings`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profileForm,
          skills: selectedSkills,
          goals: selectedGoals,
          interests: selectedInterests,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        await getCurrentUser();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/settings/me/password`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePicture) {
      setMessage({ type: 'error', text: 'Please select a picture first' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    const formData = new FormData();
    formData.append('profilePicture', profilePicture);
    
    try {
      const response = await fetch(`${API_BASE}/api/settings/me/profile-picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile picture updated!' });
        setProfilePicture(null);
        await getCurrentUser();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to upload picture' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureRemove = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_BASE}/api/settings/me/profile-picture`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Profile picture removed!' });
        setProfilePicturePreview(null);
        setProfilePicture(null);
        await getCurrentUser();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to remove picture' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Modern Navbar */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BracuNet
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/settings/notifications')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                🔔 Notifications
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Account Settings</h2>
          <p className="text-white/80 text-sm sm:text-base">Manage your profile, security, and preferences</p>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div className={`p-4 rounded-xl mb-6 shadow-lg backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border-l-4 border-green-500 text-green-800' 
              : 'bg-red-50 border-l-4 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{message.type === 'success' ? '✅' : '❌'}</span>
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Grid Layout for Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Profile Picture Card - Spans 1 column */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">📸</span>
              <h3 className="text-xl font-bold text-gray-800">Profile Picture</h3>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              {/* Profile Image */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center shadow-lg ring-4 ring-white">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl text-gray-400">👤</span>
                  )}
                </div>
                {profilePicturePreview && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <span className="text-sm">✓</span>
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="w-full space-y-3">
                <label className="block">
                  <span className="sr-only">Choose profile photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-blue-500 file:to-purple-500
                      file:text-white hover:file:from-blue-600 hover:file:to-purple-600
                      file:cursor-pointer file:transition-all file:duration-200 file:shadow-md"
                  />
                </label>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleProfilePictureUpload}
                    disabled={loading || !profilePicture}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 py-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                  >
                    {loading ? '⏳ Uploading...' : '📤 Upload'}
                  </button>
                  {profilePicturePreview && (
                    <button
                      onClick={handleProfilePictureRemove}
                      disabled={loading}
                      className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 font-medium shadow-md hover:shadow-lg"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Information Card - Spans 2 columns */}
          <div className="lg:col-span-2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">👤</span>
              <h3 className="text-xl font-bold text-gray-800">Profile Information</h3>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Faculty-specific fields */}
              {user?.role === 'faculty' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                      <input
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., CSE"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Position</label>
                      <input
                        type="text"
                        value={profileForm.position}
                        onChange={(e) => setProfileForm({ ...profileForm, position: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., Professor, Lecturer"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Student/Alumni-specific fields */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student ID</label>
                      <input
                        type="text"
                        value={profileForm.studentId}
                        onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., 12345678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
                      <input
                        type="text"
                        value={profileForm.department}
                        onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., CSE"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Batch</label>
                      <input
                        type="text"
                        value={profileForm.batch}
                        onChange={(e) => setProfileForm({ ...profileForm, batch: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., Spring 2020"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Graduation Year</label>
                      <input
                        type="number"
                        value={profileForm.graduationYear}
                        onChange={(e) => setProfileForm({ ...profileForm, graduationYear: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        placeholder="e.g., 2024"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
              >
                {loading ? '⏳ Saving...' : '💾 Save Profile'}
              </button>
            </form>
          </div>
        </div>

        {/* Skills, Goals, Interests Card - Full Width */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-800">Skills, Goals & Interests</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Skills */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">💡</span>
                <label className="text-sm font-semibold text-gray-700">Skills</label>
              </div>
              <input
                type="text"
                placeholder="🔍 Search skills..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 mb-3 text-sm"
              />
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                {options.skills.filter(skill => 
                  skill.toLowerCase().includes(skillSearch.toLowerCase())
                ).map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (selectedSkills.includes(skill)) {
                        setSelectedSkills(selectedSkills.filter(s => s !== skill));
                      } else {
                        setSelectedSkills([...selectedSkills, skill]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedSkills.includes(skill)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    {skill} {selectedSkills.includes(skill) && '✓'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">✓ Selected: {selectedSkills.length}</p>
            </div>

            {/* Goals */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🎯</span>
                <label className="text-sm font-semibold text-gray-700">Career Goals</label>
              </div>
              <input
                type="text"
                placeholder="🔍 Search goals..."
                value={goalSearch}
                onChange={(e) => setGoalSearch(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 mb-3 text-sm"
              />
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                {options.goals.filter(goal => 
                  goal.toLowerCase().includes(goalSearch.toLowerCase())
                ).map(goal => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      if (selectedGoals.includes(goal)) {
                        setSelectedGoals(selectedGoals.filter(g => g !== goal));
                      } else {
                        setSelectedGoals([...selectedGoals, goal]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedGoals.includes(goal)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    {goal} {selectedGoals.includes(goal) && '✓'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">✓ Selected: {selectedGoals.length}</p>
            </div>

            {/* Interests */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">❤️</span>
                <label className="text-sm font-semibold text-gray-700">Interests</label>
              </div>
              <input
                type="text"
                placeholder="🔍 Search interests..."
                value={interestSearch}
                onChange={(e) => setInterestSearch(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 mb-3 text-sm"
              />
              <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto bg-gray-50 border-2 border-gray-200 rounded-lg p-3">
                {options.interests.filter(interest => 
                  interest.toLowerCase().includes(interestSearch.toLowerCase())
                ).map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      if (selectedInterests.includes(interest)) {
                        setSelectedInterests(selectedInterests.filter(i => i !== interest));
                      } else {
                        setSelectedInterests([...selectedInterests, interest]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      selectedInterests.includes(interest)
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    {interest} {selectedInterests.includes(interest) && '✓'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">✓ Selected: {selectedInterests.length}</p>
            </div>
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🔒</span>
            <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                placeholder="Enter current password"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  placeholder="Confirm password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳ Updating...' : '🔐 Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
