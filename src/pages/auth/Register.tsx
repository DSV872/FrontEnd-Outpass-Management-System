// import React, { useState } from 'react';
// import { Form, Input, Button, Card, Typography, message } from 'antd';
// import { UserOutlined, LockOutlined } from '@ant-design/icons';
// import { useNavigate, Navigate } from 'react-router-dom';
// import { authApi } from '../../api/axios';
// import { useAuth } from '../../hooks/useAuth';

// const { Title } = Typography;

// const Register: React.FC = () => {
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     const { isAuthenticated, loading: authLoading } = useAuth();

//     // Redirect if already authenticated
//     if (!authLoading && isAuthenticated) {
//         return <Navigate to="/" replace />;
//     }

//     const onFinish = async (values: any) => {
//         setLoading(true);
//         try {
//             console.log("[Register] Sending registration request...");
//             await authApi.post('/auth/register', values);

//             message.success('Registration successful! You can now log in.');
//             navigate('/login');
//         } catch (error: any) {
//             console.error("[Register API Error]", error);
//             message.error(error.response?.data?.message || 'An error occurred during registration.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5' }}>
//             <Card
//                 style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 8 }}
//             >
//                 <div style={{ textAlign: 'center', marginBottom: 24 }}>
//                     <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
//                         Register
//                     </Title>
//                     <Typography.Text type="secondary">Create a new account</Typography.Text>
//                 </div>

//                 <Form
//                     name="register_form"
//                     onFinish={onFinish}
//                     size="large"
//                     layout="vertical"
//                 >
//                     <Form.Item
//                         name="email"
//                         rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Please enter a valid email!' }]}
//                     >
//                         <Input prefix={<UserOutlined />} placeholder="Email" />
//                     </Form.Item>

//                     <Form.Item
//                         name="password"
//                         rules={[{ required: true, message: 'Please input your Password!' }, { min: 6, message: 'Password must be at least 6 characters' }]}
//                     >
//                         <Input.Password prefix={<LockOutlined />} placeholder="Password" />
//                     </Form.Item>

//                     <Form.Item>
//                         <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: 8 }} loading={loading}>
//                             Register
//                         </Button>
//                     </Form.Item>

//                     <div style={{ textAlign: 'center' }}>
//                         <Typography.Text>Already have an account? </Typography.Text>
//                         <Button type="link" onClick={() => navigate('/login')} style={{ padding: 0 }}>Login Here</Button>
//                     </div>
//                 </Form>
//             </Card>
//         </div>
//     );
// };

// export default Register;
