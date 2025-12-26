import React, { useState, useEffect } from 'react';
import API from '../api/api';
import { API_BASE } from '../config';

export default function DebugAuth() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics = {};

    // 1. Check localStorage
    diagnostics.tokenInStorage = localStorage.getItem('token') ? 'YES ✓' : 'NO ✗';
    diagnostics.tokenValue = localStorage.getItem('token') ? 
      localStorage.getItem('token').substring(0, 20) + '...' : 'null';
    
    // 2. Check API instance baseURL
    diagnostics.apiBaseURL = API.defaults.baseURL;
    diagnostics.apiHasInterceptor = API.interceptors.request.handlers.length > 0 ? 'YES ✓' : 'NO ✗';
    
    // 3. Check API_BASE from config
    diagnostics.configApiBase = API_BASE;
    
    // 4. Check axios default headers
    diagnostics.axiosDefaultAuth = API.defaults.headers.common['Authorization'] || 'Not set';
    
    // 5. Try a test API call
    try {
      const response = await API.get('/users/me');
      diagnostics.testApiCall = 'SUCCESS ✓';
      diagnostics.testApiResponse = response.data?.name || 'Got data';
    } catch (error) {
      diagnostics.testApiCall = 'FAILED ✗';
      diagnostics.testApiError = error.response?.data?.message || error.message;
      diagnostics.testApiStatus = error.response?.status || 'No status';
    }

    // 6. Check what will be sent in next request
    const interceptorTest = API.interceptors.request.handlers[0];
    if (interceptorTest) {
      diagnostics.interceptorExists = 'YES ✓';
    } else {
      diagnostics.interceptorExists = 'NO ✗';
    }

    setResults(diagnostics);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Running diagnostics...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Auth Diagnostics</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {Object.entries(results).map(([key, value]) => (
          <div key={key} className="border-b pb-3">
            <div className="font-semibold text-gray-700">{key}:</div>
            <div className="text-sm font-mono bg-gray-100 p-2 rounded mt-1 break-all">
              {value}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={runDiagnostics}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Re-run Diagnostics
      </button>
    </div>
  );
}
