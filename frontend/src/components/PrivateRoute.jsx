// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getToken, logout } from '../utils/auth';
import { jwtDecode } from 'jwt-decode'; // ✅ This is the correct import

const PrivateRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();

  // No token? Not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const token = getToken();

  try {
    const decoded = jwtDecode(token);

    const now = Date.now() / 1000; // current time in seconds
    if (decoded.exp && decoded.exp < now) {
      logout(); // clear token
      return <Navigate to="/login" replace />;
    }

    // Admin-only route protection
    if (adminOnly && decoded.role !== 'admin') {
      return <Navigate to="/forbidden" replace />;
    }

    return children;
  } catch (err) {
    console.error('Token decode error:', err);
    logout(); // clear token
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;