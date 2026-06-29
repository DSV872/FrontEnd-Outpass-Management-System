import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Card, message, Steps } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { outpassService } from '../../services/outpassService';
import ViewQR from '../../components/ViewQR';
import dayjs from 'dayjs';

const OutpassList: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
    const [outpasses, setOutpasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOutpassId, setSelectedOutpassId] = useState<string | null>(null);

    const fetchOutpasses = async () => {
        setLoading(true);
        try {
            const data = await outpassService.getAllOutpasses();
            setOutpasses(data as any);
        } catch (error) {
            message.error('Failed to fetch outpasses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOutpasses();
    }, [refreshTrigger]);

    // 🔥 Amazon-style status tracker
    const getStepStatus = (status: string) => {
        const steps = [
            { title: 'Applied' },
            { title: 'Parent Approved' },
            { title: 'Warden Approved' },
            { title: 'Out' },
            { title: 'Returned' }
        ];

        let current = 0;

        switch (status) {
            case 'APPLIED':
                current = 0;
                break;
            case 'PARENT_APPROVED':
                current = 1;
                break;
            case 'WARDEN_APPROVED':
                current = 2;
                break;
            case 'OUT':
                current = 3;
                break;
            case 'IN':
                current = 4;
                break;
            default:
                current = 0;
        }

        return (
            <Steps
                size="small"
                current={current}
                items={steps}
            />
        );
    };

    const columns = [
        {
            title: 'Type',
            dataIndex: 'outpassType',
            key: 'type',
            render: (type: string) => <Tag color="blue">{type}</Tag>,
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
            title: 'In Time',
            dataIndex: 'expectedInTime',
            key: 'expectedInTime',
            render: (date: string) => dayjs(date).format('MMM D, h:mm A'),
        },
        {
            title: 'Status Tracking',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStepStatus(status),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: any) =>
                record.status === 'WARDEN_APPROVED' ||
                    record.status === 'OUT' ? (
                    <Button
                        icon={<QrcodeOutlined />}
                        size="small"
                        onClick={() => setSelectedOutpassId(record.id)}
                    >
                        View QR
                    </Button>
                ) : null,
        },
    ];

    return (
        <>
            <Card
                className="fade-in"
                title="My Outpasses"
                bordered={false}
                style={{ marginTop: 24 }}
            >
                <Table
                    dataSource={outpasses}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>

            <ViewQR
                outpassId={selectedOutpassId}
                onClose={() => setSelectedOutpassId(null)}
            />
        </>
    );
};

export default OutpassList;