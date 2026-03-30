import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Modal, Row, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import TenantPageTitle from '../../../Components/Common/TenantPageTitle';
import TenantLayout from '../../../Layouts/TenantLayout';
import { parseApiError } from '../../../common/apiError';
import { notify } from '../../../common/notify';
import { useTenantRoute } from '../../../common/tenantRoute';

type SessionPayload = {
    session_name: string;
    connection_status: string;
    connected_jid: string | null;
    auto_connect: boolean;
    meta?: Record<string, unknown> | null;
};

type PageProps = {
    currentTenant?: { id: number } | null;
};

function WhatsAppSettingsPage() {
    const { t } = useTranslation();
    const page = usePage<PageProps>();
    const tenantId = page.props.currentTenant?.id ?? null;
    const tenantRoute = useTenantRoute();
    const apiBase = `/api/v1${tenantRoute.to('/whatsapp')}`.replace('/t/', '/tenants/');
    const [loading, setLoading] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [session, setSession] = useState<SessionPayload | null>(null);
    const qrDataUrl = session?.connection_status === 'connecting' && typeof session?.meta?.qr_data_url === 'string'
        ? session.meta.qr_data_url
        : null;
    const disconnectReason = typeof session?.meta?.disconnect_reason === 'string' ? session.meta.disconnect_reason : null;
    const lifecycleState = typeof session?.meta?.lifecycle_state === 'string'
        ? session.meta.lifecycle_state
        : disconnectReason;
    const hasJidConflictMeta = disconnectReason === 'jid_conflict'
        || typeof session?.meta?.conflict_connected_jid === 'string'
        || typeof session?.meta?.conflict_owner_tenant_id === 'number'
        || typeof session?.meta?.conflict_owner_tenant_id === 'string';
    const displayLifecycleState = hasJidConflictMeta ? 'manual_remove' : lifecycleState;
    const lifecycleLabelKey = displayLifecycleState
        ? `tenant.whatsapp.settings.lifecycle.${displayLifecycleState}`
        : null;
    const conflictConnectedJid = typeof session?.meta?.conflict_connected_jid === 'string'
        ? session.meta.conflict_connected_jid
        : null;
    const conflictOwnerTenantId = typeof session?.meta?.conflict_owner_tenant_id === 'number'
        ? String(session.meta.conflict_owner_tenant_id)
        : (typeof session?.meta?.conflict_owner_tenant_id === 'string' ? session.meta.conflict_owner_tenant_id : null);
    const isJidConflictState = hasJidConflictMeta;
    const isWaitingForQr = session?.connection_status === 'connecting' && !qrDataUrl;
    const lifecycleLabel = (() => {
        if (!displayLifecycleState || !lifecycleLabelKey) {
            return '-';
        }

        const translated = t(lifecycleLabelKey);
        if (translated !== lifecycleLabelKey) {
            return translated;
        }

        if (displayLifecycleState === 'qr') {
            return t('tenant.whatsapp.settings.lifecycle_qr_generated_fallback');
        }

        return displayLifecycleState.replaceAll('_', ' ');
    })();

    function showApiError(err: any, fallback: string) {
        const parsed = parseApiError(err, fallback);
        notify.error({
            title: parsed.title,
            detail: parsed.detail ?? t('tenant.whatsapp.settings.error.try_again'),
        });
    }

    function normalizeSessionForDisplay(payload: SessionPayload): SessionPayload {
        if (payload.connection_status === 'connecting') {
            return payload;
        }

        const meta = payload.meta && typeof payload.meta === 'object'
            ? { ...payload.meta }
            : null;

        if (meta) {
            delete meta.qr_data_url;
            delete meta.qr_text;
        }

        return {
            ...payload,
            meta,
        };
    }

    async function fetchSession(options?: { silent?: boolean }) {
        const silent = options?.silent === true;
        if (!silent) {
            setLoading(true);
        }

        try {
            const response = await axios.get(`${apiBase}/session`);
            const payload = normalizeSessionForDisplay(response.data.data.session as SessionPayload);
            setSession(payload);
            return payload;
        } catch (err: any) {
            if (!silent) {
                showApiError(err, t('tenant.whatsapp.settings.error.load_failed'));
            }
            return null;
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        fetchSession();

        const channelName = `tenant.${tenantId}.whatsapp`;
        const channel = (window as any).Echo.private(channelName);

        channel.listen('.whatsapp.session.state.updated', (e: any) => {
            if (e.meta?.lifecycle_state === 'qr') {
                // Base64 QR code image is too large for Websocket Payload limits.
                // It is stripped from the broadcast to prevent server crashes.
                // We fetch it elegantly via HTTP API when we see the 'qr' signal.
                fetchSession({ silent: true });
                return;
            }

            const incoming = {
                tenant_id: e.tenant_id,
                session_name: e.session_name,
                connection_status: e.connection_status,
                connected_jid: e.connected_jid,
                auto_connect: e.meta?.restore_eligible ?? false,
                meta: e.meta,
            } as SessionPayload;

            setSession(normalizeSessionForDisplay(incoming));
        });

        return () => {
            channel.stopListening('.whatsapp.session.state.updated');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId]);

    async function connect() {
        setLoading(true);
        try {
            setSession((prev) => ({
                session_name: prev?.session_name ?? '-',
                connection_status: 'connecting',
                connected_jid: null,
                auto_connect: true,
                meta: {
                    ...(prev?.meta ?? {}),
                    lifecycle_state: 'connecting',
                    connect_requested_at: new Date().toISOString(),
                },
            }));

            const response = await axios.post(`${apiBase}/session/connect`);
            const connectStatus = String(response?.data?.data?.status || 'accepted');
            if (connectStatus === 'accepted_with_warning') {
                notify.warning(t('tenant.whatsapp.settings.toast.connect_requested_with_warning'));
            } else {
                notify.success(t('tenant.whatsapp.settings.toast.connect_requested'));
            }

            await fetchSession({ silent: true });
        } catch (err: any) {
            showApiError(err, t('tenant.whatsapp.settings.error.connect_failed'));
        } finally {
            setLoading(false);
        }
    }

    async function disconnect() {
        setLoading(true);
        try {
            await axios.post(`${apiBase}/session/disconnect`);
            notify.success(t('tenant.whatsapp.settings.toast.disconnected'));
            await fetchSession({ silent: true });
        } catch (err: any) {
            showApiError(err, t('tenant.whatsapp.settings.error.disconnect_failed'));
        } finally {
            setLoading(false);
        }
    }

    async function removeSession() {
        setLoading(true);
        try {
            await axios.post(`${apiBase}/session/remove`);
            notify.success(t('tenant.whatsapp.settings.toast.session_removed'));
            setShowRemoveConfirm(false);
            setSession((prev) => (prev ? ({
                ...prev,
                connection_status: 'disconnected',
                connected_jid: null,
                auto_connect: false,
                meta: {
                    ...(prev.meta ?? {}),
                    disconnect_reason: 'manual_remove',
                    lifecycle_state: 'manual_remove',
                    restore_eligible: false,
                    qr_data_url: null,
                    qr_text: null,
                },
            }) : prev));
            await fetchSession({ silent: true });
        } catch (err: any) {
            showApiError(err, t('tenant.whatsapp.settings.error.remove_failed'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head title={t('tenant.whatsapp.settings.page_title')} />
            <TenantPageTitle title={t('tenant.whatsapp.settings.title')} parentLabel={t('tenant.whatsapp.settings.parent')} />

            <Row className="g-3">
                <Col lg={8}>
                    <Card className="h-100">
                        <Card.Body>
                            <h5 className="card-title mb-3">{t('tenant.whatsapp.settings.session_status')}</h5>
                            {isJidConflictState && (
                                <Alert variant="warning" className="mb-3">
                                    {t('tenant.whatsapp.settings.alert.jid_conflict', {
                                        jid: conflictConnectedJid ?? '-',
                                        owner_tenant_id: conflictOwnerTenantId ?? '-',
                                    })}
                                </Alert>
                            )}
                            <Row className="g-3 mb-3">
                                <Col md={6}>
                                    <p className="mb-2"><strong>{t('tenant.whatsapp.settings.session_name')}:</strong> {session?.session_name ?? '-'}</p>
                                    <p className="mb-2">
                                        <strong>{t('tenant.whatsapp.settings.status')}:</strong>{' '}
                                        <Badge bg="light" text="dark" className="text-capitalize">{session?.connection_status ?? '-'}</Badge>
                                    </p>
                                    <p className="mb-2"><strong>{t('tenant.whatsapp.settings.connected_jid')}:</strong> {session?.connected_jid ?? '-'}</p>
                                    {lifecycleLabelKey && (
                                        <p className="mb-0">
                                            <strong>{t('tenant.whatsapp.settings.lifecycle_label')}:</strong>{' '}
                                            <Badge bg="secondary">{lifecycleLabel}</Badge>
                                        </p>
                                    )}
                                </Col>
                                <Col md={6}>
                                    <h6 className="mb-2">{t('tenant.whatsapp.settings.qr_title')}</h6>
                                    {!isWaitingForQr && (
                                        <Alert variant="light" className="mb-2">
                                            {t('tenant.whatsapp.settings.qr_info')}
                                        </Alert>
                                    )}
                                    {lifecycleState === 'qr_timeout' && (
                                        <Alert variant="warning" className="mb-2">
                                            {t('tenant.whatsapp.settings.qr_expired')}
                                        </Alert>
                                    )}
                                    {qrDataUrl ? (
                                        <div className="text-center border rounded p-2 bg-light-subtle">
                                            <img src={qrDataUrl} alt="WhatsApp QR" style={{ maxWidth: 220, width: '100%', height: 'auto' }} />
                                        </div>
                                    ) : isWaitingForQr ? (
                                        <div className="text-center border rounded p-3 bg-light-subtle">
                                            <Spinner animation="border" size="sm" className="mb-2" />
                                            <p className="text-muted mb-0">{t('tenant.whatsapp.settings.qr_loading')}</p>
                                        </div>
                                    ) : (
                                        <p className="text-muted mb-0">{t('tenant.whatsapp.settings.qr_empty')}</p>
                                    )}
                                </Col>
                            </Row>
                            <div className="d-flex gap-2">
                                <Button
                                    onClick={connect}
                                    disabled={loading || session?.connection_status === 'connected' || session?.connection_status === 'connecting'}
                                >
                                    {t('tenant.whatsapp.settings.connect')}
                                </Button>
                                <Button
                                    variant="light"
                                    onClick={disconnect}
                                    disabled={loading || (session?.connection_status !== 'connected' && session?.connection_status !== 'connecting')}
                                >
                                    {t('tenant.whatsapp.settings.disconnect')}
                                </Button>
                                <Button variant="danger" onClick={() => setShowRemoveConfirm(true)} disabled={loading}>
                                    {t('tenant.whatsapp.settings.remove_session')}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="h-100">
                        <Card.Body>
                            <h5 className="card-title mb-3">{t('tenant.whatsapp.settings.command_guide_title')}</h5>
                            <p className="text-muted mb-2">{t('tenant.whatsapp.settings.command_guide_intro')}</p>
                            <p className="mb-2">
                                <strong>{t('tenant.whatsapp.settings.command_guide_prefix_label')}:</strong>{' '}
                                <code>{t('tenant.whatsapp.settings.command_guide_prefix_value')}</code>
                            </p>
                            <div className="border rounded p-2 bg-light-subtle mb-2">
                                <p className="mb-1"><code>/ping</code>, <code>!ping</code></p>
                                <small className="text-muted">{t('tenant.whatsapp.settings.command_ping_desc')}</small>
                            </div>
                            <div className="border rounded p-2 bg-light-subtle">
                                <p className="mb-1"><code>/help</code>, <code>!help</code></p>
                                <small className="text-muted">{t('tenant.whatsapp.settings.command_help_desc')}</small>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={showRemoveConfirm} onHide={() => setShowRemoveConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('tenant.whatsapp.settings.remove_confirm_title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{t('tenant.whatsapp.settings.remove_confirm_body')}</Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowRemoveConfirm(false)} disabled={loading}>
                        {t('tenant.whatsapp.settings.remove_confirm_cancel')}
                    </Button>
                    <Button variant="danger" onClick={removeSession} disabled={loading}>
                        {t('tenant.whatsapp.settings.remove_confirm_submit')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

WhatsAppSettingsPage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default WhatsAppSettingsPage;
