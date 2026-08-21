import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import {
    Table,
    Button,
    Typography,
    message,
    Tag,
    Card,
    Grid,
    Modal,
    Input,
    Select,
    Form,
    Dropdown,
    List,
    Spin,
    Avatar,
    Row,
    Col,
    Divider
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    StopOutlined,
    CheckCircleOutlined,
    MoreOutlined,
    EditOutlined,
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    IdcardOutlined,
    BookOutlined,
    CalendarOutlined,
    HomeOutlined,
    SafetyOutlined,
    CloseOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { userService, type UserDTO } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

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

const InfoTile: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string | number | null;
    isDark: boolean;
}> = ({ icon, label, value, isDark }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px',
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
        borderRadius: 12,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
        height: '100%'
    }}>
        <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            color: '#6366f1', fontSize: 14,
        }}>
            {icon}
        </div>
        <div style={{ minWidth: 0 }}>
            <Text type="secondary" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: 2 }}>
                {label}
            </Text>
            <Text strong style={{ fontSize: 13, color: isDark ? '#e8e8e8' : '#1f1f1f', wordBreak: 'break-word' }}>
                {value ?? <Text type="secondary">—</Text>}
            </Text>
        </div>
    </div>
);

const AdminUserManagement: React.FC = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const { isDark } = useTheme();

    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filtering state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
    const [statusFilter, setStatusFilter] = useState<'ENABLED' | 'DISABLED' | 'ALL' | undefined>(undefined);

    // Modals state
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [viewLoading, setViewLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const selectedRole = Form.useWatch('role', createForm);
    const selectedEditRole = Form.useWatch('role', editForm);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userService.getUsers({
                search: searchText || undefined,
                role: roleFilter === 'ALL' ? undefined : roleFilter,
                status: (statusFilter === 'ALL' ? undefined : statusFilter) as any,
                page: page - 1,
                size: pageSize
            });

            if (Array.isArray(data)) {
                setUsers(data);
                setTotalElements(data.length);
            } else if (data && data.content) {
                setUsers(data.content);
                setTotalElements(data.totalElements);
            }
        } catch (error: any) {
            console.error("Failed to load users:", error);
            message.error(error.response?.data?.message || 'Failed to load users');
            // Log failing API request
            if (error.response?.status === 404 || error.response?.status === 401) {
                setUsers([]);
                setTotalElements(0);
            }
        } finally {
            setLoading(false);
        }
    }, [searchText, roleFilter, statusFilter, page, pageSize]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce fetch for search
        return () => clearTimeout(timeoutId);
    }, [fetchUsers]);

    const handleCreateUser = async (values: any) => {
        setActionLoading(true);
        try {
            await userService.createUser({
                ...values,
                enabled: true
            });
            message.success('User created successfully');
            setCreateModalVisible(false);
            createForm.resetFields();
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditUser = async (values: any) => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            await userService.updateUser(selectedUser.userId || selectedUser.id || '', values);
            message.success('User updated successfully');
            setEditModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = (user: UserDTO) => {
        const action = user.enabled ? 'disable' : 'enable';
        Modal.confirm({
            title: `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            content: `Are you sure you want to ${action} this user (${user.email})?`,
            okText: 'Yes',
            okType: user.enabled ? 'danger' : 'primary',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await userService.toggleUserStatus(user.id || user.userId || '', !user.enabled);
                    message.success(`User successfully ${action}d`);
                    fetchUsers();
                } catch (error: any) {
                    message.error(error.response?.data?.message || `Failed to ${action} user`);
                    // optimistic update for mock mode
                    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, enabled: !u.enabled } : u));
                }
            }
        });
    };

    const getActionMenu = (record: UserDTO): MenuProps => {
        const items: MenuProps['items'] = [
            {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'View Details',
                onClick: async () => {
                    setSelectedUser(record);
                    setViewModalVisible(true);
                    setViewLoading(true);
                    try {
                        let profileData = {};
                        if (record.role === 'STUDENT') {
                            const res = await api.get(`/profile-service/profiles/students/${record.userId || record.id}`);
                            profileData = res.data;
                        } else if (record.role === 'WARDEN') {
                            const res = await api.get(`/profile-service/profiles/wardens/${record.userId || record.id}`);
                            profileData = res.data;
                        } else if (record.role === 'SECURITY') {
                            const res = await api.get(`/profile-service/profiles/security/${record.userId || record.id}`);
                            profileData = res.data;
                        }
                        setSelectedUser(prev => prev ? { ...prev, ...profileData } : prev);
                    } catch (error) {
                        console.error('Failed to load detailed profile for view', error);
                        message.warning('Could not retrieve full profile details');
                    } finally {
                        setViewLoading(false);
                    }
                }
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit User',
                onClick: async () => {
                    setSelectedUser(record);
                    setEditModalVisible(true);
                    setActionLoading(true);
                    try {
                        let profileData = {};
                        if (record.role === 'STUDENT') {
                            const res = await api.get(`/profile-service/profiles/students/${record.userId || record.id}`);
                            profileData = res.data;
                        } else if (record.role === 'WARDEN') {
                            const res = await api.get(`/profile-service/profiles/wardens/${record.userId || record.id}`);
                            profileData = res.data;
                        } else if (record.role === 'SECURITY') {
                            const res = await api.get(`/profile-service/profiles/security/${record.userId || record.id}`);
                            profileData = res.data;
                        }
                        const fullData = { ...record, ...profileData };
                        setSelectedUser(fullData as any);
                        editForm.setFieldsValue(fullData);
                    } catch (error) {
                        message.warning('Could not retrieve full profile details');
                    } finally {
                        setActionLoading(false);
                    }
                }
            },
            {
                key: 'toggle',
                icon: record.enabled ? <StopOutlined style={{ color: 'red' }} /> : <CheckCircleOutlined style={{ color: 'green' }} />,
                label: record.enabled ? 'Disable User' : 'Enable User',
                onClick: () => handleToggleStatus(record)
            }
        ];
        return { items };
    };

    const columns = [
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
            render: (text: string, record: UserDTO) => text || record.id || 'N/A'
        },
        {
            title: 'Name',
            key: 'name',
            render: (record: UserDTO) => `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A'
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['md'] as any,
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                const colorMap: Record<string, string> = {
                    ADMIN: 'volcano',
                    STUDENT: 'blue',
                    WARDEN: 'gold',
                    SECURITY: 'cyan',
                    PARENT: 'purple'
                };
                return <Tag color={colorMap[role] || 'default'}>{role}</Tag>;
            }
        },
        {
            title: 'Status',
            dataIndex: 'enabled',
            key: 'status',
            render: (enabled: boolean) => (
                <Tag color={enabled ? 'success' : 'error'}>
                    {enabled ? 'ENABLED' : 'DISABLED'}
                </Tag>
            )
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            responsive: ['lg'] as any,
            render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A'
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record: UserDTO) => (
                <Dropdown menu={getActionMenu(record)} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            )
        }
    ];

    const viewGradient = selectedUser
        ? roleGradient[selectedUser.role] ?? roleGradient.STUDENT
        : '';
    const viewFullName = selectedUser
        ? `${selectedUser.firstName ?? ''} ${selectedUser.lastName ?? ''}`.trim() || selectedUser.userId || 'User'
        : '';

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24, padding: isMobile ? '0 12px' : 0 }}>
                <Title level={isMobile ? 3 : 2}>User Management</Title>
                <Text type="secondary">
                    Manage application users, their roles, and account status.
                </Text>
            </div>

            <Card style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                {/* Actions & Filters Header */}
                <Row gutter={[12, 12]} style={{ marginBottom: 16 }} align="middle">
                    <Col xs={24} sm={24} md={10} lg={9}>
                        <Input
                            placeholder="Search by ID, Name, Email"
                            prefix={<SearchOutlined />}
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={5} lg={4}>
                        <Select
                            placeholder="Filter Role"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => setRoleFilter(val)}
                        >
                            <Option value="ALL">All Roles</Option>
                            <Option value="STUDENT">Student</Option>
                            <Option value="WARDEN">Warden</Option>
                            <Option value="SECURITY">Security</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={8} md={5} lg={4}>
                        <Select
                            placeholder="Filter Status"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => setStatusFilter(val)}
                        >
                            <Option value="ALL">All Status</Option>
                            <Option value="ENABLED">Enabled</Option>
                            <Option value="DISABLED">Disabled</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={8} md={4} lg={7} style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} block={isMobile}>
                            Add User
                        </Button>
                    </Col>
                </Row>

                {isMobile ? (
                    <List
                        dataSource={users}
                        loading={loading}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            total: totalElements,
                            onChange: (p, s) => { setPage(p); setPageSize(s); },
                            align: 'center'
                        }}
                        renderItem={record => (
                            <List.Item>
                                <Card size="small" style={{ width: '100%', borderRadius: 8 }} title={record.userId || record.id || 'N/A'} extra={
                                    <Dropdown menu={getActionMenu(record)} trigger={['click']}>
                                        <Button type="text" icon={<MoreOutlined />} />
                                    </Dropdown>
                                }>
                                    <Card.Meta
                                        title={`${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A'}
                                        description={
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                                                <Text type="secondary">{record.email}</Text>
                                                <div>
                                                    <Tag color={
                                                        record.role === 'ADMIN' ? 'volcano' :
                                                            record.role === 'STUDENT' ? 'blue' :
                                                                record.role === 'WARDEN' ? 'gold' :
                                                                    record.role === 'SECURITY' ? 'cyan' : 'purple'
                                                    }>{record.role}</Tag>
                                                    <Tag color={record.enabled ? 'success' : 'error'}>
                                                        {record.enabled ? 'ENABLED' : 'DISABLED'}
                                                    </Tag>
                                                </div>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Created: {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : 'N/A'}
                                                </Text>
                                            </div>
                                        }
                                    />
                                </Card>
                            </List.Item>
                        )}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey={(record) => record.id || record.userId || record.email}
                        loading={loading}
                        pagination={{
                            current: page,
                            pageSize: pageSize,
                            total: totalElements,
                            showSizeChanger: true,
                            onChange: (p, s) => { setPage(p); setPageSize(s); }
                        }}
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </Card>

            {/* Create User Modal */}
            <Modal
                title="Create New User"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    createForm.resetFields();
                }}
                footer={null}
                destroyOnClose
                style={{ maxWidth: '92vw' }}
                width={520}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateUser}
                    style={{ marginTop: 16 }}
                >
                    <Row gutter={12}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                <Input placeholder="First Name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                <Input placeholder="Last Name" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                        <Input placeholder="user@example.com" prefix={<MailOutlined />} />
                    </Form.Item>
                    <Form.Item name="password" label="Temporary Password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password placeholder="Enter initial password" />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select a role" style={{ width: '100%' }}>
                            <Option value="STUDENT">Student</Option>
                            <Option value="WARDEN">Warden</Option>
                            <Option value="SECURITY">Security</Option>
                        </Select>
                    </Form.Item>

                    {/* Dynamic fields based on role selected */}
                    {selectedRole === 'STUDENT' && (
                        <>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                <Input placeholder="Phone Number" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                                <Input placeholder="Department" />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="yearOfStudy" label="Year of Study" rules={[{ required: true }]}>
                                        <Input type="number" placeholder="e.g. 2" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="section" label="Section" rules={[{ required: true }]}>
                                        <Input placeholder="e.g. A" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="parentName" label="Parent Name" rules={[{ required: true }]}>
                                <Input placeholder="Parent Name" />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="parentEmail" label="Parent Email" rules={[{ required: true, type: 'email' }]}>
                                        <Input placeholder="Parent Email" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="parentPhone" label="Parent Phone" rules={[{ required: true }]}>
                                        <Input placeholder="Parent Phone" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

                    {selectedRole === 'WARDEN' && (
                        <>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                <Input placeholder="Phone Number" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="hostelName" label="Hostel Name" rules={[{ required: true }]}>
                                <Input placeholder="Hostel Name" />
                            </Form.Item>
                        </>
                    )}

                    {selectedRole === 'SECURITY' && (
                        <>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                <Input placeholder="Phone Number" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="gateName" label="Gate Name" rules={[{ required: true }]}>
                                <Input placeholder="Gate Name" />
                            </Form.Item>
                        </>
                    )}

                    <Button type="primary" htmlType="submit" loading={actionLoading} block style={{ marginTop: 8 }}>
                        Create User
                    </Button>
                </Form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title="Edit User Role & Details"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                }}
                footer={null}
                destroyOnClose
                style={{ maxWidth: '92vw' }}
                width={520}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditUser}
                    style={{ marginTop: 16 }}
                >
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select placeholder="Select a role" style={{ width: '100%' }}>
                            <Option value="STUDENT">Student</Option>
                            <Option value="WARDEN">Warden</Option>
                            <Option value="SECURITY">Security</Option>
                        </Select>
                    </Form.Item>
                    <Row gutter={12}>
                        <Col xs={24} sm={12}>
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                                <Input placeholder="First Name" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                                <Input placeholder="Last Name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {selectedEditRole === 'STUDENT' && (
                        <>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                <Input placeholder="Phone Number" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
                                <Select placeholder="Select Department" style={{ width: '100%' }}>
                                    <Option value="CSE">CSE</Option>
                                    <Option value="ECE">ECE</Option>
                                    <Option value="MECH">MECH</Option>
                                    <Option value="CIVIL">CIVIL</Option>
                                    <Option value="MET">MET</Option>
                                    <Option value="CHEM">CHEM</Option>
                                </Select>
                            </Form.Item>
                            <Row gutter={12}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="yearOfStudy" label="Year" rules={[{ required: true }]}>
                                        <Select placeholder="Year" style={{ width: '100%' }}>
                                            <Option value="1">E1</Option>
                                            <Option value="2">E2</Option>
                                            <Option value="3">E3</Option>
                                            <Option value="4">E4</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="section" label="Section" rules={[{ required: true }]}>
                                        <Input placeholder="Section" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item name="parentName" label="Parent Name" rules={[{ required: true }]}>
                                <Input placeholder="Parent Name" />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="parentEmail" label="Parent Email" rules={[{ required: true, type: 'email' }]}>
                                        <Input placeholder="Parent Email" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="parentPhone" label="Parent Phone" rules={[{ required: true }]}>
                                        <Input placeholder="Parent Phone" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </>
                    )}

                    {selectedEditRole === 'WARDEN' && (
                        <>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                <Input placeholder="Phone Number" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="hostelName" label="Hostel Name" rules={[{ required: true }]}>
                                <Input placeholder="Hostel Name" />
                            </Form.Item>
                        </>
                    )}

                    {selectedEditRole === 'SECURITY' && (
                        <>
                            <Form.Item name="phoneNumber" label="Phone Number" rules={[{ required: true }]}>
                                <Input placeholder="Phone Number" prefix={<PhoneOutlined />} />
                            </Form.Item>
                            <Form.Item name="gateName" label="Gate Name" rules={[{ required: true }]}>
                                <Input placeholder="Gate Name" />
                            </Form.Item>
                        </>
                    )}

                    <Button type="primary" htmlType="submit" loading={actionLoading} block style={{ marginTop: 16 }}>
                        Update User
                    </Button>
                </Form>
            </Modal>

            {/* View Details Modal */}
            <Modal
                title={null}
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={null}
                width={680}
                centered={false}
                style={{ maxWidth: '95vw', top: 20 }}
                styles={{
                    body: {
                        padding: 0,
                        overflowY: 'auto',
                        maxHeight: '90vh',
                        borderRadius: 16
                    },
                    header: {
                        display: 'none'
                    }
                }}
            >
                <Spin spinning={viewLoading}>
                    {selectedUser && (
                        <div style={{ padding: isMobile ? '0 4px' : 0 }}>

                            {/* ── Hero Banner Card ─────────────────────────────── */}
                            <Card
                                bordered={false}
                                style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16 }}
                                styles={{ body: { padding: 0 } }}
                            >
                                {/* Gradient strip */}
                                <div style={{ height: 120, background: viewGradient, position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.12) 0%, transparent 70%)'
                                    }} />
                                    {/* Close button */}
                                    <Button
                                        type="text"
                                        icon={<CloseOutlined />}
                                        onClick={() => setViewModalVisible(false)}
                                        style={{
                                            position: 'absolute', top: 12, right: 12,
                                            color: '#fff',
                                            background: 'rgba(0,0,0,0.25)',
                                            borderRadius: '50%',
                                            width: 32, height: 32,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: 'none',
                                            backdropFilter: 'blur(4px)',
                                        }}
                                    />
                                </div>

                                {/* Avatar + name row */}
                                <div style={{ padding: isMobile ? '0 20px 24px' : '0 32px 28px', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                        <Avatar
                                            size={isMobile ? 72 : 90}
                                            icon={<UserOutlined />}
                                            style={{
                                                background: viewGradient,
                                                border: `4px solid ${isDark ? '#000' : '#fff'}`,
                                                marginTop: -44,
                                                flexShrink: 0,
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                                            }}
                                        />
                                        {/* Status badge top-right */}
                                        <Tag
                                            color={selectedUser.enabled ? 'success' : 'error'}
                                            style={{ padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', marginBottom: 4 }}
                                        >
                                            {selectedUser.enabled ? '● ACTIVE' : '● DISABLED'}
                                        </Tag>
                                    </div>

                                    <div style={{ marginTop: 12 }}>
                                        <Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>{viewFullName}</Title>
                                        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                                            <Tag color={roleTagColor[selectedUser.role]}>{selectedUser.role}</Tag>
                                            <Text type="secondary" style={{ fontSize: 13 }}>{selectedUser.email || selectedUser.userId}</Text>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* ── Personal Information ─────────────────────────── */}
                            <Card bordered={false} style={{ borderRadius: 20, marginBottom: 16 }} title="Personal Information">
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <InfoTile isDark={isDark} icon={<UserOutlined />} label="Full Name" value={viewFullName} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoTile isDark={isDark} icon={<MailOutlined />} label="Email" value={selectedUser.email} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoTile isDark={isDark} icon={<PhoneOutlined />} label="Phone" value={selectedUser.phoneNumber} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoTile isDark={isDark} icon={<IdcardOutlined />} label="User ID" value={selectedUser.userId || selectedUser.id} />
                                    </Col>
                                </Row>
                            </Card>

                            {/* ── Role Information ─────────────────────────────── */}
                            {(selectedUser.role === 'STUDENT' || selectedUser.role === 'WARDEN' || selectedUser.role === 'SECURITY') && (
                                <Card bordered={false} style={{ borderRadius: 20, marginBottom: 16 }} title="Role Information">
                                    <Row gutter={[16, 16]}>
                                        {selectedUser.role === 'STUDENT' && (
                                            <>
                                                <Col xs={24} sm={12} md={8}>
                                                    <InfoTile isDark={isDark} icon={<BookOutlined />} label="Department" value={selectedUser.department} />
                                                </Col>
                                                <Col xs={24} sm={12} md={8}>
                                                    <InfoTile isDark={isDark} icon={<IdcardOutlined />} label="Section" value={selectedUser.section} />
                                                </Col>
                                                <Col xs={24} sm={12} md={8}>
                                                    <InfoTile isDark={isDark} icon={<CalendarOutlined />} label="Year of Study" value={selectedUser.yearOfStudy ? `Year ${selectedUser.yearOfStudy}` : null} />
                                                </Col>
                                            </>
                                        )}
                                        {selectedUser.role === 'WARDEN' && (
                                            <Col xs={24} sm={12}>
                                                <InfoTile isDark={isDark} icon={<HomeOutlined />} label="Hostel Name" value={selectedUser.hostelName} />
                                            </Col>
                                        )}
                                        {selectedUser.role === 'SECURITY' && (
                                            <Col xs={24} sm={12}>
                                                <InfoTile isDark={isDark} icon={<SafetyOutlined />} label="Gate Name" value={selectedUser.gateName} />
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            )}

                            {/* ── Parent / Guardian (Students only) ────────────── */}
                            {selectedUser.role === 'STUDENT' && (
                                <Card bordered={false} style={{ borderRadius: 20, marginBottom: 16 }} title="Parent / Guardian">
                                    <Row gutter={[16, 16]}>
                                        <Col xs={24} sm={12}>
                                            <InfoTile isDark={isDark} icon={<UserOutlined />} label="Name" value={selectedUser.parentName} />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <InfoTile isDark={isDark} icon={<MailOutlined />} label="Email" value={selectedUser.parentEmail} />
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <InfoTile isDark={isDark} icon={<PhoneOutlined />} label="Phone" value={selectedUser.parentPhone} />
                                        </Col>
                                    </Row>
                                </Card>
                            )}

                            {/* ── Account Timeline ─────────────────────────────── */}
                            <Card bordered={false} style={{ borderRadius: 20, marginBottom: 8 }}>
                                <Divider style={{ marginTop: 0 }}>Account Timeline</Divider>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12}>
                                        <InfoTile isDark={isDark} icon={<CalendarOutlined />} label="Created At"
                                            value={selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : '—'} />
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <InfoTile isDark={isDark} icon={<CalendarOutlined />} label="Last Login"
                                            value={selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'} />
                                    </Col>
                                </Row>
                            </Card>
                        </div>
                    )}
                </Spin>
            </Modal>
        </div>
    );
};

export default AdminUserManagement;
