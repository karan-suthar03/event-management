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

        // Start token validation after a short delay
        // This prevents immediate validation which might fail due to timing issues
        setTimeout(() => {
            authService.startTokenValidationInterval();
        }, 1000);

        // Dispatch authentication state change event
        window.dispatchEvent(new CustomEvent('authStateChanged'));
    },

    /**
     * Enhanced logout with cleanup
     */
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ADMIN_KEY);
        authService.stopTokenValidationInterval();
        // Dispatch authentication state change event
        window.dispatchEvent(new CustomEvent('authStateChanged'));
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
     * Validate JWT token with server
     * @returns {Promise<boolean>} - True if token is valid, false otherwise
     */
    validateToken: async () => {
        const token = authService.getToken();
        if (!token) {
            return false;
        }        try {
            const response = await fetch('https://eventify-backend.karansuthar.works/api/auth/validate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.valid === true;
            } else {
                // Handle specific status codes
                if (response.status === 403) {
                    console.log('403 Forbidden error: Token rejected by server');
                    // Clear any stored authentication data
                    authService.logout();
                }
                return false;
            }
        } catch (error) {
            console.error('Token validation failed:', error);
            // Network error or server issue, assume token is invalid
            authService.logout();
            return false;
        }
    },

    /**
     * Check if token is expired based on its content
     * @returns {boolean} - True if token is expired, false otherwise
     */
    isTokenExpired: () => {
        const token = authService.getToken();
        if (!token) {
            return true;
        }

        try {
            // Decode JWT payload (without verification)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            return payload.exp < currentTime;
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    },
    /**
     * Check if user is authenticated with server validation
     * @returns {Promise<boolean>} - True if authenticated, false otherwise
     */
    isAuthenticated: async () => {
        if (!authService.isLoggedIn()) {
            return false;
        }

        // Check if token is expired locally first
        if (authService.isTokenExpired()) {
            authService.logout();
            return false;
        }

        // Validate with server
        return await authService.validateToken();
    },
    /**
     * Initialize authentication state and set up periodic validation
     * @returns {Promise<boolean>} - True if authenticated, false otherwise
     */
    initializeAuth: async () => {
        const authenticated = await authService.isAuthenticated();

        // Set up periodic token validation (every 5 minutes)
        if (authenticated) {
            authService.startTokenValidationInterval();
        }

        return authenticated;
    },

    /**
     * Always validate token before any page load
     * This ensures consistent authentication state across all routes
     * @returns {Promise<boolean>} - True if authenticated, false otherwise
     */
    validateBeforePageLoad: async () => {
        // If no token exists, user is not authenticated
        if (!authService.isLoggedIn()) {
            return false;
        }

        // Check if token is expired locally first (faster check)
        if (authService.isTokenExpired()) {
            authService.logout();
            window.dispatchEvent(new CustomEvent('authTokenInvalid'));
            return false;
        }

        // Always validate with server to ensure token is still valid
        const isValid = await authService.validateToken();

        if (!isValid) {
            // Token is invalid, trigger logout and cleanup
            authService.logout();
            window.dispatchEvent(new CustomEvent('authTokenInvalid'));
            return false;
        }

        // Token is valid, ensure periodic validation is running
        authService.startTokenValidationInterval();
        return true;
    },

    /**
     * Start periodic token validation
     */
    startTokenValidationInterval: () => {
        // Clear any existing interval
        if (authService._validationInterval) {
            clearInterval(authService._validationInterval);
        }

        // Set up new interval (validate every 5 minutes)
        authService._validationInterval = setInterval(async () => {
            const isValid = await authService.validateToken();
            if (!isValid) {
                // Token is invalid, trigger logout
                window.dispatchEvent(new CustomEvent('authTokenInvalid'));
            }
        }, 5 * 60 * 1000); // 5 minutes
    },
    /**
     * Stop periodic token validation
     */
    stopTokenValidationInterval: () => {
        if (authService._validationInterval) {
            clearInterval(authService._validationInterval);
            authService._validationInterval = null;
        }
    },

    /**
     * Get authorization header for API requests
     * @returns {object|null} - Headers object with Authorization header or null if not logged in
     */
    getAuthHeader: () => {
        const token = authService.getToken();
        return token ? {'Authorization': `Bearer ${token}`} : {};
    }
};

export default authService;
