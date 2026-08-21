import React, { useEffect, useMemo, useState } from "react";
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
import {
    PlusOutlined,
    MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { QRCodeCanvas } from "qrcode.react";

import api from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import {
    outpassService,
    type ResendEmailResponse,
    type ResendRecipient,
} from "../../services/outpassService";

const { Title } = Typography;
const { useBreakpoint } = Grid;

interface Outpass {
    id: number;
    reason: string;
    outpassType: string;
    status: string;
    outTime: string;
    expectedInTime: string;
    inTime: string | null;
    destination: string;
}

const StudentDashboard: React.FC = () => {

    const [data, setData] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(false);

    const [qrVisible, setQrVisible] = useState(false);
    const [qrToken, setQrToken] = useState<string | null>(null);
    const [resendInfo, setResendInfo] = useState<
        Record<number, ResendEmailResponse>
    >({});
    const [resendLoading, setResendLoading] = useState<number | null>(
        null
    );

    const navigate = useNavigate();

    const { user } = useAuth();

    const screens = useBreakpoint();

    const isMobile = !screens.md;

    /*
     * FETCH OUTPASSES
     */

    const fetchOutpasses = async () => {

        setLoading(true);

        try {

            const res = await api.get(
                "/outpass-service/student/outpasses/all"
            );

            setData(res.data);

        } catch (error) {

            console.error(
                "[StudentDashboard] Failed to load outpasses:",
                error
            );

            message.error("Failed to load outpasses");

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        if (user) {
            fetchOutpasses();
        }

    }, [user]);

    /*
     * CANCEL OUTPASS
     */

    const handleCancel = async (id: number) => {

        try {

            await api.put(
                `/outpass-service/student/cancel/${id}`
            );

            message.success("Outpass cancelled");

            await fetchOutpasses();

        } catch (error) {

            console.error(
                "[StudentDashboard] Cancel failed:",
                error
            );

            message.error("Cancel failed");
        }
    };

    /*
     * SHOW QR
     */

    const showQr = async (id: number) => {

        try {

            const res = await api.get(
                `/outpass-service/student/qr/${id}`
            );

            if (!res.data?.qrToken) {

                message.warning("No QR Found");

                setQrToken(null);

            } else {

                setQrToken(res.data.qrToken);
            }

            setQrVisible(true);

        } catch (error) {

            console.error(
                "[StudentDashboard] Failed to fetch QR:",
                error
            );

            message.error("Failed to fetch QR");
        }
    };

    /*
     * RESEND EMAIL
     */

    const handleResendEmail = async (
        outpassId: number,
        recipient: ResendRecipient
    ) => {

        try {

            setResendLoading(outpassId);

            const response =
                await outpassService.resendEmail(
                    outpassId,
                    recipient
                );

            setResendInfo((previous) => ({
                ...previous,
                [outpassId]: response,
            }));
            message.success(response.message);

        } catch (error: any) {

            console.error(
                "[StudentDashboard] Resend email failed:",
                error
            );

            const errorMessage =
                error?.response?.data?.message ||
                "Failed to resend email";

            message.error(errorMessage);

        } finally {

            setResendLoading(null);
        }
    };
    const getRemainingAttempts = (outpassId: number): number => {

        const info = resendInfo[outpassId];

        if (!info) {
            return 3;
        }

        return Math.max(
            0,
            info.remainingAttempts
        );
    };

    /*
     * ---------------------------------------------------------
     * STATUS
     * ---------------------------------------------------------
     */

    const today = dayjs().format("YYYY-MM-DD");

    const activeOutpasses = useMemo(() => {

        return data.filter((item) => {

            const outDate =
                dayjs(item.outTime).format("YYYY-MM-DD");

            return (
                outDate === today &&
                [
                    "PENDING",
                    "PARENT_APPROVED",
                    "WARDEN_APPROVED",
                    "OUT",
                ].includes(item.status)
            );
        });

    }, [data, today]);

    const historyOutpasses = useMemo(() => {

        return data;

    }, [data]);

    const isApplyDisabled =
        activeOutpasses.length > 0;

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

    /*
     * ---------------------------------------------------------
     * TABLE COLUMNS
     * ---------------------------------------------------------
     */

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
                dayjs(text).format(
                    "DD MMM YYYY HH:mm"
                ),
        },

        {
            title: "Expected In Time",
            dataIndex: "expectedInTime",

            render: (text: string) =>
                dayjs(text).format(
                    "DD MMM YYYY HH:mm"
                ),
        },

        {
            title: "Actual In Time",
            dataIndex: "actualI nTime",

            render: (text: string | null) =>
                text
                    ? dayjs(text).format(
                        "DD MMM YYYY HH:mm"
                    )
                    : "Not Returned",
        },

        {
            title: "Status",
            dataIndex: "status",

            render: (status: string) => (

                <Tag
                    color={getStatusColor(status)}
                >
                    {status}
                </Tag>
            ),
        },
    ];

    /*
     * ---------------------------------------------------------
     * RESEND BUTTONS
     * ---------------------------------------------------------
     */

    const ResendButtons = ({
        outpass,
    }: {
        outpass: Outpass;
    }) => {

        const outpassId = outpass.id;

        const remainingAttempts =
            getRemainingAttempts(outpassId);

        const noAttemptsLeft =
            remainingAttempts <= 0;
        return (

            <Space wrap>

                {/* Parent resend - ONLY when PENDING */}
                {outpass.status === "PENDING" && (
                    <Popconfirm
                        title="Resend email to parent?"
                        description={
                            noAttemptsLeft
                                ? "No resend attempts remaining."
                                : `${remainingAttempts} resend attempt${remainingAttempts === 1 ? "" : "s"
                                } remaining.`
                        }
                        okText="Resend"
                        cancelText="Cancel"
                        disabled={noAttemptsLeft}
                        onConfirm={() =>
                            handleResendEmail(
                                outpassId,
                                "PARENT"
                            )
                        }
                    >
                        <Button
                            icon={<MailOutlined />}
                            disabled={noAttemptsLeft}
                            loading={resendLoading === outpassId}
                        >
                            Resend Parent
                        </Button>
                    </Popconfirm>
                )}

                {/* Warden resend - ONLY when PARENT_APPROVED */}
                {outpass.status === "PARENT_APPROVED" && (
                    <Popconfirm
                        title="Resend email to warden?"
                        description={
                            noAttemptsLeft
                                ? "No resend attempts remaining."
                                : `${remainingAttempts} resend attempt${remainingAttempts === 1 ? "" : "s"
                                } remaining.`
                        }
                        okText="Resend"
                        cancelText="Cancel"
                        disabled={noAttemptsLeft}
                        onConfirm={() =>
                            handleResendEmail(
                                outpassId,
                                "WARDEN"
                            )
                        }
                    >
                        <Button
                            icon={<MailOutlined />}
                            disabled={noAttemptsLeft}
                            loading={resendLoading === outpassId}
                        >
                            Resend Warden
                        </Button>
                    </Popconfirm>
                )}

                {/* Show resend count only when a resend is actually applicable */}
                {(outpass.status === "PENDING" ||
                    outpass.status === "PARENT_APPROVED") && (
                        <Tag
                            color={
                                noAttemptsLeft
                                    ? "red"
                                    : "blue"
                            }
                        >
                            {remainingAttempts}{" "}
                            {remainingAttempts === 1
                                ? "attempt"
                                : "attempts"}{" "}
                            left
                        </Tag>
                    )}

            </Space>
        );
    };

    /*
     * ---------------------------------------------------------
     * ACTIVE TABLE COLUMNS
     * ---------------------------------------------------------
     */

    const activeColumns = [

        ...columns,

        {
            title: "Action",

            render: (
                _: any,
                record: Outpass
            ) => (

                <Space wrap>

                    {record.status === "PENDING" && (
                        <Popconfirm
                            title="Cancel this request?"
                            onConfirm={() =>
                                handleCancel(record.id)
                            }
                        >
                            <Button danger type="link">
                                Cancel
                            </Button>
                        </Popconfirm>
                    )}

                    {(record.status === "WARDEN_APPROVED" ||
                        record.status === "OUT") && (
                            <Button
                                type="link"
                                onClick={() =>
                                    showQr(record.id)
                                }
                            >
                                Show QR
                            </Button>
                        )}

                    <ResendButtons
                        outpass={record}
                    />

                </Space>
            ),
        },
    ];

    /*
     * ---------------------------------------------------------
     * MOBILE OUTPASS CARD
     * ---------------------------------------------------------
     */

    const OutpassCard = ({
        item,
    }: {
        item: Outpass;
    }) => {

        return (

            <Card
                hoverable
                size="small"
                style={{
                    marginBottom: 16,
                    borderRadius: 12,
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >

                <Space
                    direction="vertical"
                    style={{
                        width: "100%",
                    }}
                >

                    <div
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                        }}
                    >

                        <strong>
                            {item.outpassType}
                        </strong>

                        <Tag
                            color={getStatusColor(
                                item.status
                            )}
                            style={{
                                fontWeight: 600,
                                paddingInline: 10,
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

                        {dayjs(
                            item.outTime
                        ).format(
                            "DD MMM YYYY HH:mm"
                        )}
                    </div>

                    <div>
                        <strong>Expected In</strong>
                        <br />

                        {dayjs(
                            item.expectedInTime
                        ).format(
                            "DD MMM YYYY HH:mm"
                        )}
                    </div>

                    <div>
                        <strong>Actual In</strong>
                        <br />

                        {item.inTime
                            ? dayjs(
                                item.inTime
                            ).format(
                                "DD MMM YYYY HH:mm"
                            )
                            : "Not Returned"}
                    </div>

                    <Space wrap>

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

                        {(item.status === "WARDEN_APPROVED" ||
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

                        <ResendButtons
                            outpass={item}
                        />

                    </Space>

                </Space>

            </Card>
        );
    };

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

    return (

        <div
            style={{
                padding: 24,
            }}
        >

            {/* HEADER */}

            <Space
                direction={
                    isMobile
                        ? "vertical"
                        : "horizontal"
                }
                style={{
                    width: "100%",
                    justifyContent:
                        "space-between",
                    marginBottom: 20,
                }}
            >

                <Title level={2}>
                    My Outpasses
                </Title>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    block={isMobile}
                    disabled={isApplyDisabled}
                    onClick={() =>
                        navigate(
                            "/student/apply"
                        )
                    }
                >
                    Apply Outpass / Outing
                </Button>

            </Space>

            {/* ACTIVE OUTPASS */}

            <Card
                title="Active Outing / Outpass"
                style={{
                    marginBottom: 20,
                }}
            >

                {activeOutpasses.length === 0 ? (

                    <Typography.Text type="secondary">
                        No active outing/outpass.
                    </Typography.Text>

                ) : isMobile ? (

                    activeOutpasses.map(
                        (item) => (

                            <OutpassCard
                                key={item.id}
                                item={item}
                            />

                        )
                    )

                ) : (

                    <Table
                        columns={activeColumns}
                        dataSource={
                            activeOutpasses
                        }
                        rowKey="id"
                        pagination={false}
                    />

                )}

            </Card>

            {/* HISTORY */}

            <Card title="Outpass History">

                {historyOutpasses.length === 0 ? (

                    <Typography.Text type="secondary">
                        No history found.
                    </Typography.Text>

                ) : isMobile ? (

                    historyOutpasses.map(
                        (item) => (

                            <OutpassCard
                                key={item.id}
                                item={item}
                            />

                        )
                    )

                ) : (

                    <Table
                        columns={columns}
                        dataSource={
                            historyOutpasses
                        }
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            pageSize: 5,
                        }}
                    />

                )}

            </Card>

            {/* QR MODAL */}

            <Modal
                title="Gate QR"
                open={qrVisible}
                footer={null}
                onCancel={() =>
                    setQrVisible(false)
                }
            >

                <div
                    style={{
                        textAlign: "center",
                    }}
                >

                    {qrToken ? (

                        <>
                            <QRCodeCanvas
                                value={qrToken}
                                size={220}
                            />

                            <p
                                style={{
                                    marginTop: 10,
                                }}
                            >
                                Show this QR at the hostel
                                gate
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