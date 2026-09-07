import API_CONFIG from '../config/api';
import { formatValidationErrors } from '../utils/errorUtils';
import Logger from '../utils/logger';
import { removeSensitiveData } from '../utils/securityUtils';

const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 300; // 300ms

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL || '';
    this.isRefreshing = false;
    this.failedQueue = [];
  }

  isAuthEndpoint(endpoint) {
    if (!endpoint) return false;
    const path = typeof endpoint === 'string' ? endpoint.toLowerCase() : '';
    return path.includes('/auth/login') ||
           path.includes('/auth/register') ||
           path.includes('/auth/refresh') ||
           path.includes('/auth/forgot-password') ||
           path.includes('/auth/reset-password') ||
           path.includes('/auth/verify') ||
           path.includes('/auth/admin/login') ||
           path.includes('/auth/user/login') ||
           path.includes('/login');
  }

  getFullUrl(endpoint) {
    return `${this.baseURL}${endpoint}`;
  }

  /** Retry logic for failed requests */
  async retryRequest(fn, retries = MAX_RETRIES) {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return this.retryRequest(fn, retries - 1);
      }
      throw error;
    }
  }

  /** Determine if request should be retried */
  shouldRetry(error) {
    if (!error.response) return true;
    const status = error.response?.status;
    return (status >= 500 && status !== 501) || status === 408 || status === 429;
  }

  /** Create AbortController with timeout */
  createTimeoutController(timeout = REQUEST_TIMEOUT) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);
    return controller;
  }

  /** Extract field errors from backend error data */
  extractFieldErrors(errorData) {
    if (!errorData) return null;
    if (errorData.fieldErrors) return errorData.fieldErrors;
    if (errorData.validationErrors) return formatValidationErrors(errorData.validationErrors);
    return null;
  }

  processQueue(error, token = null) {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  async request(endpoint, options = {}) {
    const url = this.getFullUrl(endpoint);
    let token = localStorage.getItem('token');

    // Use refreshed token if available from queue processing
    if (options._retryToken) {
      token = options._retryToken;
    }

    // Get or generate correlation ID for request tracking
    let correlationId = options.correlationId;
    if (!correlationId) {
      correlationId = sessionStorage.getItem('lastCorrelationId') || this.generateCorrelationId();
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const controller = options.signal ? null : this.createTimeoutController();

    const config = {
      ...options,
      headers,
      signal: options.signal || controller?.signal,
    };

    try {
      const response = await this.retryRequest(async () => {
        return await fetch(url, config);
      }, options.retries);

      // Handle non-OK responses
      if (!response.ok) {
        const isAuthRequest = this.isAuthEndpoint(endpoint) || options.skipAuthRefresh;
        const refreshToken = localStorage.getItem('refreshToken');

        // Handle 401 Unauthorized - Refresh Token Flow (ONLY for non-auth requests with an existing refresh token)
        if (response.status === 401 && !options._retry && !isAuthRequest && refreshToken) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(newToken => {
              return this.request(endpoint, { ...options, _retry: true, _retryToken: newToken });
            });
          }

          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.isRefreshing = false;
            this.processQueue(null, newToken);
            return this.request(endpoint, { ...options, _retry: true, _retryToken: newToken });
          } catch (refreshError) {
            this.isRefreshing = false;
            this.processQueue(refreshError, null);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userRole');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/admin/login' && window.location.pathname !== '/register') {
              window.location.href = '/login';
            }
            throw refreshError;
          }
        }

        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        error.status = response.status;
        try {
          const errorData = await response.json();
          error.data = errorData;
          if (errorData && typeof errorData === 'object') {
            error.message = errorData.message || errorData.error || error.message;
            error.code = errorData.errorCode || errorData.code || `HTTP_${response.status}`;
            if (errorData.data) {
              error.details = errorData.data;
              error.fieldErrors = this.extractFieldErrors(errorData.data);
            }
            if (errorData.validationErrors || errorData.fieldErrors) {
              error.fieldErrors = errorData.validationErrors || errorData.fieldErrors;
            }
          }
        } catch (_) {
          // ignore JSON parse errors
        }
        Logger.apiError(url, error);
        throw error;
      }

      return response;
    } catch (error) {
      // Handle cancellation / timeout
      if (error.name === 'AbortError') {
        if (options.signal && options.signal.aborted) {
          throw error;
        }
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'AbortError';
        timeoutError.isTimeout = true;
        Logger.error('Request timeout:', timeoutError);
        throw timeoutError;
      }
      // Network error or other fetch errors
      Logger.error('API request failed:', removeSensitiveData(error));
      throw error;
    }
  }

  /** Generate a unique correlation ID for request tracking */
  generateCorrelationId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /** Extract and store correlation ID from response */
  extractCorrelationId(response) {
    if (!response?.headers?.get) return null;
    const correlationId = response.headers.get('X-Correlation-ID');
    if (correlationId) {
      sessionStorage.setItem('lastCorrelationId', correlationId);
      // Log correlation ID in development for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Correlation ID: ${correlationId}]`);
      }
    }
    return correlationId;
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const sessionId = localStorage.getItem('sessionId');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(this.getFullUrl(API_CONFIG.ENDPOINTS.REFRESH), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
        'Session-Id': sessionId || ''
      }
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.data?.accessToken || data.accessToken;

    if (newAccessToken) {
      localStorage.setItem('token', newAccessToken);
      return newAccessToken;
    } else {
      throw new Error('No access token in refresh response');
    }
  }

  async get(endpoint, options = {}) {
    const response = await this.request(endpoint, { ...options, method: 'GET' });
    return this.parseAndUnwrap(response);
  }

  async post(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;

    // For FormData uploads, use extended timeout to prevent EOFException
    if (isFormData && !options.signal) {
      const uploadTimeout = options.uploadTimeout || 30000; // Default 30s for FormData
      const timeoutController = this.createTimeoutController(uploadTimeout);
      options = {
        ...options,
        signal: timeoutController.signal
      };
    }

    const response = await this.request(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.parseAndUnwrap(response);
  }

  async put(endpoint, data, options = {}) {
    const isFormData = data instanceof FormData;

    // For FormData uploads, use extended timeout to prevent EOFException
    if (isFormData && !options.signal) {
      const uploadTimeout = options.uploadTimeout || 30000; // Default 30s for FormData
      const timeoutController = this.createTimeoutController(uploadTimeout);
      options = {
        ...options,
        signal: timeoutController.signal
      };
    }

    const response = await this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
    return this.parseAndUnwrap(response);
  }

  async delete(endpoint, options = {}) {
    const response = await this.request(endpoint, { ...options, method: 'DELETE' });
    return this.parseAndUnwrap(response);
  }

  /** Parse JSON response and return full response object */
  async parseAndUnwrap(response) {
    try {
      // Extract correlation ID from response headers
      this.extractCorrelationId(response);

      // Check content type to determine how to parse
      const contentType = response?.headers?.get ? response.headers.get('content-type') : null;

      // If response is text/plain, return the text directly
      if (contentType && contentType.includes('text/plain')) {
        const text = await response.text();
        return text;
      }

      // Otherwise, try to parse as JSON
      const jsonData = await response.json();
      // Return the full object structure: { code, message, data }
      // If the backend doesn't follow this structure, return jsonData as is
      return jsonData;
    } catch (error) {
      Logger.error('Failed to parse response:', error);
      throw new Error('Invalid response format');
    }
  }

  /** Deprecated helper */
  async parseResponse(response) {
    return this.parseAndUnwrap(response);
  }

  /** Format validation errors from array to object */
  formatValidationErrors(errors) {
    if (!Array.isArray(errors)) return {};
    const formatted = {};
    errors.forEach(error => {
      if (error.field && error.message) {
        formatted[error.field] = error.message;
      } else if (error.property && error.constraints) {
        const messages = Object.values(error.constraints);
        formatted[error.property] = messages[0] || 'Invalid value';
      }
    });
    return formatted;
  }
}

export default new ApiService();
