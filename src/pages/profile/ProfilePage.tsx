import React, { useEffect, useState } from 'react';
import {
    Form, Input, InputNumber, Button, Card, Typography,
    Space, Tag, Spin, message, Row, Col, Avatar, Divider, Grid
} from 'antd';
import {
    UserOutlined, EditOutlined, SaveOutlined,
    CloseOutlined, ArrowLeftOutlined,
    PhoneOutlined, MailOutlined, IdcardOutlined,
    CalendarOutlined, HomeOutlined, SafetyOutlined, BookOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {
    getStudentProfile, updateStudentProfile,
    getWardenProfile, updateWardenProfile,
    getSecurityProfile, updateSecurityProfile,
} from '../../services/profileService';
import type { StudentProfile, WardenProfile, SecurityProfile } from '../../services/profileService';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

type AnyProfile = StudentProfile | WardenProfile | SecurityProfile;

const roleGradient: Record<string, string> = {
    STUDENT: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    WARDEN: 'linear-gradient(135deg, #10b981, #059669)',
    SECURITY: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    ADMIN: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    PARENT: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
};

const roleTagColor: Record<string, string> = {
    STUDENT: 'blue', WARDEN: 'green', SECURITY: 'orange', ADMIN: 'purple', PARENT: 'cyan',
};

// ── Small labelled info tile ──────────────────────────────────────────────────
const InfoTile: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string | number | null;
    isDark: boolean;
}> = ({ icon, label, value, isDark }) => (
    <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '14px 16px',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
        borderRadius: 12,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
    }}>
        <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: '#6366f1', fontSize: 16,
        }}>
            {icon}
        </div>
        <div style={{ minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 2 }}>
                {label}
            </Text>
            <Text strong style={{ fontSize: 14, color: isDark ? '#e8e8e8' : '#1f1f1f', wordBreak: 'break-word' }}>
                {value ?? <Text type="secondary">—</Text>}
            </Text>
        </div>
    </div>
);

// ────────────────────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const screens = useBreakpoint();
    const isMobile = screens.md === false;
    const { isDark } = useTheme();
    const [form] = Form.useForm();

    const [profile, setProfile] = useState<AnyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let data: AnyProfile;
            if (user.role === 'STUDENT') data = await getStudentProfile(user.id);
            else if (user.role === 'WARDEN') data = await getWardenProfile(user.id);
            else if (user.role === 'SECURITY') data = await getSecurityProfile(user.id);
            else { setLoading(false); return; }
            setProfile(data);
            form.setFieldsValue(data);
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, [user]);

    const handleSave = async (values: any) => {
        if (!user || !profile) return;
        setSaving(true);
        try {
            let updated: AnyProfile;
            if (user.role === 'STUDENT') {
                updated = await updateStudentProfile(user.id, {
                    firstName: values.firstName, lastName: values.lastName,
                    phoneNumber: values.phoneNumber, department: values.department,
                    yearOfStudy: values.yearOfStudy, section: values.section,
                });
            } else if (user.role === 'WARDEN') {
                updated = await updateWardenProfile(user.id, {
                    firstName: values.firstName, lastName: values.lastName,
                    phoneNumber: values.phoneNumber, hostelName: values.hostelName,
                });
            } else {
                updated = await updateSecurityProfile(user.id, {
                    firstName: values.firstName, lastName: values.lastName,
                    phoneNumber: values.phoneNumber, gateName: values.gateName,
                });
            }
            setProfile(updated);
            form.setFieldsValue(updated);
            setEditing(false);
            message.success('Profile updated successfully!');
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    if (!user || !['STUDENT', 'WARDEN', 'SECURITY'].includes(user.role)) {
        return <div style={{ padding: 48, textAlign: 'center' }}><Text type="secondary">Profile management is not available for your role.</Text></div>;
    }

    if (loading) {
        return <div style={{ height: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Spin size="large" tip="Loading profile..." /></div>;
    }

    const p = profile as any;
    const fullName = p ? `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() : user.id;

    // ── Role-specific view tiles ─────────────────────────────────────────
    const roleTiles = () => {
        if (user.role === 'STUDENT') return (
            <>
                <Col xs={24} sm={12} md={8}><InfoTile isDark={isDark} icon={<BookOutlined />} label="Department" value={p?.department} /></Col>
                <Col xs={24} sm={12} md={8}><InfoTile isDark={isDark} icon={<IdcardOutlined />} label="Section" value={p?.section} /></Col>
                <Col xs={24} sm={12} md={8}><InfoTile isDark={isDark} icon={<CalendarOutlined />} label="Year of Study" value={p?.yearOfStudy ? `Year ${p.yearOfStudy}` : null} /></Col>
            </>
        );
        if (user.role === 'WARDEN') return (
            <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<HomeOutlined />} label="Hostel Name" value={p?.hostelName} /></Col>
        );
        if (user.role === 'SECURITY') return (
            <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<SafetyOutlined />} label="Gate Name" value={p?.gateName} /></Col>
        );
        return null;
    };

    // ── Role-specific edit fields ────────────────────────────────────────
    const roleEditFields = () => {
        if (user.role === 'STUDENT') return (
            <>
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item name="department" label="Department" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item name="section" label="Section" rules={[{ required: true }]}><Input /></Form.Item>
                    </Col>
                </Row>
                <Form.Item name="yearOfStudy" label="Year of Study" rules={[{ required: true }]}>
                    <InputNumber min={1} max={5} style={{ width: '100%' }} />
                </Form.Item>
            </>
        );
        if (user.role === 'WARDEN') return (
            <Form.Item name="hostelName" label="Hostel Name" rules={[{ required: true }]}><Input /></Form.Item>
        );
        if (user.role === 'SECURITY') return (
            <Form.Item name="gateName" label="Gate Name" rules={[{ required: true }]}><Input /></Form.Item>
        );
        return null;
    };

    const gradient = roleGradient[user.role] ?? 'linear-gradient(135deg,#3b82f6,#6366f1)';

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 4px' : 0 }}>
            {/* Back */}
            <Button icon={<ArrowLeftOutlined />} type="text" style={{ marginBottom: 16, paddingLeft: 0 }} onClick={() => navigate('/dashboard')}>
                Back to Dashboard
            </Button>

            {/* ── Hero Banner ─────────────────────────────────────────────── */}
            <Card
                bordered={false}
                style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 20 }}
                bodyStyle={{ padding: 0 }}
            >
                {/* Gradient strip */}
                <div style={{ height: 120, background: gradient, position: 'relative' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 70%)'
                    }} />
                </div>

                {/* Avatar + name row */}
                <div style={{ padding: isMobile ? '0 20px 24px' : '0 32px 28px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <Avatar
                            size={isMobile ? 72 : 90}
                            icon={<UserOutlined />}
                            style={{
                                background: gradient,
                                border: `4px solid ${isDark ? '#000' : '#fff'}`,
                                marginTop: -44,
                                flexShrink: 0,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                            }}
                        />
                        {!editing ? (
                            <Button icon={<EditOutlined />} type="primary" onClick={() => setEditing(true)} style={{ marginBottom: 4 }}>
                                {isMobile ? 'Edit' : 'Edit Profile'}
                            </Button>
                        ) : (
                            <Space style={{ marginBottom: 4 }}>
                                <Button icon={<CloseOutlined />} onClick={() => { form.setFieldsValue(profile); setEditing(false); }}>Cancel</Button>
                                <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => form.submit()}>Save</Button>
                            </Space>
                        )}
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>{fullName || user.id}</Title>
                        <Space size={8} style={{ marginTop: 6, flexWrap: 'wrap' }}>
                            <Tag color={roleTagColor[user.role]}>{user.role}</Tag>
                            <Text type="secondary" style={{ fontSize: 13 }}>{user.email || user.id}</Text>
                        </Space>
                    </div>
                </div>
            </Card>

            {editing ? (
                /* ── Edit Form ──────────────────────────────────────────────── */
                <Card bordered={false} style={{ borderRadius: 20 }} title="Edit Profile">
                    <Form form={form} layout="vertical" onFinish={handleSave}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12}>
                                <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}><Input /></Form.Item>
                            </Col>
                        </Row>
                        <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}><Input /></Form.Item>
                        {roleEditFields()}
                    </Form>
                </Card>
            ) : (
                /* ── View Mode ──────────────────────────────────────────────── */
                <>
                    {/* Core info */}
                    <Card bordered={false} style={{ borderRadius: 20, marginBottom: 20 }} title="Personal Information">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<UserOutlined />} label="Full Name" value={fullName} /></Col>
                            <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<MailOutlined />} label="Email" value={user.email} /></Col>
                            <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<PhoneOutlined />} label="Phone" value={p?.phoneNumber} /></Col>
                            <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<IdcardOutlined />} label="User ID" value={p?.userId || user.id} /></Col>
                        </Row>
                    </Card>

                    {/* Role-specific info */}
                    <Card bordered={false} style={{ borderRadius: 20, marginBottom: 20 }} title="Role Information">
                        <Row gutter={[16, 16]}>
                            {roleTiles()}
                        </Row>
                    </Card>

                    {/* Parent info for students */}
                    {user.role === 'STUDENT' && (
                        <Card bordered={false} style={{ borderRadius: 20, marginBottom: 20 }} title="Parent / Guardian">
                            <Row gutter={[16, 16]}>
                                <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<UserOutlined />} label="Name" value={p?.parentName} /></Col>
                                <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<MailOutlined />} label="Email" value={p?.parentEmail} /></Col>
                                <Col xs={24} sm={12}><InfoTile isDark={isDark} icon={<PhoneOutlined />} label="Phone" value={p?.parentPhone} /></Col>
                            </Row>
                        </Card>
                    )}

                    {/* Timestamps */}
                    <Card bordered={false} style={{ borderRadius: 20 }}>
                        <Divider orientation="left" style={{ marginTop: 0 }}>Account Timeline</Divider>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <InfoTile isDark={isDark} icon={<CalendarOutlined />} label="Profile Created"
                                    value={p?.createdAt ? new Date(p.createdAt).toLocaleString() : '—'} />
                            </Col>
                            <Col xs={24} sm={12}>
                                <InfoTile isDark={isDark} icon={<CalendarOutlined />} label="Last Updated"
                                    value={p?.updatedAt ? new Date(p.updatedAt).toLocaleString() : '—'} />
                            </Col>
                        </Row>
                    </Card>
                </>
            )}
        </div>
    );
};

export default ProfilePage;
