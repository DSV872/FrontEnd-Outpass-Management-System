import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
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
        console.log("[Login] Already authenticated, redirecting to root.");
        return <Navigate to="/" replace />;
    }

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            console.log("[Login] Sending authentication request...");
            const response = await authApi.post('/auth-service/auth/login', values);
            console.log(response)
            const { token } = response.data;

            console.log("[Login] Token received successfully.");
            login(token);
            message.success('Login successful!');

            // Navigate to the role redirect handler
            navigate('/', { replace: true });

        } catch (error: any) {
            console.error("[Login API Error]", error);
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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
            <Card
                style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}
            >
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                        Outpass System
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
