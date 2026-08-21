import React, { useEffect, useState } from 'react';
import {
    Table,
    Button,
    Typography,
    Space,
    message,
    Tag,
    Tabs,
    Card,
    Grid,
    Popconfirm
} from 'antd';
import {
    CheckOutlined,
    CloseOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Title } = Typography;
const { useBreakpoint } = Grid;
interface PendingOutpass {
    id: number;
    outpassType: string;
    status: string;
    outTime: string;
    inTime: string | null;
    destination: string;
}

interface WardenHistory {
    id: number;
    studentEmail: string;
    type: string;
    outTime: string;
    inTime: string | null;
    status: string;
}

const WardenDashboard: React.FC = () => {
    const [pendingData, setPendingData] = useState<PendingOutpass[]>([]);
    const [historyData, setHistoryData] = useState<WardenHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const fetchPending = async () => {
        try {
            const response = await api.get('/outpass-service/warden/pending');
            setPendingData(response.data);
        } catch (error: any) {
            console.error(error.response?.data);

            message.error(
                error.response?.data?.message ||
                'Failed to load pending requests'
            );
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await api.get('/outpass-service/warden/history');
            setHistoryData(response.data);
        } catch (error: any) {
            console.error(error.response?.data);
            message.error('Failed to load history');
        }
    };

    const loadData = async () => {
        setLoading(true);

        try {
            await fetchPending();
            await fetchHistory();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAction = async (
        id: number,
        action: 'approve' | 'reject'
    ) => {

        try {

            if (action === "approve") {
                await api.put(`/outpass-service/warden/approve/${id}`);
            } else {
                await api.put(`/outpass-service/warden/reject/${id}`);
            }

            message.success(
                `${action === "approve"
                    ? "Approved"
                    : "Rejected"} successfully`
            );

            setPendingData(prev =>
                prev.filter(item => item.id !== id)
            );

            await fetchHistory();

        } catch (error: any) {

            message.error(
                error.response?.data?.message ??
                "Operation failed"
            );

        }

    };

    const pendingColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Type',
            dataIndex: 'outpassType',
            key: 'outpassType',
            render: (value: string) => (
                <Tag color="blue">{value}</Tag>
            ),
        },
        {
            title: 'Destination',
            dataIndex: 'destination',
            key: 'destination',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color="orange">
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Out Time',
            dataIndex: 'outTime',
            key: 'outTime',
            render: (value: string) =>
                new Date(value).toLocaleString(),
        },
        {
            title: 'In Time',
            dataIndex: 'inTime',
            key: 'inTime',
            render: (value: string | null) =>
                value
                    ? new Date(value).toLocaleString()
                    : 'Not Returned',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_: any, record: PendingOutpass) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() =>
                            handleAction(
                                record.id,
                                'approve'
                            )
                        }
                    >
                        Approve
                    </Button>

                    <Button
                        danger
                        icon={<CloseOutlined />}
                        onClick={() =>
                            handleAction(
                                record.id,
                                'reject'
                            )
                        }
                    >
                        Reject
                    </Button>
                </Space>
            ),
        },
    ];

    const historyColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Student Email',
            dataIndex: 'studentEmail',
            key: 'studentEmail',
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (value: string) => (
                <Tag color="blue">{value}</Tag>
            ),
        },
        {
            title: 'Out Time',
            dataIndex: 'outTime',
            key: 'outTime',
            render: (value: string) =>
                new Date(value).toLocaleString(),
        },
        {
            title: 'In Time',
            dataIndex: 'inTime',
            key: 'inTime',
            render: (value: string | null) =>
                value
                    ? new Date(value).toLocaleString()
                    : 'Not Returned',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'orange';

                if (status === 'APPROVED') {
                    color = 'green';
                } else if (status === 'REJECTED') {
                    color = 'red';
                }

                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            },
        },
    ];
    const PendingCard = ({
        item,
    }: {
        item: PendingOutpass;
    }) => (

        <Card
            hoverable
            style={{
                marginBottom: 16,
                borderRadius: 12,
            }}
        >

            <Space
                direction={isMobile ? "vertical" : "horizontal"}
                style={{ width: "100%" }}
            >

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <strong>
                        {item.outpassType}
                    </strong>

                    <Tag color="orange">
                        {item.status}
                    </Tag>

                </div>

                <div>

                    <strong>
                        Destination
                    </strong>

                    <br />

                    {item.destination}

                </div>

                <div>

                    <strong>
                        Out Time
                    </strong>

                    <br />

                    {new Date(
                        item.outTime
                    ).toLocaleString()}

                </div>

                <div>

                    <strong>
                        In Time
                    </strong>

                    <br />

                    {item.inTime
                        ? new Date(
                            item.inTime
                        ).toLocaleString()
                        : "Not Returned"}

                </div>

                <Space>

                    <Button
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={() =>
                            handleAction(
                                item.id,
                                "approve"
                            )
                        }
                    >
                        Approve
                    </Button>

                    <Popconfirm
                        title="Reject this request?"
                        onConfirm={() =>
                            handleAction(
                                item.id,
                                "reject"
                            )
                        }
                    >
                        <Button
                            danger
                            icon={<CloseOutlined />}
                        >
                            Reject
                        </Button>
                    </Popconfirm>

                </Space>

            </Space>

        </Card>

    );
    const HistoryCard = ({
        item,
    }: {
        item: WardenHistory;
    }) => {

        const getStatusColor = (status: string) => {
            switch (status) {
                case "WARDEN_APPROVED":
                    return "green";
                case "REJECTED":
                    return "red";
                case "OUT":
                    return "orange";
                case "IN":
                    return "blue";
                default:
                    return "default";
            }
        };

        return (
            <Card
                hoverable
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 16,
                    }}
                >
                    <Typography.Title
                        level={5}
                        style={{ margin: 0 }}
                    >
                        {item.type}
                    </Typography.Title>

                    <Tag color={getStatusColor(item.status)}>
                        {item.status}
                    </Tag>
                </div>

                <Space
                    direction="vertical"
                    size={12}
                    style={{ width: "100%" }}
                >
                    <div>
                        <Typography.Text type="secondary">
                            Student
                        </Typography.Text>

                        <br />

                        <Typography.Text strong>
                            {item.studentEmail}
                        </Typography.Text>
                    </div>

                    <div>
                        <Typography.Text type="secondary">
                            Out Time
                        </Typography.Text>

                        <br />

                        <Typography.Text>
                            {new Date(item.outTime).toLocaleString()}
                        </Typography.Text>
                    </div>

                    <div>
                        <Typography.Text type="secondary">
                            In Time
                        </Typography.Text>

                        <br />

                        <Typography.Text>
                            {item.inTime
                                ? new Date(item.inTime).toLocaleString()
                                : "Not Returned"}
                        </Typography.Text>
                    </div>
                </Space>
            </Card>
        );
    };
    return (
        <div
            style={{
                padding: isMobile ? 12 : 24,
                maxWidth: 1200,
                margin: "0 auto",
            }}
        >
            <Title
                level={isMobile ? 3 : 2}
                style={{
                    textAlign: isMobile ? "center" : "left",
                }}
            >
                Warden Dashboard
            </Title>

            <Tabs
                defaultActiveKey="1"
                items={[
                    {
                        key: "1",
                        label: "Pending Requests",
                        children: isMobile ? (
                            pendingData.length === 0 ? (
                                <Card>
                                    <Typography.Text type="secondary">
                                        No pending requests
                                    </Typography.Text>
                                </Card>
                            ) : (
                                pendingData.map((item) => (
                                    <PendingCard
                                        key={item.id}
                                        item={item}
                                    />
                                ))
                            )
                        ) : (
                            <Table
                                columns={pendingColumns}
                                dataSource={pendingData}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 5,
                                }}
                            />
                        ),
                    },
                    {
                        key: "2",
                        label: "Approval History",
                        children: isMobile ? (
                            historyData.length === 0 ? (
                                <Card>
                                    <Typography.Text type="secondary">
                                        No history available
                                    </Typography.Text>
                                </Card>
                            ) : (
                                historyData.map((item) => (
                                    <HistoryCard
                                        key={item.id}
                                        item={item}
                                    />
                                ))
                            )
                        ) : (
                            <Table
                                columns={historyColumns}
                                dataSource={historyData}
                                rowKey="id"
                                loading={loading}
                                pagination={{
                                    pageSize: 5,
                                }}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
};

export default WardenDashboard;