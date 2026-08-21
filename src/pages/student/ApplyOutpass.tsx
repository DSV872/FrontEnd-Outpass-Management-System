import React, { useState } from "react";
import {
    Form,
    Input,
    Button,
    DatePicker,
    Typography,
    Card,
    Row,
    Col,
    Select,
    message,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ApplyOutpass: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);

        try {
            const payload = {
                outpassType: values.outpassType,
                reason: values.reason,
                destination: values.destination,
                outTime: values.outTime.format("YYYY-MM-DDTHH:mm:ss"),
                expectedInTime: values.expectedInTime.format(
                    "YYYY-MM-DDTHH:mm:ss"
                ),
            };

            await api.post("/outpass-service/student/apply", payload);

            message.success("Outpass applied successfully");

            // Redirect to dashboard
            navigate("/student/dashboard");

        } catch (error: any) {
            console.error("Apply error:", error?.response?.data);
            message.error(
                error?.response?.data?.message || "Failed to apply for outpass"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: 24 }}>
            <Row justify="center">
                <Col xs={24} sm={20} md={16} lg={12}>
                    <Card>

                        {/* 🔙 Back to Dashboard */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: 16,
                                cursor: "pointer",
                                color: "#1890ff",
                            }}
                            onClick={() => navigate("/student/dashboard")}
                        >
                            <ArrowLeftOutlined style={{ marginRight: 8 }} />
                            Back to Dashboard
                        </div>

                        <Title level={4}>Apply for Outpass</Title>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                name="outpassType"
                                label="Outpass Type"
                                rules={[{ required: true }]}
                            >
                                <Select placeholder="Select type">
                                    <Option value="OUTING">OUTING</Option>
                                    <Option value="OUTPASS">OUTPASS</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="destination"
                                label="Destination"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="Enter destination" />
                            </Form.Item>

                            <Form.Item
                                name="reason"
                                label="Reason"
                                rules={[{ required: true }]}
                            >
                                <TextArea rows={3} placeholder="Enter reason" />
                            </Form.Item>

                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item
                                        name="outTime"
                                        label="Out Time"
                                        rules={[{ required: true }]}
                                    >
                                        <DatePicker
                                            showTime
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item
                                        name="expectedInTime"
                                        label="Expected In Time"
                                        rules={[{ required: true }]}
                                    >
                                        <DatePicker
                                            showTime
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                >
                                    Submit
                                </Button>
                            </Form.Item>

                        </Form>
                    </Card>
                </Col>
            </Row>
        </div >
    );
};

export default ApplyOutpass;