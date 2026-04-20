// API Configuration
export const API_CONFIG = {
  // Use environment variable or fallback to production server
  FASTAPI_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://34.158.58.188:8000',
  
  // Get current environment
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE || 'development',
  
  // Other API configurations
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};

export default API_CONFIG;