import { Head } from '@inertiajs/react';
import axios from 'axios';
import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Table } from 'react-bootstrap';
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
    entitlements: Record<string, boolean>;
};

type Props = {
    tenants: TenantItem[];
    plans: string[];
    moduleLabels: Record<string, string>;
    limitLabels: Record<string, string>;
    planLimits: Record<string, Record<string, number | null>>;
};

function TenantSubscriptions({ tenants, plans, moduleLabels, limitLabels, planLimits }: Props) {
    const { t } = useTranslation();
    const [rows, setRows] = useState<TenantItem[]>(tenants);
    const [saving, setSaving] = useState<number | null>(null);
    const planLabel: Record<string, string> = {
        free: 'Free',
        pro: 'Pro',
        business: 'Business',
        enterprise: 'Enterprise',
    };

    const moduleKeys = useMemo(() => Object.keys(moduleLabels), [moduleLabels]);

    async function updatePlan(row: TenantItem, plan: string) {
        setSaving(row.id);
        try {
            const response = await axios.patch(`/admin/tenants/${row.slug}/subscription`, {
                plan_code: plan,
            });

            const updated = response.data.data.tenant;
            setRows((prev) =>
                prev.map((item) =>
                    item.id === row.id
                        ? {
                              ...item,
                              plan_code: updated.plan_code,
                              entitlements: updated.entitlements,
                          }
                        : item
                )
            );

            notify.success(
                <div>
                    <div className="fw-semibold">{t('admin.notifications.subscription_updated_title')}</div>
                    <div className="small text-muted mt-1">
                        {t('admin.notifications.subscription_updated_detail', { tenant: row.name, plan: updated.plan_code })}
                    </div>
                </div>
            );
        } catch (err: any) {
            const parsed = parseApiError(err, t('admin.notifications.subscription_update_failed_title'));
            notify.error({
                title: parsed.title,
                detail: parsed.detail ?? t('admin.notifications.try_again'),
            });
        } finally {
            setSaving(null);
        }
    }

    return (
        <>
            <Head title="Tenant Subscriptions" />
            <CompatPageTitle
                title="Tenant Subscriptions"
                subtitle="Kontrol plan, entitlement, dan limit tenant tanpa keluar dari shell admin."
            />

            <Row className="g-3 mb-3">
                <Col md={4}>
                    <Card className="app-shell-stat-card h-100">
                        <Card.Body>
                            <div className="app-shell-kpi">
                                <div className="app-shell-kpi__meta">
                                    <span className="text-muted text-uppercase fw-semibold small">Managed tenants</span>
                                    <h3 className="app-shell-kpi__value mb-0">{rows.length}</h3>
                                </div>
                                <span className="avatar-sm">
                                    <span className="avatar-title rounded-circle bg-primary-subtle text-primary">
                                        <i className="ri-vip-crown-2-line fs-4"></i>
                                    </span>
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="app-shell-stat-card h-100">
                        <Card.Body>
                            <div className="app-shell-kpi">
                                <div className="app-shell-kpi__meta">
                                    <span className="text-muted text-uppercase fw-semibold small">Plans available</span>
                                    <h3 className="app-shell-kpi__value mb-0">{plans.length}</h3>
                                </div>
                                <span className="avatar-sm">
                                    <span className="avatar-title rounded-circle bg-info-subtle text-info">
                                        <i className="ri-stack-line fs-4"></i>
                                    </span>
                                </span>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <CompatPageSection
                title="Subscription Matrix"
                description="Edit plan tenant dan review entitlement utama dalam satu table operasional."
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
                                    <th>Entitlements</th>
                                    <th>Limits</th>
                                    <th className="text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id}>
                                        <td>
                                            <div className="fw-semibold">{row.name}</div>
                                            <small className="text-muted">{row.slug}</small>
                                        </td>
                                        <td className="text-capitalize">{row.status}</td>
                                        <td>{planLabel[row.plan_code] ?? row.plan_code}</td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-1">
                                                {moduleKeys.map((key) => (
                                                    <Badge key={key} bg={row.entitlements[key] ? 'success-subtle' : 'warning-subtle'} text={row.entitlements[key] ? 'success' : 'warning'}>
                                                        {moduleLabels[key]}: {row.entitlements[key] ? 'On' : 'Locked'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                {Object.entries(limitLabels).map(([key, label]) => (
                                                    <small key={key} className="text-muted">
                                                        {label}: <strong>{planLimits[row.plan_code]?.[key] ?? '-'}</strong>
                                                    </small>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="text-end">
                                            <Form.Select
                                                style={{ maxWidth: 180, marginLeft: 'auto' }}
                                                value={row.plan_code}
                                                onChange={(e) => updatePlan(row, e.target.value)}
                                                disabled={saving === row.id}
                                            >
                                                {plans.map((plan) => (
                                                    <option key={plan} value={plan}>
                                                        {planLabel[plan] ?? plan}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </td>
                                    </tr>
                                ))}
                                {!rows.length ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            No tenants found.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </Table>
                    </div>
                    <div className="mt-3 px-1">
                        <Button variant="light" onClick={() => window.history.back()}>
                            Back
                        </Button>
                    </div>
                    </Card.Body>
                </Card>
            </CompatPageSection>
        </>
    );
}

TenantSubscriptions.layout = (page: React.ReactNode) => <AppShellLayout>{page}</AppShellLayout>;

export default TenantSubscriptions;
