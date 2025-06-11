import {Navigate, Outlet} from 'react-router-dom';
import {useEffect, useState} from 'react';
import authService from '../utils/authService';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateAuth = async () => {
            setIsLoading(true);
            // Use the enhanced validation method that always checks with server
            const authenticated = await authService.validateBeforePageLoad();
            setIsAuthenticated(authenticated);
            setIsLoading(false);
        };

        validateAuth();

        // Listen for token invalidation events
        const handleTokenInvalid = () => {
            setIsAuthenticated(false);
        };

        const handleAuthStateChange = async () => {
            const authenticated = await authService.validateBeforePageLoad();
            setIsAuthenticated(authenticated);
        };

        window.addEventListener('authTokenInvalid', handleTokenInvalid);
        window.addEventListener('authStateChanged', handleAuthStateChange);

        return () => {
            window.removeEventListener('authTokenInvalid', handleTokenInvalid);
            window.removeEventListener('authStateChanged', handleAuthStateChange);
        };
    }, []);
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-sky-400 text-2xl font-bold">
                Verifying authentication...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }

    return <Outlet/>;
};

export default ProtectedRoute;
