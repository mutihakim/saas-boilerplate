import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import TenantLayout from '../../../Layouts/TenantLayout';
import { SharedPageProps } from '../../../types/page';

import { TenantSettingsHeader, TenantSettingsStatus, TenantSettingsTabs, TenantSettingsTenant } from './shared';

type Option = {
    value: string;
    labelKey: string;
};

type Props = SharedPageProps & {
    tenant: TenantSettingsTenant;
    statusKey?: string | null;
    options: {
        locales: Option[];
        timezones: Option[];
        currencies: Option[];
        countries: Option[];
    };
};

function TenantSettingsLocalizationPage() {
    const { props } = usePage<Props>();
    const { t } = useTranslation();
    const tenant = props.tenant;
    const form = useForm({
        locale: tenant.locale ?? 'id',
        timezone: tenant.timezone ?? 'Asia/Jakarta',
        currency_code: tenant.currency_code ?? 'IDR',
        country_code: tenant.country_code ?? 'ID',
    });

    return (
        <>
            <Head title={t('tenant.settings.localization.page_title')} />
            <TenantSettingsHeader
                tenant={tenant}
                titleKey="tenant.settings.localization.title"
                subtitleKey="tenant.settings.localization.subtitle"
            />
            <TenantSettingsTabs tenant={tenant} active="localization" />
            <TenantSettingsStatus statusKey={props.statusKey} />

            <Card>
                <Card.Body>
                    <Form
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.patch(route('tenant.settings.localization.update', { tenant: tenant.slug }));
                        }}
                    >
                        <Row className="g-3">
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.localization.fields.locale')}</Form.Label>
                                    <Form.Select value={form.data.locale} onChange={(event) => form.setData('locale', event.target.value)}>
                                        {props.options.locales.map((option) => (
                                            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.localization.fields.timezone')}</Form.Label>
                                    <Form.Select value={form.data.timezone} onChange={(event) => form.setData('timezone', event.target.value)}>
                                        {props.options.timezones.map((option) => (
                                            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.localization.fields.currency_code')}</Form.Label>
                                    <Form.Select value={form.data.currency_code} onChange={(event) => form.setData('currency_code', event.target.value)}>
                                        {props.options.currencies.map((option) => (
                                            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col lg={6}>
                                <Form.Group>
                                    <Form.Label>{t('tenant.settings.localization.fields.country_code')}</Form.Label>
                                    <Form.Select value={form.data.country_code} onChange={(event) => form.setData('country_code', event.target.value)}>
                                        {props.options.countries.map((option) => (
                                            <option key={option.value} value={option.value}>{t(option.labelKey)}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="hstack gap-2 justify-content-end mt-4">
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? t('tenant.settings.actions.saving') : t('tenant.settings.localization.actions.save')}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </>
    );
}

TenantSettingsLocalizationPage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default TenantSettingsLocalizationPage;
