import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Row, Table } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import AppShellLayout from '../../app-shell/AppShellLayout';
import { parseApiError } from '../../common/apiError';
import { notify } from '../../common/notify';
import { CompatPageSection, CompatPageTitle } from '../../compat/velzon';

type TenantItem = {
    id: number;
    name: string;
    slug: string;
    status: string;
    plan_code: string;
    owner: { id: number; name: string; email: string } | null;
    admin_candidate_user_id: number | null;
};

type Props = {
    tenants: TenantItem[];
};

function TenantsPage({ tenants }: Props) {
    const { t } = useTranslation();
    const [loadingTenantId, setLoadingTenantId] = useState<number | null>(null);
    const activeTenants = useMemo(() => tenants.filter((tenant) => tenant.status === 'active').length, [tenants]);

    async function impersonate(tenant: TenantItem) {
        const targetId = tenant.owner?.id ?? tenant.admin_candidate_user_id;
        if (!targetId) {
            notify.error({
                title: t('admin.notifications.impersonation_unavailable_title'),
                detail: t('admin.notifications.impersonation_unavailable_detail'),
            });
            return;
        }

        setLoadingTenantId(tenant.id);
        try {
            await axios.post(`/admin/impersonations/${targetId}`);
            window.location.href = `/t/${tenant.slug}/dashboard`;
        } catch (err: any) {
            const parsed = parseApiError(err, t('admin.notifications.impersonation_start_failed_title'));
            notify.error({
                title: parsed.title,
                detail: parsed.detail ?? t('admin.notifications.try_again'),
            });
        } finally {
            setLoadingTenantId(null);
        }
    }

    return (
        <>
            <Head title="Admin Tenants" />
            <CompatPageTitle
                title="Tenants"
                subtitle="Pantau tenant, owner, dan akses operasional dari satu dashboard admin."
                actions={
                    <Link href="/admin/tenants/subscriptions" className="btn btn-soft-primary">
                        Manage Subscriptions
                    </Link>
                }
            />

            <Row className="g-3 mb-3">
                <Col md={6} xl={3}>
                    <Card className="app-shell-stat-card h-100">
                        <Card.Body>
                            <div className="app-shell-kpi">
                                <div className="app-shell-kpi__meta">
                                    <span className="text-muted text-uppercase fw-semibold small">All tenants</span>
                                    <h3 className="app-shell-kpi__value mb-0">{tenants.length}</h3>
                                </div>
                                <span className="avatar-sm">
                                    <span className="avatar-title rounded-circle bg-primary-subtle text-primary">
                                        <i className="ri-building-line fs-4"></i>
                                    </span>
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} xl={3}>
                    <Card className="app-shell-stat-card h-100">
                        <Card.Body>
                            <div className="app-shell-kpi">
                                <div className="app-shell-kpi__meta">
                                    <span className="text-muted text-uppercase fw-semibold small">Active</span>
                                    <h3 className="app-shell-kpi__value mb-0">{activeTenants}</h3>
                                </div>
                                <span className="avatar-sm">
                                    <span className="avatar-title rounded-circle bg-success-subtle text-success">
                                        <i className="ri-pulse-line fs-4"></i>
                                    </span>
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <CompatPageSection
                title="Tenant Directory"
                description="Shell admin tetap premium, tapi data operasional tetap menjadi fokus utama."
                className="app-shell-table-card"
            >
                <Card className="border-0 shadow-none mb-0">
                    <Card.Body className="p-0">
                    <div className="table-responsive">
                        <Table className="align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Tenant</th>
                                    <th>Status</th>
                                    <th>Plan</th>
                                    <th>Owner</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tenants.map((tenant) => (
                                    <tr key={tenant.id}>
                                        <td>
                                            <div className="fw-semibold">{tenant.name}</div>
                                            <small className="text-muted">{tenant.slug}</small>
                                        </td>
                                        <td>
                                            <Badge bg={tenant.status === 'active' ? 'success-subtle' : 'warning-subtle'} text={tenant.status === 'active' ? 'success' : 'warning'} className="text-capitalize">
                                                {tenant.status}
                                            </Badge>
                                        </td>
                                        <td className="text-capitalize">{tenant.plan_code}</td>
                                        <td>
                                            {tenant.owner ? (
                                                <>
                                                    <div>{tenant.owner.name}</div>
                                                    <small className="text-muted">{tenant.owner.email}</small>
                                                </>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        <td className="text-end">
                                            <Link href={`/t/${tenant.slug}/dashboard`} className="btn btn-soft-primary btn-sm me-2">
                                                Open Read-only
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="soft-warning"
                                                className="me-2"
                                                disabled={loadingTenantId === tenant.id}
                                                onClick={() => impersonate(tenant)}
                                            >
                                                Impersonate Owner
                                            </Button>
                                            <Link href="/admin/tenants/subscriptions" className="btn btn-soft-info btn-sm">
                                                Manage Subscription
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    </Card.Body>
                </Card>
            </CompatPageSection>
        </>
    );
}

TenantsPage.layout = (page: React.ReactNode) => <AppShellLayout>{page}</AppShellLayout>;

export default TenantsPage;
