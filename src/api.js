import axios from 'axios';

const getBaseURL = () => {
  let url = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  if (!url.endsWith('/api')) {
    url = url.endsWith('/') ? `${url}api` : `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    const status = error.response?.status;
    const data = error.response?.data || {};
    const message = data.message || data.msg || 'An unexpected error occurred';
    console.error('API Error:', message, 'status:', status);

    // Handle unauthorized / expired token centrally
    if (status === 401) {
      try {
        localStorage.removeItem('token');
      } catch (e) {
        // ignore
      }
      // Avoid redirect loop if already on login
      if (window.location.pathname !== '/login') {
        // Optional: show a brief message then redirect
        try {
          // Use replace to avoid keeping the protected page in history
          window.location.replace('/login');
        } catch (e) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
