import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import API from '../api/api';

export const AlumniDirectory = () => {
  const { user, logout, getCurrentUser, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
      return;
    }
    
    if (user?.isVerified || user?.role === 'admin') {
      fetchDirectory();
    }
  }, [user, filters, pagination.page]);

  // Auto-refresh user data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        refreshUser();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, refreshUser]);

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.department !== 'all') params.append('department', filters.department);
      if (filters.graduationYear !== 'all') params.append('graduationYear', filters.graduationYear);
      if (filters.sortAlpha) params.append('sortAlpha', filters.sortAlpha);

      console.log('Fetching directory with params:', params.toString());

      const response = await API.get(
        `/verified-users/directory?${params}`
      );

      console.log('Directory response:', response.data);

      if (response.data.success) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
        setFilterOptions(response.data.filters);
      }
    } catch (error) {
      console.error('Error fetching directory:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('Full error:', JSON.stringify(error, null, 2));
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

  const handleRefreshData = async () => {
    setRefreshing(true);
    try {
      await refreshUser();
      await fetchDirectory();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
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

    try {
      const response = await API.put(`/verified-users/admin/${userId}/toggle-visibility`);

      const data = response.data;
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
      {/* Modern Sticky Navigation */}
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={() => navigate('/news')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                📰 News
              </button>
              <button
                onClick={handleRefreshData}
                disabled={refreshing}
                className="px-3 sm:px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh user status and directory"
              >
                {refreshing ? '⏳' : '🔄'} Refresh
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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block mb-4">
            <span className="text-6xl sm:text-7xl">👥</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4">Alumni Directory</h2>
          <p className="text-white/90 text-base sm:text-lg max-w-2xl mx-auto">
            Connect with BRAC University's vibrant community of students, alumni, and faculty
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-8">
          {/* Search and Filter Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Filter Button */}
              <div className="lg:col-span-3 relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🎯</span>
                  Filter By
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilterMenu && (
                  <div className="absolute top-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 sm:p-6 w-full lg:w-80 z-20">
                    <div className="space-y-4">
                      {/* Department Filter */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <span className="text-lg">🏛️</span>
                          Department
                        </label>
                        <select
                          value={filters.department}
                          onChange={(e) => handleFilterChange('department', e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        >
                          <option value="all">All Departments</option>
                          {filterOptions.departments.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>

                      {/* Graduation Year Filter */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <span className="text-lg">🎓</span>
                          Graduation Year
                        </label>
                        <select
                          value={filters.graduationYear}
                          onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        >
                          <option value="all">All Years</option>
                          {filterOptions.years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      {/* Alphabetical Sort */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                          <span className="text-lg">🔤</span>
                          Sort by Name
                        </label>
                        <select
                          value={filters.sortAlpha}
                          onChange={(e) => handleFilterChange('sortAlpha', e.target.value)}
                          className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                        >
                          <option value="asc">A → Z</option>
                          <option value="desc">Z → A</option>
                        </select>
                      </div>

                      <button
                        onClick={clearFilters}
                        className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md"
                      >
                        ✖️ Clear Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Box */}
              <form onSubmit={handleSearch} className="lg:col-span-9">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Search by name, department, year, or ID..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full px-4 sm:px-6 py-3 pr-24 sm:pr-32 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 text-sm sm:text-base"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-md text-sm sm:text-base"
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
                  <span className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
                    🏛️ {filters.department}
                    <button onClick={() => handleFilterChange('department', 'all')} className="hover:text-blue-900 font-bold text-lg">×</button>
                  </span>
                )}
                {filters.graduationYear !== 'all' && (
                  <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-sm">
                    🎓 Class of {filters.graduationYear}
                    <button onClick={() => handleFilterChange('graduationYear', 'all')} className="hover:text-purple-900 font-bold text-lg">×</button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          {!loading && users.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg px-4 py-3">
              <p className="text-gray-700 font-semibold text-center">
                <span className="text-2xl">👥</span> Found <span className="text-blue-600 font-bold">{pagination.total}</span> members
              </p>
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div className="flex flex-col justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-6 text-gray-600 text-lg font-medium">Loading directory...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl mb-6 block">🔍</span>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Members Found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              {/* User Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {users.map((verifiedUser) => (
                  <div
                    key={verifiedUser._id}
                    className="group bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-6 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    {/* Profile Picture */}
                    <div className="mb-4 flex justify-center">
                      {verifiedUser.user?.profilePicture ? (
                        <img
                          src={verifiedUser.user.profilePicture}
                          alt={verifiedUser.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg group-hover:border-purple-500 transition-all duration-300"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-4 border-blue-600 shadow-lg group-hover:border-purple-600 transition-all duration-300">
                          <span className="text-4xl text-white">👤</span>
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <h3 className="font-bold text-gray-800 mb-1 text-lg group-hover:text-blue-600 transition-colors">{verifiedUser.name}</h3>
                    {verifiedUser.studentId && (
                      <p className="text-sm text-gray-500 mb-2 font-mono">{verifiedUser.studentId}</p>
                    )}
                    {verifiedUser.department && (
                      <p className="text-sm text-gray-600 font-medium">🏛️ {verifiedUser.department}</p>
                    )}
                    {verifiedUser.graduationYear && (
                      <p className="text-sm text-gray-600 font-medium">🎓 Class of {verifiedUser.graduationYear}</p>
                    )}
                    {verifiedUser.company && (
                      <p className="text-sm text-blue-600 font-semibold mt-2 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                        💼 {verifiedUser.company}
                      </p>
                    )}
                    
                    {/* Role Badge */}
                    <div className="mt-4">
                      <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold shadow-md ${
                        verifiedUser.role === 'alumni' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                        verifiedUser.role === 'student' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                        verifiedUser.role === 'faculty' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                        'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                      }`}>
                        {verifiedUser.role === 'alumni' ? '🎓 Alumni' :
                         verifiedUser.role === 'student' ? '📚 Student' :
                         verifiedUser.role === 'faculty' ? '👨‍🏫 Faculty' : verifiedUser.role}
                      </span>
                    </div>

                    {/* Admin Show/Hide Toggle */}
                    {user.role === 'admin' && (
                      <div className="mt-4">
                        <button
                          onClick={() => handleToggleVisibility(verifiedUser._id, verifiedUser.isVisible !== false)}
                          className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 ${
                            verifiedUser.isVisible !== false
                              ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                          }`}
                        >
                          {verifiedUser.isVisible !== false ? '👁️‍🗨️ Hide' : '👁️ Show'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      pagination.page === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      // Show first page, last page, current page, and pages around current
                      return pageNum === 1 || 
                             pageNum === pagination.pages || 
                             Math.abs(pageNum - pagination.page) <= 1;
                    })
                    .map((pageNum, index, array) => {
                      // Add ellipsis if there's a gap
                      const prevNum = array[index - 1];
                      const showEllipsis = prevNum && pageNum - prevNum > 1;
                      
                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                          <button
                            onClick={() => setPagination({ ...pagination, page: pageNum })}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                              pagination.page === pageNum
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                    disabled={pagination.page === pagination.pages}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      pagination.page === pagination.pages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    Next →
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
