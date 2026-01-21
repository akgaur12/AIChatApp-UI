import axios from 'axios';
import { config } from '../config';

const client = axios.create({
    baseURL: config.API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the auth token
client.interceptors.request.use(
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

let onLogout = null;

export const setLogoutHandler = (handler) => {
    onLogout = handler;
};

// Add a response interceptor to handle token expiration
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            if (onLogout) {
                onLogout();
            }
        }
        return Promise.reject(error);
    }
);

export default client;
