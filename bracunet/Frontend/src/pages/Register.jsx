import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

export const Register = () => {
  const { user, register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      window.location.replace('/dashboard');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.confirmPassword,
        formData.role
      );
      window.location.replace('/dashboard');
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="bg-white/8 backdrop-blur-md rounded-lg shadow-2xl p-8 w-full max-w-md border border-white/10 z-10">
          <h1 className="text-3xl font-bold text-white mb-2">BracuNet</h1>
          <p className="text-white/90 mb-6">Create your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60"
                placeholder="Confirm password"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white"
              >
                <option value="student" className="bg-blue-600">Student</option>
                <option value="alumni" className="bg-blue-600">Alumni</option>
                <option value="faculty" className="bg-blue-600">Faculty</option>
              </select>
              <p className="text-white/70 text-sm mt-1">
                Note: You'll need to submit verification after registration to access full features
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 border border-white/30"
            >
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-white/90 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-white hover:text-white/80 font-medium underline">
              Login here
            </a>
          </p>
        </div>
      </div>
    </>
  );
};
