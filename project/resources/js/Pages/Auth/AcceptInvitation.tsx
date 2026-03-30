import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import GuestLayout from '../../Layouts/GuestLayout';
import { parseApiError } from '../../common/apiError';
import { notify } from '../../common/notify';

type Props = {
    token: string;
    status: 'pending' | 'accepted' | 'rejected' | 'revoked' | 'expired' | 'invalid';
    invitation: {
        email: string;
        full_name?: string | null;
        role_code: string;
        note?: string | null;
        tenant_name?: string | null;
    } | null;
};

export default function AcceptInvitation({ token, status, invitation }: Props) {
    const { t } = useTranslation();
    const { props } = usePage<any>();
    const user = props.auth?.user as { name?: string } | null;
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState((invitation?.full_name as string) || (user?.name as string) || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    function showApiError(err: any, fallback: string) {
        const parsed = parseApiError(err, fallback);
        notify.error({
            title: parsed.title,
            detail: parsed.detail ?? t('auth.notifications.try_again'),
        });
    }

    async function submit(action: 'accept' | 'reject') {
        setLoading(true);
        try {
            const response = await axios.post('/api/v1/invitations/accept', {
                token,
                action,
                name,
                password,
                password_confirmation: passwordConfirmation,
            });
            if (response.data.data.accepted) {
                notify.success(t('auth.notifications.invitation_accepted'));
                const tenantSlug = response.data.data.tenant_slug;
                window.location.href = `/t/${tenantSlug}/dashboard`;
                return;
            }

            notify.info(t('auth.notifications.invitation_rejected'));
            window.location.reload();
        } catch (err: any) {
            showApiError(err, t('auth.notifications.invitation_process_failed'));
        } finally {
            setLoading(false);
        }
    }

    const invitationInvalid = status !== 'pending';

    return (
        <GuestLayout>
            <Head title="Accept Invitation" />
            <div className="auth-page-content mt-lg-5">
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6}>
                            <Card className="mt-4">
                                <Card.Body className="p-4">
                                    <h5 className="text-primary mb-3">Tenant Invitation</h5>

                                    {invitation ? (
                                        <div className="mb-3">
                                            <p className="mb-1"><strong>Workspace:</strong> {invitation.tenant_name || '-'}</p>
                                            <p className="mb-1"><strong>Email:</strong> {invitation.email}</p>
                                            <p className="mb-1 text-capitalize"><strong>Role:</strong> {invitation.role_code.replace('_', ' ')}</p>
                                            {invitation.note ? <p className="mb-0 text-muted"><strong>Note:</strong> {invitation.note}</p> : null}
                                        </div>
                                    ) : null}

                                    {invitationInvalid ? (
                                        <Alert variant="warning" className="mb-0 text-capitalize">
                                            Invitation status: {status}
                                        </Alert>
                                    ) : (
                                        <Form>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Full Name</Form.Label>
                                                <Form.Control
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Set Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Confirm Password</Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    value={passwordConfirmation}
                                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                                    required
                                                />
                                            </Form.Group>
                                            <div className="d-flex gap-2">
                                                <Button variant="success" onClick={() => submit('accept')} disabled={loading}>
                                                    {loading ? 'Processing...' : 'Accept Invitation'}
                                                </Button>
                                                <Button variant="light" onClick={() => submit('reject')} disabled={loading}>
                                                    Reject
                                                </Button>
                                            </div>
                                        </Form>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </GuestLayout>
    );
}
