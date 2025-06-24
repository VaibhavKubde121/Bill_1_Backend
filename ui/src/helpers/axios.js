import axios from 'axios';

// ✅ Determine the API base URI based on the environment
const API_BASE_URI = import.meta.env.DEV
  ? 'http://localhost:5000'
  : import.meta.env.VITE_APP_BACKEND_URI || 'https://your-production-api.com'; // <-- fallback URI

// ✅ Create an axios instance with base URL
const axiosInstance = axios.create({
  baseURL: API_BASE_URI,
  timeout: 10000,
});

export default axiosInstance;
