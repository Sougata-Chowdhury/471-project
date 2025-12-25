import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/AnimatedBackground';

export const Login = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Clear any previous errors when login page mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen relative flex items-center justify-center p-4">
        <div className="bg-white/8 backdrop-blur-md rounded-lg shadow-2xl p-8 w-full max-w-sm border border-white/10 z-10">
          <h1 className="text-3xl font-bold text-white mb-2">BracuNet</h1>
          <p className="text-white/90 mb-6">Welcome! </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60"
                placeholder="your@email.com"
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
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 border border-white/30"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-white/90 mt-6">
            Don't have an account?{' '}
            <a href="/register" className="text-white hover:text-white/80 font-medium underline">
              Register here
            </a>
          </p>

        </div>
      </div>
    </>
  );
};
