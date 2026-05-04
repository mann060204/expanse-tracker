import axios from 'axios';

// In Vercel, the backend will be available at the same domain under /api
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  if (window.Clerk && window.Clerk.session) {
    const token = await window.Clerk.session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Explicitly send the active Organization ID to the backend
    // This fixes issues where the session token doesn't include the org_id by default
    if (window.Clerk.organization) {
      config.headers['x-org-id'] = window.Clerk.organization.id;
    }
  }
  return config;
});

export default api;
