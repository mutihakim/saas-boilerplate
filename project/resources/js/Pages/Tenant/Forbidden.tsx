import { Head } from '@inertiajs/react';
import React from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import errorCover from '../../../images/error400-cover.png';
import TenantPageTitle from '../../Components/Common/TenantPageTitle';
import TenantLayout from '../../Layouts/TenantLayout';
import { useTenantRoute } from '../../common/tenantRoute';

type Props = {
    message?: string;
    messageKey?: string;
};

export default function Forbidden({ message, messageKey }: Props) {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const parentLabel = messageKey?.startsWith('tenant.settings.')
        ? 'layout.shell.nav.items.settings'
        : 'tenant.errors.forbidden.parent';
    const parentHref = messageKey?.startsWith('tenant.settings.')
        ? tenantRoute.to('/settings')
        : tenantRoute.to('/dashboard');

    return (
        <>
            <Head title={t('tenant.errors.forbidden.page_title')} />
            <TenantPageTitle
                title="tenant.errors.forbidden.page_title"
                parentLabel={parentLabel}
                parentHref={parentHref}
            />
            <Row className="justify-content-center">
                <Col xxl={7} lg={9}>
                    <Card className="overflow-hidden border-0 shadow-sm">
                        <Card.Body className="p-4 p-sm-5 text-center">
                            <img
                                src={errorCover}
                                alt={t('tenant.errors.forbidden.page_title')}
                                className="img-fluid mx-auto d-block"
                                style={{ maxHeight: '280px' }}
                            />
                            <h3 className="mt-4 text-uppercase">{t('tenant.errors.forbidden.title')}</h3>
                            <p className="text-muted mb-1">
                                {messageKey ? t(messageKey) : (message || t('tenant.errors.forbidden.message_default'))}
                            </p>
                            <p className="text-muted mb-4">
                                {t('tenant.errors.forbidden.help')}
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

Forbidden.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
