import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Login from '../pages/auth/Login';
// import Register from '../pages/auth/Register';
import StudentDashboard from '../pages/student/Dashboard';
import ApplyOutpass from '../pages/student/ApplyOutpass';
import WardenDashboard from '../pages/warden/Dashboard';
import SecurityDashboard from '../pages/security/Dashboard';
import ParentApproval from '../pages/parent/Approval';
import { useAuth } from '../hooks/useAuth';
import { Layout, Button, Typography, Spin, Tooltip, Avatar } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    // Public routes that don't need the authenticated layout wrapper
    const publicPaths = ['/login', '/register', '/parent/approve'];
    if (publicPaths.includes(location.pathname)) {
        return <>{children}</>;
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#fff', boxShadow: '0 2px 8px #f0f1f2', zIndex: 1 }}>
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>Outpass System</Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {user && (
                        <Tooltip title={`Logged in as: ${user.email || user.id} (${user.role})`} placement="bottomRight">
                            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#1890ff' }} />
                        </Tooltip>
                    )}
                    {user && (
                        <Tooltip title="Logout">
                            <Button type="text" danger icon={<LogoutOutlined style={{ fontSize: '18px' }} />} onClick={logout} />
                        </Tooltip>
                    )}
                </div>
            </Header>
            <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff', borderRadius: 8 }}>
                {children}
            </Content>
        </Layout>
    );
};

// Component to handle auto-redirection post-login or when visiting root
const RoleRedirect: React.FC = () => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" /></div>;
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    console.log("[RoleRedirect] User is authenticated with role:", user.role);

    switch (user.role) {
        case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
        case 'PARENT': return <Navigate to="/parent/dashboard" replace />;
        case 'WARDEN': return <Navigate to="/warden/dashboard" replace />;
        case 'SECURITY': return <Navigate to="/security/dashboard" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

const AppRouter: React.FC = () => {
    return (
        <AppLayout>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                {/* <Route path="/register" element={<Register />} /> */}
                <Route path="/parent/approve" element={<ParentApproval />} />

                {/* Protected Student Routes */}
                <Route element={<PrivateRoute roles={['STUDENT']} />}>
                    <Route path="/student/dashboard" element={<StudentDashboard />} />
                    <Route path="/student/apply" element={<ApplyOutpass />} />
                </Route>

                {/* Protected Warden Route */}
                <Route element={<PrivateRoute roles={['WARDEN']} />}>
                    <Route path="/warden/dashboard" element={<WardenDashboard />} />
                </Route>

                {/* Protected Security Route */}
                <Route element={<PrivateRoute roles={['SECURITY']} />}>
                    <Route path="/security/dashboard" element={<SecurityDashboard />} />
                </Route>

                {/* Root Route to auto redirect based on token role */}
                <Route path="/" element={<RoleRedirect />} />

                {/* Catch-All */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
    );
};

export default AppRouter;
