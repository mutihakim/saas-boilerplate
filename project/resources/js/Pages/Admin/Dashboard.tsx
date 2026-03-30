import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';

import AppShellLayout from '../../app-shell/AppShellLayout';
import { CompatPageSection, CompatPageTitle } from '../../compat/velzon';

type Props = {
    stats: {
        tenants_total: number;
        tenants_active: number;
        superadmins_total: number;
        plan_breakdown: Record<string, number>;
    };
};

function AdminDashboard({ stats }: Props) {
    const statCards = [
        {
            label: 'Total Tenants',
            value: stats.tenants_total,
            icon: 'ri-building-2-line',
            tone: 'primary',
        },
        {
            label: 'Active Tenants',
            value: stats.tenants_active,
            icon: 'ri-flashlight-line',
            tone: 'success',
        },
        {
            label: 'Superadmins',
            value: stats.superadmins_total,
            icon: 'ri-shield-star-line',
            tone: 'info',
        },
    ] as const;

    return (
        <>
            <Head title="Admin Dashboard" />
            <CompatPageTitle
                title="Admin Dashboard"
                subtitle="Control plane untuk memantau tenant, paket berlangganan, dan operasi platform."
                actions={
                    <div className="d-flex flex-wrap gap-2">
                        <Link href="/admin/tenants" className="btn btn-primary">
                            Manage Tenants
                        </Link>
                        <Link href="/admin/tenants/subscriptions" className="btn btn-soft-primary">
                            Manage Subscriptions
                        </Link>
                    </div>
                }
            />

            <Row className="g-3 mb-3">
                {statCards.map((item) => (
                    <Col md={4} key={item.label}>
                        <Card className="app-shell-stat-card h-100">
                            <Card.Body>
                                <div className="app-shell-kpi">
                                    <div className="app-shell-kpi__meta">
                                        <span className="text-muted text-uppercase fw-semibold small">{item.label}</span>
                                        <h3 className="app-shell-kpi__value mb-0">{item.value}</h3>
                                        <span className="text-muted small">Live control plane snapshot</span>
                                    </div>
                                    <div className={`avatar-sm flex-shrink-0`}>
                                        <span className={`avatar-title rounded-circle bg-${item.tone}-subtle text-${item.tone}`}>
                                            <i className={`${item.icon} fs-4`}></i>
                                        </span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row className="g-3">
                <Col xl={8}>
                    <Card className="app-shell-summary-card h-100">
                        <Card.Body className="app-shell-summary-card__gradient p-4 p-lg-5 text-white">
                            <Badge bg="light" text="dark" className="mb-3">
                                Platform Health
                            </Badge>
                            <h3 className="text-white mb-2">Admin shell kembali fokus ke operasi harian.</h3>
                            <p className="text-white-50 mb-4">
                                UI admin sekarang diposisikan sebagai control plane premium: tenant directory, subscription control,
                                dan quick actions tetap dekat tanpa membebani workspace tenant.
                            </p>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="rounded-3 bg-white bg-opacity-10 p-3">
                                        <div className="text-white-50 small text-uppercase fw-semibold mb-1">Tenant activation</div>
                                        <div className="fs-3 fw-semibold">
                                            {stats.tenants_total > 0
                                                ? Math.round((stats.tenants_active / stats.tenants_total) * 100)
                                                : 0}
                                            %
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="rounded-3 bg-white bg-opacity-10 p-3">
                                        <div className="text-white-50 small text-uppercase fw-semibold mb-1">Plan variants</div>
                                        <div className="fs-3 fw-semibold">{Object.keys(stats.plan_breakdown).length}</div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="rounded-3 bg-white bg-opacity-10 p-3">
                                        <div className="text-white-50 small text-uppercase fw-semibold mb-1">Admin operators</div>
                                        <div className="fs-3 fw-semibold">{stats.superadmins_total}</div>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xl={4}>
                    <CompatPageSection
                        title="Plan Breakdown"
                        description="Distribusi paket tenant aktif saat ini."
                        className="h-100"
                    >
                        <div className="d-flex flex-column gap-3">
                            {Object.entries(stats.plan_breakdown).map(([plan, total]) => (
                                <div key={plan} className="d-flex align-items-center justify-content-between rounded-3 border px-3 py-2">
                                    <div>
                                        <div className="fw-semibold text-capitalize">{plan}</div>
                                        <div className="small text-muted">Subscribed tenants</div>
                                    </div>
                                    <Badge bg="primary-subtle" text="primary" pill>
                                        {total}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CompatPageSection>
                </Col>
            </Row>
        </>
    );
}

AdminDashboard.layout = (page: React.ReactNode) => <AppShellLayout>{page}</AppShellLayout>;

export default AdminDashboard;
