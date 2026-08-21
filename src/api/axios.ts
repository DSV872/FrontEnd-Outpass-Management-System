import axios from "axios";

const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "https://backend-outpass-management-system-2utp.onrender.com";

/**
 * Main API instance
 *
 * Used for Outpass Service APIs.
 */
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Auth API instance
 *
 * Used for Auth Service APIs.
 */
export const authApi = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * Attach JWT to Outpass API requests.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Attach JWT to Auth API requests when required.
 */
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * Handle Outpass API authentication errors.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            if (error.config?.headers?.['X-Skip-Auth-Redirect']) {
                return Promise.reject(error);
            }

            localStorage.removeItem("token");

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Handle Auth API authentication errors.
 */
authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            localStorage.removeItem("token");

            if (window.location.pathname !== "/login") {
                window.location.replace("/login");
            }
        }

        return Promise.reject(error);
    }
);

export default api;