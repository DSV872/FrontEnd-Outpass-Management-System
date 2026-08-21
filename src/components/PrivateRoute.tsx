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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Verifying session..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Pass current location in state so we can redirect back after login if desired
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && roles.length > 0 && user) {
        if (!roles.includes(user.role)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return <Outlet />;
};

export default PrivateRoute;
