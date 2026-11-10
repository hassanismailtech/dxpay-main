import axios from 'axios';

// Relative requests use the local Next.js API proxy; credentials stay on the server.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Unable to reach the service. Please try again.';
    return Promise.reject(new Error(message));
  },
);
