import { Navigate, Outlet } from 'react-router-dom';
import authService from '../utils/authService';

const ProtectedRoute = () => {
  const isAuthenticated = authService.isLoggedIn();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
