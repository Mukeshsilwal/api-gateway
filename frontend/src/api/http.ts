import axios from "axios";

// Create an Axios instance
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/bff", // Use environment variable or default
    headers: {
        "Content-Type": "application/json",
    },
});

// Add a request interceptor
http.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed, e.g., from localStorage
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Queue to store requests waiting for token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token!);
        }
    });
    failedQueue = [];
};

const isAuthEndpoint = (url) => {
    if (!url) return false;
    const path = url.toLowerCase();
    return path.includes('/auth/login') ||
           path.includes('/auth/register') ||
           path.includes('/auth/refresh') ||
           path.includes('/auth/forgot-password') ||
           path.includes('/auth/reset-password') ||
           path.includes('/login');
};

// Add a response interceptor
http.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        const isAuthRequest = isAuthEndpoint(originalRequest?.url) || originalRequest?.skipAuthRefresh;
        const refreshToken = localStorage.getItem('refreshToken');

        // Handle 401 Unauthorized (ONLY for non-auth requests with an existing refresh token)
        if (error.response && error.response.status === 401 && !originalRequest._retry && !isAuthRequest && refreshToken) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return http(originalRequest);
                }).catch(err => {
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
                const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/bff";

                const response = await axios.post(`${baseURL}/v1/auth/refresh`, {}, {
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`,
                        'Session-Id': sessionId || ''
                    }
                });

                const newToken = response.data?.data?.accessToken || response.data?.accessToken;

                if (newToken) {
                    localStorage.setItem('token', newToken);
                    http.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
                    processQueue(null, newToken);
                    originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
                    return http(originalRequest);
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
        return Promise.reject(error);
    }
);

export default http;
