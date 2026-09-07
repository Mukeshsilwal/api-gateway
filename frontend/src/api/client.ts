import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Constants
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

// Types
export interface ApiError {
    message: string;
    code?: string;
    errorCode?: string;
    status?: number;
    statusCode?: number;
    fieldErrors?: Record<string, string>;
    validationErrors?: Record<string, string>;
}

// Client Instance
const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const BASE_URL = rawBaseUrl
    ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
    : '/api';

const client: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper: Exponential Backoff + Jitter
const getRetryDelay = (attempt: number): number => {
    const baseDelay = 1000;
    const exponential = Math.pow(2, attempt) * baseDelay;
    const jitter = Math.random() * 200;
    return exponential + jitter;
};

// Request Interceptor: Auth & Headers
client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Prevent duplicate '/api' prefix when endpoint path also starts with '/api/'
        if (config.url?.startsWith('/api/') && (config.baseURL?.endsWith('/api') || config.baseURL === '/api')) {
            config.url = config.url.replace(/^\/api/, '');
        }

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add Session-Id header for BFF
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            config.headers['Session-Id'] = sessionId;
        }

        // Add Username and User-Id headers for BFF endpoints
        const userDataStr = localStorage.getItem('userData');
        if (userDataStr) {
            try {
                const userData = JSON.parse(userDataStr);
                if (userData.email) {
                    config.headers['Username'] = userData.email;
                }
                if (userData.id) {
                    config.headers['User-Id'] = userData.id.toString();
                }
            } catch (e) {
                console.warn('Failed to parse userData from localStorage');
            }
        }

        // Add Request ID for tracing
        if (!config.headers['X-Request-ID']) {
            config.headers['X-Request-ID'] = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Queue to store requests waiting for token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

const isAuthEndpoint = (url?: string): boolean => {
    if (!url) return false;
    const path = url.toLowerCase();
    return path.includes('/auth/login') ||
           path.includes('/auth/register') ||
           path.includes('/auth/refresh') ||
           path.includes('/auth/forgot-password') ||
           path.includes('/auth/reset-password') ||
           path.includes('/login');
};

// Response Interceptor: Retries & Error Handling
client.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number; skipAuthRefresh?: boolean };
        const isAuthRequest = isAuthEndpoint(originalRequest?.url) || originalRequest?.skipAuthRefresh;
        const refreshToken = localStorage.getItem('refreshToken');

        // Handle 401 Unauthorized - Refresh Token Flow (ONLY for non-auth requests with an existing refresh token)
        if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRequest && refreshToken) {
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        return client(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const sessionId = localStorage.getItem('sessionId');

            if (!refreshToken) {
                isRefreshing = false;
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }

            try {
                // Perform refresh
                const refreshEndpoint = BASE_URL.endsWith('/api')
                    ? `${BASE_URL}/bff/v1/auth/refresh`
                    : `${BASE_URL}/api/bff/v1/auth/refresh`;

                const response = await axios.post(refreshEndpoint, {}, {
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`,
                        'Session-Id': sessionId || ''
                    }
                });

                const newToken = response.data?.data?.accessToken || response.data?.accessToken;

                if (newToken) {
                    localStorage.setItem('token', newToken);

                    if (client.defaults.headers.common) {
                        client.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                    }

                    processQueue(null, newToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }

                    return client(originalRequest);
                } else {
                    throw new Error('No access token in refresh response');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userRole');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle 429 Too Many Requests (Rate Limit)
        if (error.response?.status === 429 && originalRequest) {
            const retryAfter = error.response.headers['retry-after'];
            if (retryAfter) {
                const waitMs = parseInt(retryAfter, 10) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitMs));
                return client(originalRequest);
            }
        }

        // Retry Logic (5xx errors or Network errors)
        const shouldRetry =
            originalRequest &&
            (!originalRequest._retryCount || originalRequest._retryCount < MAX_RETRIES);

        const isRetryableError =
            !error.response || // Network Error
            (error.response.status >= 500 && error.response.status < 600); // Server Error

        if (shouldRetry && isRetryableError) {
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
            const delay = getRetryDelay(originalRequest._retryCount);

            await new Promise(resolve => setTimeout(resolve, delay));
            return client(originalRequest);
        }

        // Normalize Error Payload
        const responseData = error.response?.data as any;
        const validationMap = responseData?.validationErrors || responseData?.fieldErrors || undefined;
        const statusCode = error.response?.status;

        const apiError: ApiError = {
            message: responseData?.message || responseData?.error || error.message || 'An unexpected error occurred. Please try again.',
            code: responseData?.errorCode || responseData?.code || (statusCode ? `HTTP_${statusCode}` : 'NETWORK_ERROR'),
            errorCode: responseData?.errorCode || responseData?.code,
            status: statusCode,
            statusCode: statusCode,
            fieldErrors: validationMap,
            validationErrors: validationMap,
        };

        return Promise.reject(apiError);
    }
);

export default client;
