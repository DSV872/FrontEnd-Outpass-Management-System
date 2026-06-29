import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Typography,
  Tabs,
  message,
  Table,
  Tag,
  Grid,
  Space,
} from 'antd';
import { ScanOutlined } from '@ant-design/icons';
import api from '../../api/axios';

const { Title } = Typography;
const { useBreakpoint } = Grid;
interface ScanHistory {
  id: number;
  studentEmail: string;
  outpassType: string;
  outTime: string;
  expectedInTime: string;
  actualIntime: string | null;
  actualOutTime: string | null;
  outpassStatus: string;
}

const SecurityDashboard: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const fetchHistory = async () => {
    try {
      const response = await api.get('/security/history');
      setHistory(response.data);
    } catch (error) {
      console.error(error);
      message.error('Failed to load history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleScan = async (type: 'in' | 'out') => {
    if (!tokenInput.trim()) {
      message.warning('Please enter or scan a token first');
      return;
    }

    setLoading(true);

    try {
      await api.put(`/security/scan-${type}/${tokenInput}`);

      message.success(
        `Student scanned ${type.toUpperCase()} successfully`
      );

      setTokenInput('');
      fetchHistory();
    } catch (error: any) {
      console.error(error.response?.data);
      message.error(
        error.response?.data?.message ||
        `Failed to scan ${type}`
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OUT':
        return 'orange';
      case 'IN':
        return 'green';
      case 'WARDEN_APPROVED':
        return 'blue';
      case 'PARENT_APPROVED':
        return 'cyan';
      case 'PENDING':
        return 'gold';
      case 'REJECTED':
        return 'red';
      case 'CANCELLED':
        return 'red';
      default:
        return 'default';
    }
  };

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
      dataIndex: 'outpassType',
      key: 'outpassType',
    },
    {
      title: 'Status',
      dataIndex: 'outpassStatus',
      key: 'outpassStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
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
      title: 'Expected In Time',
      dataIndex: 'expectedInTime',
      key: 'expectedInTime',
      render: (value: string) =>
        new Date(value).toLocaleString(),
    },
    {
      title: 'Actual Out Time',
      dataIndex: 'actualOutTime',
      key: 'actualOutTime',
      render: (value: string | null) =>
        value
          ? new Date(value).toLocaleString()
          : 'Not Scanned',
    },
    {
      title: 'Actual In Time',
      dataIndex: 'actualIntime',
      key: 'actualIntime',
      render: (value: string | null) =>
        value
          ? new Date(value).toLocaleString()
          : 'Not Scanned',
    },
  ];

  const ScannerTab = () => (
    <Card bordered={false}>
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <ScanOutlined
          style={{
            fontSize: isMobile ? 48 : 70,
            color: "#1677ff",
          }}
        />

        <Typography.Title
          level={isMobile ? 4 : 3}
          style={{ marginTop: 20 }}
        >
          QR Scanner
        </Typography.Title>

        <Typography.Text type="secondary">
          Scan the QR code or paste the JWT token.
        </Typography.Text>
      </div>

      <Input
        size="large"
        placeholder="Scan / Paste QR Token"
        value={tokenInput}
        onChange={(e) =>
          setTokenInput(e.target.value)
        }
        style={{
          marginBottom: 20,
        }}
      />

      <Space
        direction={
          isMobile
            ? "vertical"
            : "horizontal"
        }
        style={{ width: "100%" }}
      >
        <Button
          type="primary"
          block
          loading={loading}
          onClick={() =>
            handleScan("out")
          }
        >
          Scan OUT
        </Button>

        <Button
          block
          loading={loading}
          onClick={() =>
            handleScan("in")
          }
        >
          Scan IN
        </Button>
      </Space>
    </Card>
  );
  const HistoryCard = ({
    item,
  }: {
    item: ScanHistory;
  }) => (
    <Card
      hoverable
      size="small"
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow:
          "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          marginBottom: 12,
        }}
      >
        <Typography.Title
          level={5}
          style={{ margin: 0 }}
        >
          {item.outpassType}
        </Typography.Title>

        <Tag
          color={getStatusColor(
            item.outpassStatus
          )}
        >
          {item.outpassStatus}
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

          {new Date(
            item.outTime
          ).toLocaleString()}
        </div>

        <div>
          <Typography.Text type="secondary">
            Expected In
          </Typography.Text>

          <br />

          {new Date(
            item.expectedInTime
          ).toLocaleString()}
        </div>

        <div>
          <Typography.Text type="secondary">
            Actual Out
          </Typography.Text>

          <br />

          {item.actualOutTime
            ? new Date(
              item.actualOutTime
            ).toLocaleString()
            : "Not Scanned"}
        </div>

        <div>
          <Typography.Text type="secondary">
            Actual In
          </Typography.Text>

          <br />

          {item.actualIntime
            ? new Date(
              item.actualIntime
            ).toLocaleString()
            : "Not Scanned"}
        </div>
      </Space>
    </Card>
  );
  const HistoryTab = () =>
    isMobile ? (
      history.length === 0 ? (
        <Card>
          <Typography.Text
            type="secondary"
          >
            No history found
          </Typography.Text>
        </Card>
      ) : (
        <>
          {history.map((item) => (
            <HistoryCard
              key={item.id}
              item={item}
            />
          ))}
        </>
      )
    ) : (
      <Table
        rowKey="id"
        columns={historyColumns}
        dataSource={history}
        pagination={{
          pageSize: 5,
        }}
      />
    );

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
          textAlign: isMobile
            ? "center"
            : "left",
        }}
      >
        Security Dashboard
      </Title>

      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'QR Scanner',
            children: <ScannerTab />,
          },
          {
            key: '2',
            label: 'Scan History',
            children: <HistoryTab />,
          },
        ]}
      />
    </div>
  );
};

export default SecurityDashboard;