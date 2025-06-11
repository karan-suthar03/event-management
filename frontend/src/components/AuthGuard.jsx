import {useEffect, useState} from 'react';
import authService from '../utils/authService';

/**
 * AuthGuard component that validates tokens before loading any page
 * This ensures consistent authentication state across all routes
 */
const AuthGuard = ({children}) => {
    const [isValidating, setIsValidating] = useState(true);
    const [authState, setAuthState] = useState(null);

    useEffect(() => {
        const validateAuth = async () => {
            setIsValidating(true);

            try {
                // Always validate token before loading any page
                const isAuthenticated = await authService.validateBeforePageLoad();
                setAuthState(isAuthenticated);
            } catch (error) {
                console.error('Authentication validation error:', error);
                setAuthState(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateAuth();

        // Listen for authentication state changes
        const handleAuthStateChange = () => {
            validateAuth();
        };

        const handleTokenInvalid = () => {
            setAuthState(false);
        };

        // Listen to various auth events
        window.addEventListener('storage', handleAuthStateChange);
        window.addEventListener('authTokenInvalid', handleTokenInvalid);
        window.addEventListener('authStateChanged', handleAuthStateChange);

        return () => {
            window.removeEventListener('storage', handleAuthStateChange);
            window.removeEventListener('authTokenInvalid', handleTokenInvalid);
            window.removeEventListener('authStateChanged', handleAuthStateChange);
        };
    }, []);
    // Show loading state while validating
    if (isValidating) {
        return (
            <div className="flex items-center justify-center min-h-screen text-sky-400">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400 mb-4 mx-auto"></div>
                    <div className="text-2xl font-bold">Validating Authentication...</div>
                    <div className="text-slate-400 mt-2">Please wait while we verify your session</div>
                </div>
            </div>
        );
    }

    // Pass the authenticated state to children
    return children(authState);
};

export default AuthGuard;
