import axios from 'axios';
import Cookies from 'js-cookie';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const API_VERSION = 'v1';
const API_URL = `${BASE_URL}/api/${API_VERSION}`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication interceptor
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface DashboardStats {
  totalFeedback: number;
  openIssues: number;
  resolvedIssues: number;
  feedbackByCategory: {
    category: string;
    count: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
}

export const getDashboardStats = async (municipalityId: string): Promise<DashboardStats> => {
  const response = await api.get('/auth/me');
  const user = response.data;
  
  const statsResponse = await api.get(`/analytics/municipalities/${municipalityId}/statistics`);
  return {
    totalFeedback: statsResponse.data.totalFeedback || 0,
    openIssues: statsResponse.data.feedbackByStatus?.PENDING || 0,
    resolvedIssues: statsResponse.data.feedbackByStatus?.RESOLVED || 0,
    feedbackByCategory: Object.entries(statsResponse.data.feedbackByCategory || {}).map(([category, count]) => ({
      category,
      count: count as number,
    })),
    statusDistribution: Object.entries(statsResponse.data.feedbackByStatus || {}).map(([status, count]) => ({
      status,
      count: count as number,
    })),
  };
};

export const getFeedbackSummary = async (municipalityId: string) => {
  const response = await api.get(`/analytics/municipalities/${municipalityId}/feedback/summary`);
  return response.data;
};

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MUNICIPALITY_ADMIN' | 'USER';
  municipalityId?: string;
  municipality?: {
    name: string;
    city: string;
  };
}

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getUser = async (id: string) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: {
  email: string;
  name: string;
  password: string;
  role: User['role'];
  municipalityId?: string;
}) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const updateUser = async (id: string, data: {
  email?: string;
  name?: string;
  password?: string;
  role?: User['role'];
  municipalityId?: string;
}) => {
  const response = await api.patch(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export default api; 