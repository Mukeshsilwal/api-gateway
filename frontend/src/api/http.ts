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

// Add a response interceptor
http.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
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

            const refreshToken = localStorage.getItem('refreshToken');
            const sessionId = localStorage.getItem('sessionId');

            if (!refreshToken) {
                isRefreshing = false;
                // Redirect to login if no refresh token
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Perform refresh using axios instance or fetch to avoid circular interceptor issues on the refresh call itself
                // but usually refresh call doesn't have same interceptors or we skip it.
                // We use a fresh axios call or the instance. If instance, need to handle 401 loop. 
                // But refresh 401 should logout.

                // Using fetch for simplicity and isolation
                // const response = await axios.post ...
                // Note: http.defaults.baseURL is defined.

                const baseURL = import.meta.env.VITE_API_BASE_URL || "/api/bff"; // Same as http creation

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
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default http;
