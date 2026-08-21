import React from 'react';
import { Typography, Button, Row, Col, Space, Card, Grid } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
    SafetyCertificateOutlined,
    RocketOutlined,
    ClockCircleOutlined,
    LoginOutlined,
    MoonOutlined,
    SunOutlined
} from '@ant-design/icons';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = screens.md === false;
    const { isDark, toggleTheme } = useTheme();

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: "'Inter', 'Outfit', sans-serif",
            background: isDark ? '#000000' : '#ffffff',
            color: isDark ? '#e8e8e8' : '#1f1f1f',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Visual Ambient Orbs */}
            <div style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw',
                background: 'rgba(24, 144, 255, 0.12)', filter: 'blur(120px)', borderRadius: '50%', pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '60vw', height: '60vw',
                background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(150px)', borderRadius: '50%', pointerEvents: 'none'
            }} />

            {/* Header / Nav */}
            <header style={{
                padding: isMobile ? '16px 20px' : '24px 48px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255, 255, 255, 0.75)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
                position: 'sticky',
                top: 0,
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <div style={{
                        width: 44,
                        height: 44,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                    }}>
                        <RocketOutlined style={{ fontSize: 22, color: '#fff' }} />
                    </div>
                    <Title level={4} style={{ margin: 0, color: isDark ? '#e8e8e8' : '#1f1f1f', letterSpacing: '0.5px', fontWeight: 700, fontSize: isMobile ? 18 : 20 }}>
                        GateFlow Campus
                    </Title>
                </div>
                <Space size="small">
                    <Button
                        type="text"
                        icon={isDark ? <SunOutlined style={{ fontSize: 18, color: '#fadb14' }} /> : <MoonOutlined style={{ fontSize: 18 }} />}
                        onClick={toggleTheme}
                        style={{ color: isDark ? '#e8e8e8' : '#1f1f1f' }}
                    />
                    <Button
                        type="primary"
                        size={isMobile ? 'middle' : 'large'}
                        icon={<LoginOutlined />}
                        onClick={() => navigate('/login')}
                        style={{
                            background: isDark ? 'rgba(24, 144, 255, 0.15)' : 'rgba(24, 144, 255, 0.1)',
                            border: '1px solid rgba(24, 144, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            fontWeight: 600,
                            color: '#1890ff',
                            boxShadow: 'none'
                        }}
                    >
                        {!isMobile && "Portal Access"}
                    </Button>
                </Space>
            </header>

            {/* Hero Section */}
            <main style={{ flex: 1, padding: isMobile ? '60px 16px' : '100px 24px', position: 'relative', zIndex: 10 }}>
                <Row justify="center">
                    <Col xs={24} md={20} lg={16} xl={12} style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-block', marginBottom: 24, padding: '6px 20px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '30px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                            <Text style={{ color: '#38bdf8', fontWeight: 600, fontSize: 13, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                                Next-Gen Campus Security
                            </Text>
                        </div>
                        <Title style={{
                            fontSize: isMobile ? '2.5rem' : 'clamp(3rem, 6vw, 5.5rem)',
                            fontWeight: 800,
                            color: isDark ? '#f0f0f0' : '#1f1f1f',
                            marginBottom: 24,
                            lineHeight: 1.05,
                            letterSpacing: '-1.5px'
                        }}>
                            Frictionless Outpass {!isMobile && <br />}
                            <span style={{
                                background: 'linear-gradient(to right, #38bdf8, #a855f7)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Orchestration.
                            </span>
                        </Title>
                        <Paragraph style={{
                            fontSize: isMobile ? '1.1rem' : '1.25rem',
                            color: isDark ? '#a0a0a0' : '#595959',
                            maxWidth: '700px',
                            margin: '0 auto 48px',
                            lineHeight: 1.7
                        }}>
                            A highly optimized, multi-tenant digital gateway for students, wardens, and campus security. Eliminate paperwork and accelerate movement with secure, role-based workflows.
                        </Paragraph>

                        <Space size="large">
                            <Button
                                type="primary"
                                size={isMobile ? 'middle' : 'large'}
                                icon={<LoginOutlined />}
                                onClick={() => navigate('/login')}
                                style={{
                                    height: isMobile ? 48 : 56,
                                    padding: isMobile ? '0 32px' : '0 48px',
                                    fontSize: isMobile ? 16 : 17,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontWeight: 700,
                                    boxShadow: '0 10px 30px -5px rgba(59, 130, 246, 0.5)'
                                }}
                            >
                                Get Started
                            </Button>
                        </Space>
                    </Col>
                </Row>

                {/* Features Grid */}
                <div style={{ maxWidth: 1200, margin: isMobile ? '50px auto 0' : '100px auto 0' }}>
                    <Row gutter={[32, 32]} justify="center">
                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '24px',
                                height: '100%',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ width: 56, height: 56, background: 'rgba(56, 189, 248, 0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                    <ClockCircleOutlined style={{ fontSize: 28, color: '#38bdf8' }} />
                                </div>
                                <Title level={4} style={{ color: isDark ? '#e8e8e8' : '#1f1f1f', marginBottom: 16 }}>Instant Processing</Title>
                                <Paragraph style={{ color: isDark ? '#8c8c8c' : '#595959', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
                                    Students can request leaves dynamically. Wardens are pinged instantly for real-time approval resolution right from their devices.
                                </Paragraph>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '24px',
                                height: '100%',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ width: 56, height: 56, background: 'rgba(168, 85, 247, 0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                    <SafetyCertificateOutlined style={{ fontSize: 28, color: '#c084fc' }} />
                                </div>
                                <Title level={4} style={{ color: isDark ? '#e8e8e8' : '#1f1f1f', marginBottom: 16 }}>Cryptographic Security</Title>
                                <Paragraph style={{ color: isDark ? '#8c8c8c' : '#595959', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
                                    Gate personnel verify active outpasses using our hardened security backend. Immutable histories ensure flawless audit trails.
                                </Paragraph>
                            </Card>
                        </Col>

                        <Col xs={24} md={8}>
                            <Card bordered={false} style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.7)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '24px',
                                height: '100%',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0, 0, 0, 0.05)',
                                boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 10px 30px rgba(0,0,0,0.02)'
                            }}>
                                <div style={{ width: 56, height: 56, background: 'rgba(52, 211, 153, 0.15)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                                    <RocketOutlined style={{ fontSize: 28, color: '#34d399' }} />
                                </div>
                                <Title level={4} style={{ color: isDark ? '#e8e8e8' : '#1f1f1f', marginBottom: 16 }}>Enterprise Control</Title>
                                <Paragraph style={{ color: isDark ? '#8c8c8c' : '#595959', fontSize: 16, margin: 0, lineHeight: 1.6 }}>
                                    Deploy role-based overrides, seamlessly cycle duty schedules, and comprehensively monitor institutional traffic simultaneously.
                                </Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </main>
        </div>
    );
};

export default Landing;
