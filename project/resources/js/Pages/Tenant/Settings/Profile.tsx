import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import TenantLayout from '../../../Layouts/TenantLayout';
import { SharedPageProps } from '../../../types/page';

import { TenantSettingsHeader, TenantSettingsStatus, TenantSettingsTabs, TenantSettingsTenant } from './shared';

type Props = SharedPageProps & {
    tenant: TenantSettingsTenant;
    statusKey?: string | null;
};

function TenantSettingsProfilePage() {
    const { props } = usePage<Props>();
    const { t } = useTranslation();
    const tenant = props.tenant;
    const form = useForm({
        display_name: tenant.display_name ?? '',
        legal_name: tenant.legal_name ?? '',
        registration_number: tenant.registration_number ?? '',
        tax_id: tenant.tax_id ?? '',
        industry: tenant.industry ?? '',
        website_url: tenant.website_url ?? '',
        support_email: tenant.support_email ?? '',
        billing_email: tenant.billing_email ?? '',
        phone: tenant.phone ?? '',
        address_line_1: tenant.address_line_1 ?? '',
        address_line_2: tenant.address_line_2 ?? '',
        city: tenant.city ?? '',
        state_region: tenant.state_region ?? '',
        postal_code: tenant.postal_code ?? '',
        country_code: tenant.country_code ?? '',
    });

    return (
        <>
            <Head title={t('tenant.settings.profile.page_title')} />
            <TenantSettingsHeader
                tenant={tenant}
                titleKey="tenant.settings.profile.title"
                subtitleKey="tenant.settings.profile.subtitle"
            />
            <TenantSettingsTabs tenant={tenant} active="profile" />
            <TenantSettingsStatus statusKey={props.statusKey} />

            <Card>
                <Card.Body>
                    <Form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch(route('tenant.settings.profile.update', { tenant: tenant.slug }));
                        }}
                    >
                        <Row className="g-3">
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.display_name')}</Form.Label>
                                    <Form.Control
                                        value={form.data.display_name}
                                        onChange={(event) => form.setData('display_name', event.target.value)}
                                        isInvalid={Boolean(form.errors.display_name)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.display_name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.legal_name')}</Form.Label>
                                    <Form.Control
                                        value={form.data.legal_name}
                                        onChange={(event) => form.setData('legal_name', event.target.value)}
                                        isInvalid={Boolean(form.errors.legal_name)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.legal_name}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.industry')}</Form.Label>
                                    <Form.Control
                                        value={form.data.industry}
                                        onChange={(event) => form.setData('industry', event.target.value)}
                                        isInvalid={Boolean(form.errors.industry)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.industry}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.website_url')}</Form.Label>
                                    <Form.Control
                                        type="url"
                                        placeholder={t('tenant.settings.profile.placeholders.website_url')}
                                        value={form.data.website_url}
                                        onChange={(event) => form.setData('website_url', event.target.value)}
                                        isInvalid={Boolean(form.errors.website_url)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.website_url}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.support_email')}</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={form.data.support_email}
                                        onChange={(event) => form.setData('support_email', event.target.value)}
                                        isInvalid={Boolean(form.errors.support_email)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.support_email}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.billing_email')}</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={form.data.billing_email}
                                        onChange={(event) => form.setData('billing_email', event.target.value)}
                                        isInvalid={Boolean(form.errors.billing_email)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.billing_email}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.registration_number')}</Form.Label>
                                    <Form.Control
                                        value={form.data.registration_number}
                                        onChange={(event) => form.setData('registration_number', event.target.value)}
                                        isInvalid={Boolean(form.errors.registration_number)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.registration_number}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.tax_id')}</Form.Label>
                                    <Form.Control
                                        value={form.data.tax_id}
                                        onChange={(event) => form.setData('tax_id', event.target.value)}
                                        isInvalid={Boolean(form.errors.tax_id)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.tax_id}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.phone')}</Form.Label>
                                    <Form.Control
                                        value={form.data.phone}
                                        onChange={(event) => form.setData('phone', event.target.value)}
                                        isInvalid={Boolean(form.errors.phone)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.phone}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.country_code')}</Form.Label>
                                    <Form.Control
                                        value={form.data.country_code}
                                        onChange={(event) => form.setData('country_code', event.target.value.toUpperCase())}
                                        isInvalid={Boolean(form.errors.country_code)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.country_code}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={12}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.address_line_1')}</Form.Label>
                                    <Form.Control
                                        value={form.data.address_line_1}
                                        onChange={(event) => form.setData('address_line_1', event.target.value)}
                                        isInvalid={Boolean(form.errors.address_line_1)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.address_line_1}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={12}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.address_line_2')}</Form.Label>
                                    <Form.Control
                                        value={form.data.address_line_2}
                                        onChange={(event) => form.setData('address_line_2', event.target.value)}
                                        isInvalid={Boolean(form.errors.address_line_2)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.address_line_2}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.city')}</Form.Label>
                                    <Form.Control
                                        value={form.data.city}
                                        onChange={(event) => form.setData('city', event.target.value)}
                                        isInvalid={Boolean(form.errors.city)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.city}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.state_region')}</Form.Label>
                                    <Form.Control
                                        value={form.data.state_region}
                                        onChange={(event) => form.setData('state_region', event.target.value)}
                                        isInvalid={Boolean(form.errors.state_region)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.state_region}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col lg={4}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.profile.fields.postal_code')}</Form.Label>
                                    <Form.Control
                                        value={form.data.postal_code}
                                        onChange={(event) => form.setData('postal_code', event.target.value)}
                                        isInvalid={Boolean(form.errors.postal_code)}
                                    />
                                    <Form.Control.Feedback type="invalid">{form.errors.postal_code}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="hstack gap-2 justify-content-end mt-4">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? t('tenant.settings.actions.saving') : t('tenant.settings.profile.actions.save')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}

TenantSettingsProfilePage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default TenantSettingsProfilePage;
