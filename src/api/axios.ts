import axios from 'axios';

/**
 * Main API instance
 */
const api = axios.create({
    baseURL: 'http://localhost:8080/outpass-service',
});

/**
 * Auth API instance
 */
export const authApi = axios.create({
    baseURL: 'http://localhost:8080/auth-service',
});

/**
 * Request Interceptor
 * Adds JWT token automatically
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Redirects user to login when token is invalid/expired
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {

        const status = error.response?.status;

        if (status === 401 || status === 403) {

            console.log(
                '[Axios] Session expired or unauthorized. Redirecting to login.'
            );

            localStorage.removeItem('token');

            if (window.location.pathname !== '/login') {
                window.location.replace('/login');
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Auth API Request Interceptor
 * Optional: attach token if needed
 */
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Auth API Response Interceptor
 */
authApi.interceptors.response.use(
    (response) => response,
    (error) => {

        const status = error.response?.status;

        if (status === 401 || status === 403) {

            localStorage.removeItem('token');

            if (window.location.pathname !== '/login') {
                window.location.replace('/login');
            }
        }

        return Promise.reject(error);
    }
);

export default api;