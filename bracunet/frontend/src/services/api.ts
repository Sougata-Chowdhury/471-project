import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example API call to get alumni data
export const getAlumni = async () => {
  try {
    const response = await api.get('/alumni');
    return response.data;
  } catch (error) {
    throw new Error('Error fetching alumni data');
  }
};

// Example API call to register a user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error('Error registering user');
  }
};

// Example API call to login a user
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw new Error('Error logging in user');
  }
};

export default api;