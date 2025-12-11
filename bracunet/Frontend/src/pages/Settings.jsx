import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { user, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:3000';

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '',
    department: '',
    batch: '',
    graduationYear: '',
    studentId: '',
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
      });
      setProfilePicturePreview(user.profilePicture);
    }
  }, [user, getCurrentUser, navigate]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await fetch(`${API_BASE}/api/settings/me/settings`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
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
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            BracuNet
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-4xl font-bold text-white mb-8">Account Settings</h2>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Profile Picture</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {profilePicturePreview ? (
                <img src={profilePicturePreview} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-gray-400">👤</span>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="mb-3 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleProfilePictureUpload}
                  disabled={loading || !profilePicture}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Uploading...' : 'Upload Picture'}
                </button>
                {profilePicturePreview && (
                  <button
                    onClick={handleProfilePictureRemove}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                  >
                    Remove Picture
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Profile Information</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input
                  type="text"
                  value={profileForm.studentId}
                  onChange={(e) => setProfileForm({ ...profileForm, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <input
                  type="text"
                  value={profileForm.batch}
                  onChange={(e) => setProfileForm({ ...profileForm, batch: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <input
                  type="number"
                  value={profileForm.graduationYear}
                  onChange={(e) => setProfileForm({ ...profileForm, graduationYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
