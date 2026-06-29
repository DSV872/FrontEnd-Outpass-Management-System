import React, { useEffect, useState, useMemo } from "react";
import {
    Table,
    Button,
    Space,
    Typography,
    Popconfirm,
    message,
    Tag,
    Modal,
    Card,
    Grid,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";

const { Title } = Typography;
const { useBreakpoint } = Grid;
interface Outpass {
    id: number;
    reason: string;
    outpassType: string;
    status: string;
    outTime: string;
    expectedInTime: string;
    actualInTime: string | null;
    destination: string;
}

const StudentDashboard: React.FC = () => {
    const [data, setData] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(false);
    const [qrVisible, setQrVisible] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);

    const navigate = useNavigate();
    const { user } = useAuth();
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const fetchOutpasses = async () => {
        setLoading(true);
        try {
            const res = await api.get("/student/outpasses/all");
            setData(res.data);
        } catch {
            message.error("Failed to load outpasses");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchOutpasses();
    }, [user]);

    const handleCancel = async (id: number) => {
        try {
            await api.put(`/student/cancel/${id}`);
            message.success("Outpass cancelled");
            fetchOutpasses();
        } catch {
            message.error("Cancel failed");
        }
    };

    const showQr = async (id: number) => {
        try {
            const res = await api.get(`/student/qr/${id}`);

            if (!res.data?.qrToken) {
                message.warning("No QR Found");
                setQrToken(null);
            } else {
                setQrToken(res.data.qrToken);
            }

            setQrVisible(true);
        } catch {
            message.error("Failed to fetch QR");
        }
    };

    const today = dayjs().format("YYYY-MM-DD");

    // Active outing/outpass
    const activeOutpasses = useMemo(() => {
        
        return data.filter((item) => {
            const outDate = dayjs(item.outTime).format("YYYY-MM-DD");
            return (
                outDate === today &&
                ["PENDING", "PARENT_APPROVED", "WARDEN_APPROVED", "OUT"].includes(
                    item.status
                )
            );
        });
    }, [data]);

    // History
   const historyOutpasses = useMemo(() => {
    return data;
}, [data]);

    const isApplyDisabled = activeOutpasses.length > 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case "WARDEN_APPROVED":
                return "green";
            case "PARENT_APPROVED":
                return "cyan";
            case "OUT":
                return "orange";
            case "IN":
                return "blue";
            case "REJECTED":
            case "CANCELLED":
                return "red";
            case "PENDING":
                return "gold";
            default:
                return "default";
        }
    };

    const columns = [
        {
            title: "Type",
            dataIndex: "outpassType",
        },
        {
            title: "Reason",
            dataIndex: "reason",
        },
        {
            title: "Destination",
            dataIndex: "destination",
        },
        {
            title: "Out Time",
            dataIndex: "outTime",
            render: (text: string) =>
                dayjs(text).format("DD MMM YYYY HH:mm"),
        },
        {
            title: "Expected In Time",
            dataIndex: "expectedInTime",
            render: (text: string) =>
                dayjs(text).format("DD MMM YYYY HH:mm"),
        },
        {
            title: "Actual In Time",
            dataIndex: "actualInTime",
            render: (text: string | null) =>
                text
                    ? dayjs(text).format("DD MMM YYYY HH:mm")
                    : "Not Returned",
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
        },
    ];

    const activeColumns = [
        ...columns,
        {
            title: "Action",
            render: (_: any, record: Outpass) => (
                <Space>
                    {record.status === "PENDING" && (
                        <Popconfirm
                            title="Cancel this request?"
                            onConfirm={() => handleCancel(record.id)}
                        >
                            <Button danger type="link">
                                Cancel
                            </Button>
                        </Popconfirm>
                    )}

                    {(record.status === "WARDEN_APPROVED" ||
                        record.status === "OUT") && (
                            <Button type="link" onClick={() => showQr(record.id)}>
                                Show QR
                            </Button>
                        )}
                </Space>
            ),
        },
    ];
    const OutpassCard = ({ item }: { item: Outpass }) => (
        
        <Card
            hoverable
            size="small"
            style={{
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}
        >
            <Space
                direction="vertical"
                style={{ width: "100%" }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <strong>{item.outpassType}</strong>

                    <Tag
                        color={getStatusColor(item.status)}
                        style={{
                            fontWeight: 600,
                            paddingInline: 10
                        }}
                    >
                        {item.status}
                    </Tag>
                </div>

                <div>
                    <strong>Reason</strong>
                    <br />
                    {item.reason}
                </div>

                <div>
                    <strong>Destination</strong>
                    <br />
                    {item.destination}
                </div>

                <div>
                    <strong>Out Time</strong>
                    <br />
                    {dayjs(item.outTime).format(
                        "DD MMM YYYY HH:mm"
                    )}
                </div>

                <div>
                    <strong>Expected In</strong>
                    <br />
                    {dayjs(item.expectedInTime).format(
                        "DD MMM YYYY HH:mm"
                    )}
                </div>

                <div>
                    <strong>Actual In</strong>
                    <br />
                    {item.actualInTime
                        ? dayjs(item.actualInTime).format(
                            "DD MMM YYYY HH:mm"
                        )
                        : "Not Returned"}
                </div>

                <Space>
                    {item.status === "PENDING" && (
                        <Popconfirm
                            title="Cancel this request?"
                            onConfirm={() =>
                                handleCancel(item.id)
                            }
                        >
                            <Button danger>
                                Cancel
                            </Button>
                        </Popconfirm>
                    )}

                    {(item.status ===
                        "WARDEN_APPROVED" ||
                        item.status === "OUT") && (
                            <Button
                                type="primary"
                                onClick={() =>
                                    showQr(item.id)
                                }
                            >
                                Show QR
                            </Button>
                        )}
                </Space>
            </Space>
        </Card>
    );
    return (
        <div style={{ padding: 24 }}>
            <Space
                direction={isMobile ? "vertical" : "horizontal"}
                style={{
                    width: "100%",
                    justifyContent: "space-between",
                    marginBottom: 20,
                }}
            >
                <Title level={2}>My Outpasses</Title>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block={isMobile}
                    disabled={isApplyDisabled}
                    onClick={() => navigate("/student/apply")}
                >
                    Apply Outpass / Outing
                </Button>
            </Space>

            {/* Active Section */}
            <Card
                title="Active Outing / Outpass"
                style={{ marginBottom: 20 }}
            >
                {activeOutpasses.length === 0 ? (
                    <Typography.Text type="secondary">
                        No active outing/outpass.
                    </Typography.Text>
                ) : isMobile ? (
                    activeOutpasses.map((item) => (
                        <OutpassCard
                            key={item.id}
                            item={item}
                        />
                    ))
                ) : (
                    <Table
                        columns={activeColumns}
                        dataSource={activeOutpasses}
                        rowKey="id"
                        pagination={false}
                    />
                )}
            </Card>

            {/* History Section */}
            <Card title="Outpass History">
                {historyOutpasses.length === 0 ? (
                    <Typography.Text type="secondary">
                        No history found.
                    </Typography.Text>
                ) : isMobile ? (
                    historyOutpasses.map((item) => (
                        <OutpassCard
                            key={item.id}
                            item={item}
                        />
                    ))
                ) : (
                    <Table
                        columns={columns}
                        dataSource={historyOutpasses}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 5,
                        }}
                    />
                )}
            </Card>

            {/* QR Modal */}
            <Modal
                title="Gate QR"
                open={qrVisible}
                footer={null}
                onCancel={() => setQrVisible(false)}
            >
                <div style={{ textAlign: "center" }}>
                    {qrToken ? (
                        <>
                            <QRCodeCanvas value={qrToken} size={220} />
                            <p style={{ marginTop: 10 }}>
                                Show this QR at the hostel gate
                            </p>
                        </>
                    ) : (
                        <p>No QR Found</p>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default StudentDashboard;