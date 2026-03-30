import { Head } from '@inertiajs/react';
import React from 'react';
import { Badge, Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import TenantLayout from '../../Layouts/TenantLayout';
import { CompatPageTitle } from '../../compat/velzon';

type Props = {
    stats: {
        members_count: number;
        invitations_count: number;
    };
    subscription?: {
        plan?: {
            code: string;
            limits: Record<string, number | null>;
        } | null;
        usage?: Record<string, { current: number; limit: number | null }>;
    };
};

function Dashboard({ stats, subscription }: Props) {
    const { t } = useTranslation();
    const planCode = subscription?.plan?.code ?? 'free';
    const usage = subscription?.usage ?? {};

    return (
        <>
            <Head title={t('tenant.dashboard.page_title')} />
            <CompatPageTitle
                title={t('tenant.dashboard.title')}
                subtitle={t('tenant.dashboard.subtitle')}
                actions={
                    <Badge bg="info-subtle" text="info" className="fs-6 text-uppercase">
                        {t('tenant.dashboard.plan_badge', { plan: planCode })}
                    </Badge>
                }
            />

            <Row className="g-3 mb-3">
                <Col xxl={3} md={6}>
                    <Card className="card-animate">
                        <Card.Body>
                            <p className="fw-medium text-muted mb-0">{t('tenant.dashboard.cards.members.title')}</p>
                            <h2 className="mt-3 ff-secondary fw-semibold">{stats.members_count}</h2>
                            <p className="mb-0 text-muted">{t('tenant.dashboard.cards.members.caption')}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={3} md={6}>
                    <Card className="card-animate">
                        <Card.Body>
                            <p className="fw-medium text-muted mb-0">{t('tenant.dashboard.cards.invitations.title')}</p>
                            <h2 className="mt-3 ff-secondary fw-semibold">{stats.invitations_count}</h2>
                            <p className="mb-0 text-muted">{t('tenant.dashboard.cards.invitations.caption')}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={3} md={6}>
                    <Card className="card-animate">
                        <Card.Body>
                            <p className="fw-medium text-muted mb-0">{t('tenant.dashboard.cards.occ.title')}</p>
                            <h2 className="mt-3 ff-secondary fw-semibold">{t('tenant.dashboard.cards.occ.value')}</h2>
                            <p className="mb-0 text-muted">{t('tenant.dashboard.cards.occ.caption')}</p>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={3} md={6}>
                    <Card className="card-animate">
                        <Card.Body>
                            <p className="fw-medium text-muted mb-0">{t('tenant.dashboard.cards.audit.title')}</p>
                            <h2 className="mt-3 ff-secondary fw-semibold">{t('tenant.dashboard.cards.audit.value')}</h2>
                            <p className="mb-0 text-muted">{t('tenant.dashboard.cards.audit.caption')}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3">
                <Col lg={12}>
                    <Card>
                        <Card.Header className="align-items-center d-flex">
                            <h4 className="card-title mb-0 flex-grow-1">{t('tenant.dashboard.roadmap.title')}</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-3">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{t('tenant.dashboard.roadmap.path_tenant')}</span>
                                    <Badge bg="success-subtle" text="success">
                                        {t('tenant.dashboard.status.active')}
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{t('tenant.dashboard.roadmap.api_contract')}</span>
                                    <Badge bg="success-subtle" text="success">
                                        {t('tenant.dashboard.status.active')}
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{t('tenant.dashboard.roadmap.domain_members')}</span>
                                    <Badge bg="success-subtle" text="success">
                                        {t('tenant.dashboard.status.active')}
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span>{t('tenant.dashboard.roadmap.next')}</span>
                                    <Badge bg="warning-subtle" text="warning">
                                        {t('tenant.dashboard.status.next')}
                                    </Badge>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={12}>
                    <Card>
                        <Card.Header className="align-items-center d-flex">
                            <h4 className="card-title mb-0 flex-grow-1">{t('tenant.dashboard.subscription_usage.title')}</h4>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex flex-column gap-3">
                                {Object.entries(usage).map(([key, value]) => (
                                    <div className="d-flex justify-content-between align-items-center" key={key}>
                                        <span>{key}</span>
                                        <Badge bg="light" text="dark">
                                            {value.current}/{value.limit ?? t('tenant.dashboard.subscription_usage.unlimited')}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

Dashboard.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default Dashboard;
