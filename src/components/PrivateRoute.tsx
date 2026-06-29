import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spin } from 'antd';

interface PrivateRouteProps {
    roles?: Array<string>;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ roles }) => {
    const { user, isAuthenticated, loading } = useAuth();
    const location = useLocation();

    console.log(`[PrivateRoute] Checking path: ${location.pathname}`);
    console.log(`[PrivateRoute] Auth state - loading: ${loading}, isAuthenticated: ${isAuthenticated}`);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Verifying session..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log("[PrivateRoute] User not authenticated. Redirecting to /login");
        // Pass current location in state so we can redirect back after login if desired
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && roles.length > 0 && user) {
        if (!roles.includes(user.role)) {
            console.warn(`[PrivateRoute] Role mismatch! User role '${user.role}' not in required roles:`, roles);
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
};

export default PrivateRoute;
