import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Alert, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import maintenanceImage from '../../../images/maintenance.png';
import TenantLayout from '../../Layouts/TenantLayout';

export default function AccessRequired() {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('tenant.errors.access_required.page_title')} />
            <Container fluid className="px-0">
                <Row className="justify-content-center">
                    <Col xl={8} lg={10}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center p-4 p-sm-5">
                                <img
                                    src={maintenanceImage}
                                    alt={t('tenant.errors.access_required.page_title')}
                                    className="img-fluid mx-auto d-block"
                                    style={{ maxHeight: '220px' }}
                                />
                                <h1 className="h3 mt-4 mb-3">{t('tenant.errors.access_required.title')}</h1>
                                <Alert variant="warning" className="mb-3">
                                    {t('tenant.errors.access_required.message')}
                                </Alert>
                                <p className="text-muted mb-4">
                                    {t('tenant.errors.access_required.help')}
                                </p>
                                <div className="d-flex justify-content-center gap-2 flex-wrap">
                                    <Link as="button" method="post" href={route('logout')} className="btn btn-danger">
                                        {t('tenant.errors.access_required.logout')}
                                    </Link>
                                    <Button variant="light" onClick={() => window.history.back()}>
                                        {t('Back')}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
}

AccessRequired.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
