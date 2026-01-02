import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // Monitor browser navigation to prevent unauthorized access
  useEffect(() => {
    const handlePopState = () => {
      // If user navigates via browser buttons, verify authentication
      const currentToken = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');
      
      if (!currentToken || !currentUser) {
        // Clear any remaining data and force redirect
        localStorage.clear();
        sessionStorage.clear();
        window.location.replace('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Check authentication on component mount and updates
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
