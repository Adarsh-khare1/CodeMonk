import axios, { AxiosError, AxiosResponse } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

console.log('🔗 API configuration:', {
  baseURL: API_URL,
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString()
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with logging
api.interceptors.request.use(
  (config) => {
    const startTime = Date.now();

    // Add request metadata
    (config as any).metadata = { startTime };

    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      withCredentials: config.withCredentials ?? true,
      dataSize: config.data ? JSON.stringify(config.data).length : 0,
      timestamp: new Date().toISOString()
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', {
      error: error.message,
      config: error.config,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    const metadata = (response.config as any).metadata;
    const duration = metadata ? Date.now() - metadata.startTime : 0;

    console.log('📥 API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: `${duration}ms`,
      dataSize: JSON.stringify(response.data).length,
      timestamp: new Date().toISOString()
    });

    return response;
  },
  (error: AxiosError) => {
    const metadata = error.config ? (error.config as any).metadata : null;
    const duration = metadata ? Date.now() - metadata.startTime : 0;

    const status = error.response?.status ?? 0;

    const errorDetails = {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status,
      statusText: error.response?.statusText,
      duration: `${duration}ms`,
      data: error.config?.data,
      responseData: error.response?.data,
      message: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    };

    console.error('❌ API Error:', errorDetails);

    // Handle specific error types
    if (error.response?.status === 401) {
      console.warn('🔐 Unauthorized - clearing auth state');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:logout'));
      }
    } else if (error.response?.status === 403) {
      console.warn('🚫 Forbidden access');
    } else if (status >= 500) {
      console.error('💥 Server error');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏰ Request timeout');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('🌐 Network error - server unreachable');
    }

    // Enhanced error object
    const enhancedError = {
      ...error,
      details: errorDetails,
      isNetworkError: !error.response,
      isClientError: status >= 400 && status < 500,
      isServerError: status >= 500,
    };

    return Promise.reject(enhancedError);
  }
);

// Utility functions for common API operations with error handling
export const apiUtils = {
  async getWithRetry(url: string, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 API GET attempt ${i + 1}/${retries}:`, url);
        const response = await api.get(url);
        return response;
      } catch (error: any) {
        console.warn(`⚠️ API GET attempt ${i + 1} failed:`, error.message);

        if (i === retries - 1) {
          console.error('❌ All retry attempts failed');
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  },

  async postWithRetry(url: string, data: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`🔄 API POST attempt ${i + 1}/${retries}:`, url);
        const response = await api.post(url, data);
        return response;
      } catch (error: any) {
        console.warn(`⚠️ API POST attempt ${i + 1} failed:`, error.message);

        if (i === retries - 1) {
          console.error('❌ All retry attempts failed');
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
};

export default api;
