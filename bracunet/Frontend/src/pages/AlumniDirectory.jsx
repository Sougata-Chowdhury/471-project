import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import config from '../config';

export const AlumniDirectory = () => {
  const { user, logout, getCurrentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    department: 'all',
    graduationYear: 'all',
    sortAlpha: 'asc',
  });
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    years: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1,
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    if (!user) {
      getCurrentUser().catch(() => navigate('/login'));
    }
  }, [user, getCurrentUser, navigate]);

  useEffect(() => {
    if (user?.isVerified || user?.role === 'admin') {
      fetchDirectory();
    }
  }, [user, filters, pagination.page]);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.department !== 'all') params.append('department', filters.department);
      if (filters.graduationYear !== 'all') params.append('graduationYear', filters.graduationYear);
      if (filters.sortAlpha) params.append('sortAlpha', filters.sortAlpha);

      const response = await fetch(
        `http://localhost:3000/api/verified-users/directory?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        }
      );

      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('Error fetching directory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
    setShowFilterMenu(false);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      department: 'all',
      graduationYear: 'all',
      sortAlpha: 'asc',
    });
    setPagination({ ...pagination, page: 1 });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.department !== 'all') count++;
    if (filters.graduationYear !== 'all') count++;
    return count;
  };

  const handleToggleVisibility = async (userId, currentVisibility) => {
    const action = currentVisibility ? 'hide' : 'show';
    if (!window.confirm(`Are you sure you want to ${action} this alumni in the directory?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3000/api/verified-users/admin/${userId}/toggle-visibility`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        fetchDirectory();
        alert(data.message);
      } else {
        alert(data.message || 'Toggle failed');
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to toggle visibility');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user.isVerified && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
              BracuNet
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </nav>
        <div className="flex items-center justify-center h-96">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Verification Required</h2>
            <p className="text-gray-600 mb-6">You need to be a verified user to access the Alumni Directory.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>
            Bracu<span className="text-purple-600">Net</span>
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/news')}
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              Newsfeed
            </button>
            <button
              onClick={() => navigate('/badges')}
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              🏆 Badges
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-gray-700 hover:text-blue-600 font-semibold transition"
            >
              🏅 Leaderboard
            </button>
            <span className="text-gray-700 font-medium">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Directory</h2>
            <p className="text-gray-600">Search and connect with BRAC University community</p>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="flex gap-4 items-center">
              {/* Filter By Button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter By
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilterMenu && (
                  <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl p-4 w-72 z-10">
                    <div className="space-y-4">
                      {/* Department Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                        <select
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Departments</option>
                          {filterOptions.departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      {/* Graduation Year Filter */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Graduation Year</label>
                        <select
                          value={filters.graduationYear}
                          onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Years</option>
                          {filterOptions.years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      {/* Alphabetical Sort */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by Name</label>
                        <select
                          value={filters.sortAlpha}
                          onChange={(e) => handleFilterChange('sortAlpha', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="asc">A → Z</option>
                          <option value="desc">Z → A</option>
                        </select>
                      </div>

                      <button
                        onClick={clearFilters}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Name/Dept/Year/ID"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.department !== 'all' && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    Dept: {filters.department}
                    <button onClick={() => handleFilterChange('department', 'all')} className="hover:text-blue-900">×</button>
                  </span>
                )}
                {filters.graduationYear !== 'all' && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                    Year: {filters.graduationYear}
                    <button onClick={() => handleFilterChange('graduationYear', 'all')} className="hover:text-blue-900">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No users found matching your criteria</p>
            </div>
          ) : (
            <>
              {/* User Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {users.map((verifiedUser) => (
                  <div
                    key={verifiedUser._id}
                    className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition"
                  >
                    {/* Profile Picture */}
                    <div className="mb-4 flex justify-center">
                      {verifiedUser.user?.profilePicture ? (
                        <img
                          src={verifiedUser.user.profilePicture}
                          alt={verifiedUser.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center border-4 border-blue-600">
                          <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <h3 className="font-bold text-gray-800 mb-1">{verifiedUser.name}</h3>
                    {verifiedUser.studentId && (
                      <p className="text-sm text-gray-600 mb-2">{verifiedUser.studentId}</p>
                    )}
                    {verifiedUser.department && (
                      <p className="text-sm text-gray-600">{verifiedUser.department}</p>
                    )}
                    {verifiedUser.graduationYear && (
                      <p className="text-sm text-gray-600">Class of {verifiedUser.graduationYear}</p>
                    )}
                    {verifiedUser.company && (
                      <p className="text-sm text-blue-600 font-medium mt-2">{verifiedUser.company}</p>
                    )}
                    <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      verifiedUser.role === 'alumni' ? 'bg-purple-100 text-purple-700' :
                      verifiedUser.role === 'student' ? 'bg-blue-100 text-blue-700' :
                      verifiedUser.role === 'faculty' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {verifiedUser.role.charAt(0).toUpperCase() + verifiedUser.role.slice(1)}
                    </span>

                    {/* Admin Show/Hide Toggle */}
                    {user.role === 'admin' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleToggleVisibility(verifiedUser._id, verifiedUser.isVisible !== false)}
                          className={`w-full px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2 ${
                            verifiedUser.isVisible !== false
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {verifiedUser.isVisible !== false ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                              Hide
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Show
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    } transition`}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                      className={`px-4 py-2 rounded-lg transition ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                    disabled={pagination.page === pagination.pages}
                    className={`px-4 py-2 rounded-lg ${
                      pagination.page === pagination.pages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                    } transition`}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
