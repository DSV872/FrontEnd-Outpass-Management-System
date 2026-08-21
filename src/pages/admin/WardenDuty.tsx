import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Typography,
    Space,
    message,
    Tag,
    Card,
    Grid,
    Modal,
    List,
    Select
} from 'antd';
import {
    CheckOutlined,
    SwapOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { Option } = Select;

export interface WardenProfile {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    hostelName: string;
    role: string;
    status: string;
}

export interface DutyAssignment {
    id?: number;
    wardenUserId: string;
    dutyDate: string;
    status: string;
    wardenDetails?: WardenProfile; // Optional depending on backend
}

const AdminWardenDuty: React.FC = () => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;

    const [todayDuties, setTodayDuties] = useState<DutyAssignment[]>([]);
    const [todayWardens, setTodayWardens] = useState<WardenProfile[]>([]);
    const [wardens, setWardens] = useState<WardenProfile[]>([]);
    const [loading, setLoading] = useState(false);

    // UI state
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedWarden, setSelectedWarden] = useState<WardenProfile | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Replace modal state
    const [replaceModalVisible, setReplaceModalVisible] = useState(false);
    const [dutyToReplace, setDutyToReplace] = useState<DutyAssignment | null>(null);
    const [replacementWardenId, setReplacementWardenId] = useState<string | undefined>(undefined);

    const loadData = async () => {
        setLoading(true);
        try {
            // First fetch wardens list
            const wardensRes = await api.get('profile-service/profiles/wardens');
            const wardensList = wardensRes.data;
            setWardens(wardensList);

            // Fetch today's duty
            try {
                const dutyRes = await api.get('profile-service/profiles/warden-duties/today');
                if (dutyRes.data) {
                    const dutiesArray = Array.isArray(dutyRes.data) ? dutyRes.data : [dutyRes.data];
                    setTodayDuties(dutiesArray);

                    // Match warden details from the list
                    const foundWardens = dutiesArray.map((duty: any) => {
                        return wardensList.find((w: WardenProfile) => w.userId === duty.wardenUserId) || duty.wardenDetails;
                    }).filter(Boolean);

                    setTodayWardens(foundWardens);
                } else {
                    setTodayDuties([]);
                    setTodayWardens([]);
                }
            } catch (err: any) {
                if (err.response?.status === 404) {
                    // No duty assigned today
                    setTodayDuties([]);
                    setTodayWardens([]);
                } else {
                    console.error("Failed to load duty:", err);
                    message.error(err.response?.data?.message || 'Failed to load today\'s duty');
                }
            }
        } catch (error: any) {
            console.error("Failed to load wardens:", error);
            message.error(error.response?.data?.message || 'Failed to load warden list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAssignClick = (warden: WardenProfile) => {
        setSelectedWarden(warden);
        if (todayDuties.length < 2) {
            setAssignModalVisible(true);
        }
    };

    const handleAssignConfirm = async () => {
        if (!selectedWarden) return;
        setActionLoading(true);
        try {
            await api.post('profile-service/profiles/warden-duties', {
                wardenUserId: selectedWarden.userId,
                dutyDate: new Date().toISOString().split('T')[0]
            });
            message.success('Warden assigned to today\'s duty successfully.');
            setAssignModalVisible(false);
            loadData();
        } catch (error: any) {
            if (error.response?.status === 409) {
                message.error(error.response?.data?.message || 'Another duty assignment already exists for today.');
            } else {
                message.error(error.response?.data?.message || 'Failed to assign warden.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleReplaceClick = (duty: DutyAssignment) => {
        setDutyToReplace(duty);
        setReplacementWardenId(undefined);
        setReplaceModalVisible(true);
    };

    const handleReplaceConfirm = async () => {
        if (!dutyToReplace?.id || !replacementWardenId) {
            message.warning('Please select a warden to replace with.');
            return;
        }
        setActionLoading(true);
        try {
            await api.patch(`/profile-service/profiles/warden-duties/${dutyToReplace.id}/replace`, {
                wardenUserId: replacementWardenId,
                dutyDate: new Date().toISOString().split('T')[0]
            });
            message.success('Warden duty replaced successfully.');
            setReplaceModalVisible(false);
            setDutyToReplace(null);
            setReplacementWardenId(undefined);
            loadData();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to replace warden duty.');
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        {
            title: 'Warden Name',
            key: 'name',
            render: (record: WardenProfile) => `${record.firstName} ${record.lastName}`
        },
        {
            title: 'User ID',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            responsive: ['md'] as any,
        },
        {
            title: 'Phone Number',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            responsive: ['lg'] as any,
        },
        {
            title: 'Hostel Name',
            dataIndex: 'hostelName',
            key: 'hostelName',
            responsive: ['sm'] as any,
        },
        {
            title: 'Duty Status',
            key: 'dutyStatus',
            render: (record: WardenProfile) => {
                if (todayDuties.some(d => d.wardenUserId === record.userId)) {
                    return <Tag color="green">Current Duty</Tag>;
                }
                return <Tag>Not Assigned</Tag>;
            }
        },
        {
            title: 'Action',
            key: 'action',
            render: (record: WardenProfile) => {
                const isAssigned = !!todayDuties.find(d => d.wardenUserId === record.userId);
                const isAtMaxCapacity = todayDuties.length >= 2;
                const isDisabled = isAssigned || isAtMaxCapacity;
                return (
                    <Button
                        type={isAssigned ? 'default' : 'primary'}
                        icon={isAssigned ? <CheckOutlined /> : undefined}
                        disabled={isDisabled}
                        onClick={() => handleAssignClick(record)}
                    >
                        {isAssigned ? 'Assigned' : 'Assign'}
                    </Button>
                );
            }
        }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24, padding: isMobile ? '0 12px' : 0 }}>
                <Title level={isMobile ? 3 : 2}>Warden Duty Management</Title>
                <Text type="secondary">
                    Assign and manage wardens responsible for today's outpass approvals.
                </Text>
            </div>

            <Card loading={loading} style={{ marginBottom: 24, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} bodyStyle={{ padding: isMobile ? 16 : 24 }}>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 16, gap: isMobile ? 8 : 0 }}>
                    <Title level={4} style={{ margin: 0 }}>Today's Warden Duty</Title>
                    <Text strong>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                </div>

                {todayWardens.length > 0 ? (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                            {todayWardens.map(warden => {
                                const duty = todayDuties.find(d => d.wardenUserId === warden.userId);
                                return (
                                    <Card key={warden.userId} size="small" style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                                        <div style={{ marginBottom: 12 }}>
                                            <Tag color={duty?.status === 'ON_DUTY' || duty?.status === 'ACTIVE' ? 'green' : (duty?.status === 'PENDING' ? 'orange' : 'default')}>
                                                Status: {duty?.status || 'N/A'}
                                            </Tag>
                                        </div>
                                        <Space direction="vertical" size="small" style={{ width: '100%', marginBottom: 16 }}>
                                            <Text type="secondary">Warden Details:</Text>
                                            <Text strong style={{ fontSize: '16px', display: 'block' }}>{warden.firstName} {warden.lastName}</Text>
                                            <Text ellipsis style={{ maxWidth: '100%' }}>ID: {warden.userId}</Text>
                                            <Text ellipsis style={{ maxWidth: '100%' }}>Email: {warden.email}</Text>
                                            <Text>Phone: {warden.phoneNumber}</Text>
                                        </Space>
                                        <div style={{ marginTop: 8 }}>
                                            <Button
                                                type="default"
                                                size="small"
                                                block
                                                icon={<SwapOutlined />}
                                                onClick={() => duty && handleReplaceClick(duty)}
                                            >
                                                Replace Warden
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '24px 0', textAlign: 'center' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                            No warden is currently assigned to today's duty.
                        </Text>
                    </div>
                )}
            </Card>

            <Card title="Available Wardens" style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                {isMobile ? (
                    <List
                        dataSource={wardens}
                        loading={loading}
                        pagination={{ pageSize: 10, align: 'center' }}
                        renderItem={record => {
                            const isAssigned = !!todayDuties.find(d => d.wardenUserId === record.userId);
                            return (
                                <List.Item>
                                    <Card size="small" style={{ width: '100%', borderRadius: 8 }} title={record.userId} extra={
                                        <Button
                                            type={isAssigned ? 'default' : 'primary'}
                                            icon={isAssigned ? <CheckOutlined /> : undefined}
                                            disabled={isAssigned || todayDuties.length >= 2}
                                            onClick={() => handleAssignClick(record)}
                                            size="small"
                                        >
                                            {isAssigned ? 'Assigned' : 'Assign'}
                                        </Button>
                                    }>
                                        <Card.Meta
                                            title={`${record.firstName} ${record.lastName}`}
                                            description={
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
                                                    <Text type="secondary">{record.email}</Text>
                                                    <Text type="secondary">Phone: {record.phoneNumber}</Text>
                                                    <Text type="secondary">Hostel: {record.hostelName}</Text>
                                                    <div style={{ marginTop: 4 }}>
                                                        {isAssigned ? <Tag color="green">Current Duty</Tag> : <Tag>Not Assigned</Tag>}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={wardens}
                        rowKey="userId"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </Card>

            {/* Assign Modal */}
            <Modal
                title="Assign Warden to Today's Duty"
                open={assignModalVisible}
                onCancel={() => setAssignModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setAssignModalVisible(false)}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" loading={actionLoading} onClick={handleAssignConfirm}>
                        Assign Warden
                    </Button>
                ]}
            >
                {selectedWarden && (
                    <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
                        <Text style={{ width: '100%' }} ellipsis>Warden Name: <strong>{selectedWarden.firstName} {selectedWarden.lastName}</strong></Text>
                        <Text style={{ width: '100%' }} ellipsis>User ID: <strong>{selectedWarden.userId}</strong></Text>
                        <Text style={{ width: '100%' }} ellipsis>Email: <strong>{selectedWarden.email}</strong></Text>
                        <Text style={{ width: '100%' }} ellipsis>Duty Date: <strong>{new Date().toLocaleDateString()}</strong></Text>

                        <div style={{ marginTop: 16 }}>
                            <Text>Are you sure you want to assign this warden to today's duty?</Text>
                        </div>
                    </Space>
                )}
            </Modal>

            {/* Replace Modal */}
            <Modal
                title="Replace Warden Duty Assignment"
                open={replaceModalVisible}
                onCancel={() => { setReplaceModalVisible(false); setDutyToReplace(null); setReplacementWardenId(undefined); }}
                footer={[
                    <Button key="cancel" onClick={() => { setReplaceModalVisible(false); setDutyToReplace(null); setReplacementWardenId(undefined); }}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" icon={<SwapOutlined />} loading={actionLoading} onClick={handleReplaceConfirm} disabled={!replacementWardenId}>
                        Replace Warden
                    </Button>
                ]}
            >
                <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
                    <Text>Current Warden ID: <strong>{dutyToReplace?.wardenUserId}</strong></Text>
                    <Text>Duty Date: <strong>{new Date().toLocaleDateString('en-CA')}</strong></Text>
                    <div>
                        <Text style={{ display: 'block', marginBottom: 8 }}>Select Replacement Warden:</Text>
                        <Select
                            style={{ width: '100%' }}
                            placeholder="Choose a warden..."
                            value={replacementWardenId}
                            onChange={(val) => setReplacementWardenId(val)}
                            showSearch
                            optionFilterProp="children"
                        >
                            {wardens
                                .filter(w => !todayDuties.some(d => d.wardenUserId === w.userId))
                                .map(w => (
                                    <Option key={w.userId} value={w.userId}>
                                        {w.firstName} {w.lastName} ({w.userId})
                                    </Option>
                                ))
                            }
                        </Select>
                    </div>
                </Space>
            </Modal>
        </div>
    );
};

export default AdminWardenDuty;
