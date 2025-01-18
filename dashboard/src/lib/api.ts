import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token and logging
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    headers: config.headers,
    data: config.data
  });
  return config;
});

// Add response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      // Handle token expiration
      Cookies.remove('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 