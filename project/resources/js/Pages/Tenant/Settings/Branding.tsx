import { Head, router, useForm, usePage } from '@inertiajs/react';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import TenantLayout from '../../../Layouts/TenantLayout';
import { SharedPageProps } from '../../../types/page';

import { TenantSettingsHeader, TenantSettingsStatus, TenantSettingsTabs, TenantSettingsTenant } from './shared';

type BrandingGuidance = Record<'logo_light' | 'logo_dark' | 'logo_icon' | 'favicon', string>;

type Props = SharedPageProps & {
    tenant: TenantSettingsTenant;
    brandingGuidance: BrandingGuidance;
    statusKey?: string | null;
};

type BrandingFileState = {
    logo_light: File | null;
    logo_dark: File | null;
    logo_icon: File | null;
    favicon: File | null;
};

function TenantSettingsBrandingPage() {
    const { props } = usePage<Props>();
    const { t } = useTranslation();
    const tenant = props.tenant;
    const form = useForm<BrandingFileState>({
        logo_light: null,
        logo_dark: null,
        logo_icon: null,
        favicon: null,
    });
    const [previews, setPreviews] = useState<Record<keyof BrandingFileState, string>>({
        logo_light: tenant.branding.logoLightUrl,
        logo_dark: tenant.branding.logoDarkUrl,
        logo_icon: tenant.branding.logoIconUrl,
        favicon: tenant.branding.faviconUrl,
    });

    useEffect(() => {
        return () => {
            Object.values(previews).forEach((value) => {
                if (value.startsWith('blob:')) {
                    URL.revokeObjectURL(value);
                }
            });
        };
    }, [previews]);

    const slots = useMemo(() => ([
        {
            key: 'logo_light' as const,
            titleKey: 'tenant.settings.branding.slots.logo_light.title',
            currentUrl: previews.logo_light,
            hint: props.brandingGuidance.logo_light,
            accept: '.png,.jpg,.jpeg,.webp,.svg',
            maxLabelKey: 'tenant.settings.branding.slots.logo_light.max',
        },
        {
            key: 'logo_dark' as const,
            titleKey: 'tenant.settings.branding.slots.logo_dark.title',
            currentUrl: previews.logo_dark,
            hint: props.brandingGuidance.logo_dark,
            accept: '.png,.jpg,.jpeg,.webp,.svg',
            maxLabelKey: 'tenant.settings.branding.slots.logo_dark.max',
        },
        {
            key: 'logo_icon' as const,
            titleKey: 'tenant.settings.branding.slots.logo_icon.title',
            currentUrl: previews.logo_icon,
            hint: props.brandingGuidance.logo_icon,
            accept: '.png,.jpg,.jpeg,.webp,.svg',
            maxLabelKey: 'tenant.settings.branding.slots.logo_icon.max',
        },
        {
            key: 'favicon' as const,
            titleKey: 'tenant.settings.branding.slots.favicon.title',
            currentUrl: previews.favicon,
            hint: props.brandingGuidance.favicon,
            accept: '.ico,.png,.svg',
            maxLabelKey: 'tenant.settings.branding.slots.favicon.max',
        },
    ]), [previews, props.brandingGuidance]);

    const handleSelect = (slot: keyof BrandingFileState, event: ChangeEvent<HTMLInputElement>) => {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        form.setData(slot, file);

        setPreviews((current) => {
            const next = { ...current };
            if (next[slot].startsWith('blob:')) {
                URL.revokeObjectURL(next[slot]);
            }
            next[slot] = file ? URL.createObjectURL(file) : current[slot];
            return next;
        });
    };

    return (
        <>
            <Head title={t('tenant.settings.branding.page_title')} />
            <TenantSettingsHeader
                tenant={tenant}
                titleKey="tenant.settings.branding.title"
                subtitleKey="tenant.settings.branding.subtitle"
            />
            <TenantSettingsTabs tenant={tenant} active="branding" />
            <TenantSettingsStatus statusKey={props.statusKey} />

            <Row className="g-3">
                <Col xl={7}>
                    <Card className="h-100">
                        <Card.Body>
                            <Form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.post(route('tenant.settings.branding.update', { tenant: tenant.slug }), {
                                        forceFormData: true,
                                    });
                                }}
                            >
                                <Row className="g-4">
                                    {slots.map((slot) => (
                                        <Col md={6} key={slot.key}>
                                            <div className="border rounded p-3 h-100">
                                                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                                                    <div>
                                                        <h5 className="mb-1">{t(slot.titleKey)}</h5>
                                                        <p className="text-muted mb-0">{t(slot.hint)}</p>
                                                    </div>
                                                    <span className="badge bg-light text-dark">{t(slot.maxLabelKey)}</span>
                                                </div>

                                                <div className="border rounded d-flex align-items-center justify-content-center p-4 bg-light-subtle mb-3" style={{ minHeight: '180px' }}>
                                                    <img src={slot.currentUrl} alt={t(slot.titleKey)} style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }} />
                                                </div>

                                                <Form.Group>
                                                    <Form.Label>{t('tenant.settings.branding.actions.upload_file')}</Form.Label>
                                                    <Form.Control
                                                        type="file"
                                                        accept={slot.accept}
                                                        onChange={(event) => handleSelect(slot.key, event as ChangeEvent<HTMLInputElement>)}
                                                        isInvalid={Boolean(form.errors[slot.key])}
                                                    />
                                                    <Form.Control.Feedback type="invalid">{form.errors[slot.key]}</Form.Control.Feedback>
                                                </Form.Group>

                                                <div className="hstack gap-2 mt-3">
                                                    <Button
                                                        variant="soft-danger"
                                                        type="button"
                                                        onClick={() => {
                                                            router.delete(route('tenant.settings.branding.remove', { tenant: tenant.slug, slot: slot.key }));
                                                        }}
                                                    >
                                                        {t('tenant.settings.branding.actions.reset')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>

                                <div className="hstack gap-2 justify-content-end mt-4">
                                    <Button type="submit" disabled={form.processing}>
                                        {form.processing ? t('tenant.settings.branding.actions.uploading') : t('tenant.settings.branding.actions.save')}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xl={5}>
                    <Card className="mb-3">
                        <Card.Header>
                            <h4 className="card-title mb-0">{t('tenant.settings.branding.preview.title')}</h4>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column gap-3">
                            <div className="rounded border overflow-hidden">
                                <div className="bg-white px-3 py-3 border-bottom d-flex align-items-center justify-content-between">
                                    <img src={previews.logo_dark} alt={t('tenant.settings.branding.preview.topbar_alt')} style={{ height: '24px', maxWidth: '180px', objectFit: 'contain' }} />
                                    <span className="badge bg-primary-subtle text-primary">{tenant.presentable_name}</span>
                                </div>
                                <div className="d-flex">
                                    <div className="bg-dark px-3 py-4 text-white" style={{ width: '112px' }}>
                                        <img src={previews.logo_light} alt={t('tenant.settings.branding.preview.sidebar_alt')} style={{ height: '24px', maxWidth: '100%', objectFit: 'contain' }} />
                                    </div>
                                    <div className="flex-grow-1 p-3 bg-light-subtle">
                                        <div className="rounded border bg-white p-3">
                                            <strong>{t('tenant.settings.branding.preview.workspace_shell')}</strong>
                                            <p className="text-muted mb-0 mt-2">{t('tenant.settings.branding.preview.expanded_sidebar')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded border overflow-hidden d-flex">
                                <div className="bg-dark px-3 py-4 d-flex align-items-start justify-content-center" style={{ width: '80px' }}>
                                    <img src={previews.logo_icon} alt={t('tenant.settings.branding.preview.compact_alt')} style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
                                </div>
                                <div className="flex-grow-1 p-3">
                                    <strong>{t('tenant.settings.branding.preview.compact_sidebar')}</strong>
                                    <p className="text-muted mb-0 mt-2">{t('tenant.settings.branding.preview.compact_sidebar_help')}</p>
                                </div>
                            </div>

                            <div className="rounded border p-3 d-flex align-items-center gap-3">
                                <img src={previews.favicon} alt={t('tenant.settings.branding.preview.favicon_alt')} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                <div>
                                    <strong>{t('tenant.settings.branding.preview.browser_tab')}</strong>
                                    <p className="text-muted mb-0">{t('tenant.settings.branding.preview.browser_tab_help')}</p>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Alert variant="info" className="mb-0">
                        {t('tenant.settings.branding.storage_notice')}
                    </Alert>
                </Col>
            </Row>
        </>
    );
}

TenantSettingsBrandingPage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default TenantSettingsBrandingPage;
