import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate, Navigate } from 'react-router-dom';
import { authApi } from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, loading: authLoading } = useAuth();

    // Redirect if already authenticated
    if (!authLoading && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await authApi.post('/auth-service/auth/login', values);
            const { token } = response.data;

            login(token);
            message.success('Login successful!');

            // Navigate to the role redirect handler
            navigate('/dashboard', { replace: true });

        } catch (error: any) {
            if (error.response?.status === 401) {
                message.error('Invalid email or password');
            } else {
                message.error('Invalid Credentials');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '24px' }}>
            <Card
                bordered={false}
                style={{
                    width: '100%',
                    maxWidth: 440,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
                    borderRadius: 24,
                    background: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)'
                }}
            >
                <div
                    style={{ position: 'absolute', top: 20, right: 20, cursor: 'pointer', zIndex: 10, padding: 4 }}
                    onClick={() => navigate('/')}
                >
                    <CloseOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />
                </div>
                <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 8 }}>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                        GateFlow Campus
                    </Title>
                    <Typography.Text type="secondary">Sign in to your account</Typography.Text>
                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>

                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        {/* <Typography.Text>Don't have an account? </Typography.Text> */}
                        {/* <Button type="link" onClick={() => navigate('/register')} style={{ padding: 0 }}>Register Here</Button> */}
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
