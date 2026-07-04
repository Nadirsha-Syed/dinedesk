import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token dynamically
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Extract response details and handle common error codes
axiosClient.interceptors.response.use(
  (response) => {
    // Return standard api response envelope payload directly
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let validationErrors = [];

    if (error.response) {
      const { data } = error.response;
      errorMessage = data?.message || errorMessage;
      validationErrors = data?.errors || [];

      // Automatically clean credentials and redirect to login if session expires
      if (error.response.status === 401 && !originalRequest.url.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      errorMessage = 'Unable to reach the server. Please verify your internet connection.';
    }

    const parsedError = new Error(errorMessage);
    parsedError.status = error.response?.status || 500;
    parsedError.errors = validationErrors;

    return Promise.reject(parsedError);
  }
);

export default axiosClient;
