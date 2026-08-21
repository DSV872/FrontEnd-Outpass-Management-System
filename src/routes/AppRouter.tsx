import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
// import Register from '../pages/auth/Register';
import { useAuth } from '../hooks/useAuth';
import { Layout, Button, Typography, Spin, Tooltip, Avatar, Grid, Modal } from 'antd';
import { LogoutOutlined, UserOutlined, MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '../context/ThemeContext';

const Login = lazy(() => import('../pages/auth/Login'));
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const ApplyOutpass = lazy(() => import('../pages/student/ApplyOutpass'));
const WardenDashboard = lazy(() => import('../pages/warden/Dashboard'));
const SecurityDashboard = lazy(() => import('../pages/security/Dashboard'));
const ParentApproval = lazy(() => import('../pages/parent/Approval'));
const AdminWardenDuty = lazy(() => import('../pages/admin/WardenDuty'));
const AdminUserManagement = lazy(() => import('../pages/admin/UserManagement'));
const Landing = lazy(() => import('../pages/public/Landing'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));

const { Header, Content } = Layout;
const { Title } = Typography;

const roleGradient: Record<string, string> = {
    STUDENT: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    WARDEN: 'linear-gradient(135deg, #10b981, #059669)',
    SECURITY: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    ADMIN: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    PARENT: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const screens = Grid.useBreakpoint();
    const isMobile = screens.md === false;
    const { isDark, toggleTheme } = useTheme();
    const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);

    // Public routes that don't need the authenticated layout wrapper
    const publicPaths = ['/', '/login', '/register', '/parent/approve'];
    if (publicPaths.includes(location.pathname)) {
        return <>{children}</>;
    }

    const handleLogout = () => setLogoutModalOpen(true);

    const confirmLogout = () => {
        setLogoutModalOpen(false);
        logout();
        navigate('/');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: isMobile ? '0 16px' : '0 24px',
                background: isDark ? '#050505' : '#fff',
                boxShadow: isDark ? '0 2px 8px #000' : '0 2px 8px #f0f1f2',
                zIndex: 1,
                height: 'auto',
                minHeight: 64,
                flexWrap: 'wrap'
            }}>
                <Title
                    level={isMobile ? 5 : 4}
                    style={{ margin: isMobile ? '8px 0' : 0, color: '#1890ff', whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => navigate('/dashboard')}
                >
                    GateFlow Campus
                </Title>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 16, margin: isMobile ? '8px 0' : 0, flexWrap: 'wrap' }}>
                    {user?.role === 'ADMIN' && (
                        <div style={{ display: 'flex', gap: 8, marginRight: isMobile ? 0 : 16 }}>
                            <Button
                                type={location.pathname === '/admin/warden-duty' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => navigate('/admin/warden-duty')}
                            >
                                Warden Duty
                            </Button>
                            <Button
                                type={location.pathname === '/admin/users' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => navigate('/admin/users')}
                            >
                                User Management
                            </Button>
                        </div>
                    )}
                    <Tooltip title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        <Button
                            type="text"
                            icon={isDark ? <SunOutlined style={{ fontSize: 18, color: '#fadb14' }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
                            onClick={toggleTheme}
                        />
                    </Tooltip>
                    {user && user.role !== 'ADMIN' ? (
                        <Tooltip title={`${user.email || user.id} · ${user.role} — View Profile`} placement="bottomRight">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/profile')}>
                                <Avatar icon={<UserOutlined />} style={{ background: roleGradient[user.role] ?? '#1890ff', flexShrink: 0 }} />
                                {!isMobile && (
                                    <Typography.Text style={{ color: isDark ? '#e8e8e8' : '#1f1f1f', fontSize: 13, maxWidth: 160 }} ellipsis>
                                        {user.email || user.id}
                                    </Typography.Text>
                                )}
                            </div>
                        </Tooltip>
                    ) : user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Avatar icon={<UserOutlined />} style={{ background: roleGradient[user.role] ?? '#722ed1', flexShrink: 0 }} />
                            {!isMobile && (
                                <Typography.Text style={{ color: isDark ? '#e8e8e8' : '#1f1f1f', fontSize: 13, maxWidth: 160 }} ellipsis>
                                    {user.email || user.id}
                                </Typography.Text>
                            )}
                        </div>
                    )}
                    {user && (
                        <Tooltip title="Logout">
                            <Button type="text" danger icon={<LogoutOutlined style={{ fontSize: '18px' }} />} onClick={handleLogout} />
                        </Tooltip>
                    )}
                </div>
            </Header>
            <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: isDark ? '#0a0a0a' : '#fff', borderRadius: 8 }}>
                {children}
            </Content>

            {/* Logout Confirmation Modal — inside tree so ConfigProvider dark theme applies */}
            <Modal
                title="Confirm Logout"
                open={logoutModalOpen}
                onOk={confirmLogout}
                onCancel={() => setLogoutModalOpen(false)}
                okText="Yes, Logout"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
                centered
            >
                <p style={{ marginTop: 8 }}>Are you sure you want to log out?</p>
            </Modal>
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

    switch (user.role) {
        case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
        case 'PARENT': return <Navigate to="/parent/dashboard" replace />;
        case 'WARDEN': return <Navigate to="/warden/dashboard" replace />;
        case 'SECURITY': return <Navigate to="/security/dashboard" replace />;
        case 'ADMIN': return <Navigate to="/admin/warden-duty" replace />;
        default: return <Navigate to="/login" replace />;
    }
};

const PublicBase: React.FC = () => {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const { isDark } = useTheme();

    return (
        <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: isDark ? '#000000' : '#020617' }}>
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                filter: isLogin ? 'blur(6px) brightness(0.8)' : 'none',
                transition: 'filter 0.4s ease',
                overflowY: 'auto'
            }}>
                <Landing />
            </div>

            {isLogin && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflowY: 'auto'
                }}>
                    <Login />
                </div>
            )}
            {/* Empty outlet strictly for router matching */}
            <div style={{ display: 'none' }}><Outlet /></div>
        </div>
    );
};

const AppRouter: React.FC = () => {
    return (
        <AppLayout>
            <Suspense fallback={<div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" tip="Loading Page..." /></div>}>
                <Routes>
                    {/* Unified Public Layer */}
                    <Route element={<PublicBase />}>
                        <Route path="/" element={<></>} />
                        <Route path="/login" element={<></>} />
                    </Route>

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

                    {/* Protected Admin Route */}
                    <Route element={<PrivateRoute roles={['ADMIN']} />}>
                        <Route path="/admin/warden-duty" element={<AdminWardenDuty />} />
                        <Route path="/admin/users" element={<AdminUserManagement />} />
                    </Route>

                    {/* Profile Route (Student, Warden, Security) */}
                    <Route element={<PrivateRoute roles={['STUDENT', 'WARDEN', 'SECURITY']} />}>
                        <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Role-based abstract redirect */}
                    <Route path="/dashboard" element={<RoleRedirect />} />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </AppLayout>
    );
};

export default AppRouter;
