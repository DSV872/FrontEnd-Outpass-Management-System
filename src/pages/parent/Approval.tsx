import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Result, Spin, message } from 'antd';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';

const { Title, Text } = Typography;

const ParentApproval: React.FC = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');

    useEffect(() => {
        if (!token) {
            setStatus('error');
        }
    }, [token]);

    const handleDecision = async (decision: 'APPROVE' | 'REJECT') => {
        setLoading(true);
        try {
            // Assuming GET with token and decision appended. 
            // The requirement mentioned: GET /outpass-service/parent/approve?token={approvalToken}
            // For decision making, it should logically include the decision if it's not pre-destined in token. 
            // We will assume the API takes `&decision=APPROVE` or similar, or the token is uniquely mapped to an action.
            // Re-reading requirements: `GET /outpass-service/parent/approve?token={approvalToken}`
            // This might imply opening the link directly acts as approval OR we provide buttons and post the token.
            // E.g., appending decision=APPROVE to query map.
            await api.get(`/parent/approve?token=${token}&decision=${decision}`);
            setStatus('success');
            message.success(`Outpass ${decision.toLowerCase()}d successfully.`);
        } catch (error) {
            setStatus('error');
            message.error('Failed to process decision. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'success') {
        return (
            <Result
                status="success"
                title="Thank you!"
                subTitle="Your decision has been recorded securely."
            />
        );
    }

    if (status === 'error') {
        return (
            <Result
                status="error"
                title="Invalid Link"
                subTitle="This approval link is invalid or has expired."
            />
        );
    }

    return (
        <div style={{ padding: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
            <Card title="Parent Consent Required" style={{ width: 400, textAlign: 'center' }}>
                <Text>You are reviewing an outpass application for your ward. Do you approve this request?</Text>
                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <Button type="primary" loading={loading} onClick={() => handleDecision('APPROVE')}>
                        Approve
                    </Button>
                    <Button danger loading={loading} onClick={() => handleDecision('REJECT')}>
                        Reject
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ParentApproval;
