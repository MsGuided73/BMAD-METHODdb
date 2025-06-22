// API utility functions for frontend
// Centralized API configuration and helper functions

/**
 * Get the API base URL from environment variables
 * @returns {string} The API base URL
 */
export const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Get the backend URL from environment variables
 * @returns {string} The backend URL
 */
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
};

/**
 * Create API request headers with authentication if available
 * @returns {Object} Headers object
 */
export const getApiHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available (browser environment only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('bmad_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} The fetch response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultOptions = {
    headers: getApiHeaders(),
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};

/**
 * Make an authenticated API request and parse JSON response
 * @param {string} endpoint - The API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} The parsed JSON response
 */
export const apiRequestJson = async (endpoint, options = {}) => {
  const response = await apiRequest(endpoint, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
};
