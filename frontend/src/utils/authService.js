/**
 * Auth service for handling JWT authentication
 */

// Key for storing token in localStorage
const TOKEN_KEY = 'eventify_token';
const ADMIN_KEY = 'eventify_admin';

// Auth service object
const authService = {
  /**
   * Store JWT token and admin data in localStorage
   * @param {string} token - JWT token
   * @param {object} admin - Admin data object
   */
  login: (token, admin) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  /**
   * Remove JWT token and admin data from localStorage
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },

  /**
   * Get JWT token from localStorage
   * @returns {string|null} - JWT token or null if not logged in
   */
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get admin data from localStorage
   * @returns {object|null} - Admin data or null if not logged in
   */
  getAdmin: () => {
    const adminData = localStorage.getItem(ADMIN_KEY);
    return adminData ? JSON.parse(adminData) : null;
  },

  /**
   * Check if user is logged in
   * @returns {boolean} - True if logged in, false otherwise
   */
  isLoggedIn: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get authorization header for API requests
   * @returns {object|null} - Headers object with Authorization header or null if not logged in
   */
  getAuthHeader: () => {
    const token = authService.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
};

export default authService;
