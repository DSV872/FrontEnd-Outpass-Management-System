import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, message, Modal, Input, Space, Tooltip } from 'antd';
import { CheckOutlined, CloseOutlined, SearchOutlined } from '@ant-design/icons';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import dayjs from 'dayjs';

const PendingRequests: React.FC = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [qrModalVisible, setQrModalVisible] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/outpass-service/warden/pending');
            setRequests(response.data);
        } catch (error) {
            message.error('Failed to fetch pending requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = (id: string) => {
        Modal.confirm({
            title: 'Approve Outpass',
            content: 'Are you sure you want to approve this outpass request?',
            onOk: async () => {
                try {
                    const response = await api.put(`/outpass-service/warden/approve/${id}`);
                    message.success('Outpass approved successfully');

                    // The backend returns a QR token (JWT string)
                    const returnedQrToken = response.data?.qrToken || response.data?.token || typeof response.data === 'string' ? response.data : null;
                    if (returnedQrToken) {
                        setQrToken(returnedQrToken);
                        setQrModalVisible(true);
                    }

                    fetchRequests();
                } catch (error) {
                    message.error('Failed to approve outpass');
                }
            },
        });
    };

    const openRejectModal = (id: string) => {
        setSelectedRequestId(id);
        setRejectReason('');
        setRejectModalVisible(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            message.error('Please provide a reason for rejection');
            return;
        }
        try {
            await api.put(`/outpass-service/warden/reject/${selectedRequestId}`, {
                remarks: rejectReason
            }); // Assuming backend expects a body or query param. Requirement says "remarks input required". 
            // If it's a PUT to /reject/{id}, usually body is used for remarks.
            // Let's assume body: { remarks: "..." } or query param ?remarks=...
            // I will send as body for now.

            message.success('Outpass rejected successfully');
            setRejectModalVisible(false);
            fetchRequests();
        } catch (error) {
            // If 400 or 4xx, might be because it expects query param? 
            // fallback to query param if needed, but standard REST usually body for PUT.
            message.error('Failed to reject outpass');
        }
    };

    const columns = [
        {
            title: 'Student Email',
            dataIndex: 'studentEmail', // Assuming field name from backend
            key: 'studentEmail',
        },
        {
            title: 'Type',
            dataIndex: 'outpassType',
            key: 'type',
            render: (type: string) => <Tag color="blue">{type}</Tag>,
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Destination',
            dataIndex: 'destination',
            key: 'destination',
        },
        {
            title: 'Out Time',
            dataIndex: 'outTime',
            key: 'outTime',
            render: (date: string) => dayjs(date).format('MMM D, h:mm A'),
        },
        {
            title: 'Actions',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Approve">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(record.id)}
                            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                        />
                    </Tooltip>
                    <Tooltip title="Reject">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<CloseOutlined />}
                            onClick={() => openRejectModal(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card className="fade-in" title="Pending Outpass Requests" bordered={false} extra={<Button icon={<SearchOutlined />} onClick={fetchRequests}>Refresh</Button>}>
                <Table
                    dataSource={requests}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Reject Outpass Request"
                open={rejectModalVisible}
                onOk={handleReject}
                onCancel={() => setRejectModalVisible(false)}
                okText="Reject"
                okButtonProps={{ danger: true }}
            >
                <p>Please provide a reason for rejection:</p>
                <Input.TextArea
                    rows={4}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Rejection remarks..."
                />
            </Modal>

            <Modal
                title="Outpass Approved - QR Code"
                open={qrModalVisible}
                onOk={() => setQrModalVisible(false)}
                onCancel={() => setQrModalVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setQrModalVisible(false)}>
                        Close
                    </Button>,
                ]}
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p>Scan this QR code at the security gate to exit/enter.</p>
                    {qrToken && (
                        <div style={{ margin: '20px auto', background: '#fff', padding: '16px', display: 'inline-block', borderRadius: '8px' }}>
                            <QRCodeSVG value={qrToken} size={256} level="H" />
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default PendingRequests;
