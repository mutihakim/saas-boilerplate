import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import TenantLayout from '../../Layouts/TenantLayout';
import { notify } from '../../common/notify';
import { CompatPageTitle } from '../../compat/velzon';

type Props = {
    mfa: {
        enabled: boolean;
        confirmed_at: string | null;
        has_recovery_codes: boolean;
    };
};

export default function Security({ mfa }: Props) {
    const { t } = useTranslation();
    const [secret, setSecret] = useState<string | null>(null);
    const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [code, setCode] = useState('');
    const [enabled, setEnabled] = useState(mfa.enabled);
    const [loading, setLoading] = useState(false);

    async function enableMfa() {
        setLoading(true);
        try {
            const response = await axios.post(route('profile.security.mfa.enable'));
            setSecret(response.data.data.secret);
            setOtpauthUrl(response.data.data.otpauth_url);
            setRecoveryCodes(response.data.data.recovery_codes ?? []);
            notify.success(t('auth.notifications.mfa_secret_generated'));
        } catch {
            notify.error({
                title: t('auth.notifications.mfa_enable_failed_title'),
                detail: t('auth.notifications.try_again'),
            });
        } finally {
            setLoading(false);
        }
    }

    async function verifyMfa() {
        setLoading(true);
        try {
            await axios.post(route('profile.security.mfa.verify'), { code });
            setEnabled(true);
            setCode('');
            notify.success(t('auth.notifications.mfa_enabled'));
        } catch (err: any) {
            notify.error({
                title: t('auth.notifications.mfa_verify_failed_title'),
                detail: err?.response?.data?.error?.message ?? t('auth.notifications.invalid_code'),
            });
        } finally {
            setLoading(false);
        }
    }

    async function disableMfa() {
        setLoading(true);
        try {
            await axios.delete(route('profile.security.mfa.disable'));
            setEnabled(false);
            setSecret(null);
            setOtpauthUrl(null);
            setRecoveryCodes([]);
            notify.success(t('auth.notifications.mfa_disabled'));
        } catch {
            notify.error({
                title: t('auth.notifications.mfa_disable_failed_title'),
                detail: t('auth.notifications.try_again'),
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head title="Security Settings" />
            <CompatPageTitle
                title="Security Settings"
                subtitle="Kelola multi-factor authentication dan keamanan akun dari shared Velzon shell."
            />
            <Row>
                <Col xl={8}>
                    <Card>
                        <Card.Body>
                            <Alert variant={enabled ? 'success' : 'warning'}>
                                {enabled ? 'MFA is enabled for your account.' : 'MFA is not enabled yet.'}
                            </Alert>
                            <div className="d-flex gap-2 mb-3">
                                <Button onClick={enableMfa} disabled={loading}>Generate MFA Secret</Button>
                                <Button variant="danger" onClick={disableMfa} disabled={loading || !enabled}>Disable MFA</Button>
                            </div>
                            {secret ? (
                                <Card className="bg-light border">
                                    <Card.Body>
                                        <p className="mb-1"><strong>Secret:</strong> {secret}</p>
                                        <p className="mb-1"><strong>OTP URL:</strong></p>
                                        <Form.Control readOnly value={otpauthUrl || ''} />
                                        <div className="mt-3">
                                            <h6>Recovery codes</h6>
                                            <div className="d-flex flex-wrap gap-2">
                                                {recoveryCodes.map((item) => (
                                                    <span key={item} className="badge bg-secondary-subtle text-dark">{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ) : null}
                            <Row className="mt-3">
                                <Col md={8}>
                                    <Form.Control
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="Enter authenticator or recovery code"
                                    />
                                </Col>
                                <Col md={4}>
                                    <Button className="w-100" onClick={verifyMfa} disabled={loading || !code}>
                                        Verify & Activate
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

Security.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
