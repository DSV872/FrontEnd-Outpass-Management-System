import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Typography } from 'antd';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';

interface ViewQRProps {
    outpassId: string | null;
    onClose: () => void;
}

const ViewQR: React.FC<ViewQRProps> = ({ outpassId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [qrData, setQrData] = useState<string | null>(null);

    useEffect(() => {
        if (outpassId) {
            fetchQR();
        }
    }, [outpassId]);

    const fetchQR = async () => {
        setLoading(true);
        try {
            // The requirement says GET /outpass-service/student/qr/{outpassId}
            // Assuming this returns the string to be encoded in QR or the QR image itself.
            // If it returns a string token to encode:
            const response = await api.get(`/outpass-service/student/qr/${outpassId}`);
            if (response.data && response.data.qrToken) {
                setQrData(response.data.qrToken);
            } else {
                // Fallback if the API returns the token string directly or different structure
                setQrData(JSON.stringify(response.data));
            }
        } catch (error) {
            message.error('Failed to load QR Code');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Outpass QR Code"
            open={!!outpassId}
            onCancel={onClose}
            footer={null}
            centered
        >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px', flexDirection: 'column', alignItems: 'center' }}>
                {loading ? (
                    <Spin size="large" />
                ) : qrData ? (
                    <>
                        <QRCodeSVG value={qrData} size={250} />
                        <Typography.Text type="secondary" style={{ marginTop: 16 }}>
                            Scan this at the security gate
                        </Typography.Text>
                    </>
                ) : (
                    <Typography.Text type="danger">Could not load QR Data</Typography.Text>
                )}
            </div>
        </Modal>
    );
};

export default ViewQR;
