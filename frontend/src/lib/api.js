import axios from 'axios';

function normalizeBaseUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/\/+$/, '');
}

const configuredBase = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || '');
const defaultDevBase = 'http://localhost:3002';

const originBase = configuredBase || (import.meta.env.DEV ? defaultDevBase : '');
const baseURL = originBase ? `${originBase}/api` : '/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
