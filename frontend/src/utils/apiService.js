import axios from 'axios';
import authService from './authService';

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  // baseURL: window.location.origin,
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor for handling common responses
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      authService.logout();
      window.dispatchEvent(new Event('storage')); // Trigger storage event
    }
    return Promise.reject(error);
  }
);

/**
 * API service for making HTTP requests using Axios
 * Automatically includes auth token for protected endpoints
 */
const apiService = {
  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {boolean} auth - Whether to include auth token (default: false)
   * @returns {Promise} - Promise resolving to response data
   */
  get: async (endpoint, auth = false) => {
    const headers = auth ? authService.getAuthHeader() : {};
    
    try {
      const response = await axiosInstance.get(endpoint, { headers });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error');
      }
      throw error;
    }
  },
  
  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {boolean} auth - Whether to include auth token (default: false)
   * @returns {Promise} - Promise resolving to response data
   */
  post: async (endpoint, data, auth = false) => {
    const headers = auth ? authService.getAuthHeader() : {};
    
    try {
      const response = await axiosInstance.post(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error');
      }
      throw error;
    }
  },
  
  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request body data
   * @param {boolean} auth - Whether to include auth token (default: false)
   * @returns {Promise} - Promise resolving to response data
   */
  put: async (endpoint, data, auth = false) => {
    const headers = auth ? authService.getAuthHeader() : {};
    
    try {
      const response = await axiosInstance.put(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error');
      }
      throw error;
    }
  },
  
  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @param {boolean} auth - Whether to include auth token (default: false)
   * @returns {Promise} - Promise resolving to response data
   */
  delete: async (endpoint, auth = false) => {
    const headers = auth ? authService.getAuthHeader() : {};
    
    try {
      const response = await axiosInstance.delete(endpoint, { headers });
      return response.status === 204 ? null : response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error');
      }
      throw error;
    }
  },
    
  /**
   * Upload a file with form data
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {boolean} auth - Whether to include auth token (default: true)
   * @returns {Promise} - Promise resolving to response data
   */
  uploadFile: async (endpoint, formData, auth = true) => {
    const headers = {
      ...(auth ? authService.getAuthHeader() : {}),
      'Content-Type': 'multipart/form-data'
    };
    
    try {
      const response = await axiosInstance.post(endpoint, formData, { headers });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error');
      }
      throw error;
    }
  },

  /**
   * Update with file upload using PUT method
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {boolean} auth - Whether to include auth token (default: true)
   * @returns {Promise} - Promise resolving to response data
   */  putFile: async (endpoint, formData, auth = true) => {
    const headers = {
      ...(auth ? authService.getAuthHeader() : {}),
      'Content-Type': 'multipart/form-data'
    };
    
    try {
      const response = await axiosInstance.put(endpoint, formData, { headers });
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new Error('Network error');
      }
      throw error;
    }
  },

  /**
   * Send FormData via POST or PUT, with optional auth.
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data
   * @param {object} [options] - { method: 'POST'|'PUT', auth: boolean }
   * @returns {Promise}
   */
  sendFormData: async (endpoint, formData, options = {}) => {
    const { method = 'POST', auth = true } = options;
    const headers = {
      ...(auth ? authService.getAuthHeader() : {}),
      'Content-Type': 'multipart/form-data'
    };
    if (method === 'POST') {
      const response = await axiosInstance.post(endpoint, formData, { headers });
      return response.data;
    } else if (method === 'PUT') {
      const response = await axiosInstance.put(endpoint, formData, { headers });
      return response.data;
    } else {
      throw new Error('Unsupported method for FormData: ' + method);
    }
  }
};

// Expose baseURL for use in components
apiService.baseURL = axiosInstance.defaults.baseURL;

apiService.getImageSrc = (img) => {
  if (!img) return "";
  if (typeof img === 'string') {
    if (img.startsWith('blob:') || img.startsWith('data:')) return img;
    if (img.startsWith('/uploads/')) return `${axiosInstance.defaults.baseURL || ''}${img}`;
    return img;
  }
  if (img.url) {
    if (img.url.startsWith('blob:') || img.url.startsWith('data:')) return img.url;
    if (img.url.startsWith('/uploads/')) return `${axiosInstance.defaults.baseURL || ''}${img.url}`;
    return img.url;
  }
  return "";
};

export default apiService;
