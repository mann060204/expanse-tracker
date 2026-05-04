import axios from 'axios';

// In Vercel, the backend will be available at the same domain under /api
const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Simple in-memory cache for instant tab switching
const cache = new Map();

api.interceptors.request.use(async (config) => {
  if (window.Clerk && window.Clerk.session) {
    const token = await window.Clerk.session.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  // Clear cache automatically if the user adds/edits/deletes a transaction
  if (['post', 'put', 'delete'].includes(config.method)) {
    cache.clear();
  }
  
  return config;
});

// Override api.get to implement Stale-While-Revalidate caching
const originalGet = api.get;
api.get = async (url, config = {}) => {
  const cacheKey = url + (config.params ? JSON.stringify(config.params) : '');
  
  if (cache.has(cacheKey)) {
    // Silently fetch fresh data in the background
    originalGet.call(api, url, config).then(res => {
      cache.set(cacheKey, res.data);
    }).catch(() => {});
    
    // Instantly return the cached data to eliminate loading spinners
    return Promise.resolve({ data: cache.get(cacheKey) });
  }
  
  // If not in cache, wait for it and save it
  const response = await originalGet.call(api, url, config);
  cache.set(cacheKey, response.data);
  return response;
};

export default api;
