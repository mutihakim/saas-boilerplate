import { Head, usePage } from '@inertiajs/react';
import React from 'react';
import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import maintenanceImage from '../../../images/maintenance.png';
import TenantPageTitle from '../../Components/Common/TenantPageTitle';
import TenantLayout from '../../Layouts/TenantLayout';
import { useTenantRoute } from '../../common/tenantRoute';

function UpgradeRequired() {
    const { t } = useTranslation();
    const { props } = usePage<{ module_label?: string; plan_code?: string }>();
    const tenantRoute = useTenantRoute();
    const planCode = (props.plan_code ?? 'free').toLowerCase();
    const planLabelMap: Record<string, string> = {
        free: 'Free',
        pro: 'Pro',
        business: 'Business',
        enterprise: 'Enterprise',
    };
    const planLabel = planLabelMap[planCode] ?? planCode;

    return (
        <>
            <Head title={t('tenant.errors.upgrade.page_title')} />
            <TenantPageTitle title={t('tenant.errors.upgrade.page_title')} parentLabel={t('tenant.errors.upgrade.parent')} />
            <Row className="justify-content-center">
                <Col xxl={8} lg={10}>
                    <Card className="border-0 shadow-sm">
                        <Card.Body className="p-4 p-sm-5 text-center">
                            <img
                                src={maintenanceImage}
                                alt={t('tenant.errors.upgrade.page_title')}
                                className="img-fluid mx-auto d-block"
                                style={{ maxHeight: '220px' }}
                            />
                            <h3 className="mt-4">{t('tenant.errors.upgrade.title')}</h3>
                            <p className="text-muted mb-2">
                                {t('tenant.errors.upgrade.message', { module: props.module_label ?? t('tenant.errors.upgrade.page_title') })}
                            </p>
                            <p className="text-muted mb-3">
                                {t('tenant.errors.upgrade.plan_label')}{' '}
                                <Badge bg="soft-warning" text="warning" className="border border-warning-subtle">
                                    {planLabel}
                                </Badge>
                            </p>
                            <p className="text-muted mb-4">
                                {t('tenant.errors.upgrade.help')}
                            </p>
                            <div className="d-flex justify-content-center gap-2 flex-wrap">
                                <Button variant="light" onClick={() => window.history.back()}>
                                    {t('Back')}
                                </Button>
                                <Button href={tenantRoute.to('/dashboard')}>
                                    {t('tenant.errors.actions.back_to_dashboard')}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

UpgradeRequired.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default UpgradeRequired;
