import React from 'react';
import { Form, Offcanvas } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';

import img01 from '../../images/sidebar/img-1.jpg';
import img02 from '../../images/sidebar/img-2.jpg';
import img03 from '../../images/sidebar/img-3.jpg';
import img04 from '../../images/sidebar/img-4.jpg';
import { AppShellPreferences } from '../types/page';

type Props = {
    show: boolean;
    preferences: AppShellPreferences;
    onOpen: () => void;
    onClose: () => void;
    onChange: (patch: Partial<AppShellPreferences>) => void;
};

type Option = { id: string; label: string; value: string };

function CardRadio({
    name,
    option,
    checked,
    onSelect,
}: {
    name: string;
    option: Option;
    checked: boolean;
    onSelect: (value: string) => void;
}) {
    return (
        <div className="col-4">
            <div className="form-check card-radio">
                <input
                    className="form-check-input"
                    type="radio"
                    name={name}
                    id={option.id}
                    value={option.value}
                    checked={checked}
                    onChange={(event) => {
                        if (event.target.checked) {
                            onSelect(event.target.value);
                        }
                    }}
                />
                <Form.Check.Label className="form-check-label p-0 avatar-md w-100" htmlFor={option.id}>
                    <span className="d-flex gap-1 h-100">
                        <span className="flex-shrink-0">
                            <span className="bg-light d-flex h-100 flex-column gap-1 p-1">
                                <span className="d-block p-1 px-2 bg-primary-subtle rounded mb-2"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                                <span className="d-block p-1 px-2 pb-0 bg-primary-subtle"></span>
                            </span>
                        </span>
                        <span className="flex-grow-1">
                            <span className="d-flex h-100 flex-column">
                                <span className="bg-light d-block p-1"></span>
                                <span className="bg-light d-block p-1 mt-auto"></span>
                            </span>
                        </span>
                    </span>
                </Form.Check.Label>
            </div>
            <h5 className="fs-13 text-center mt-2">{option.label}</h5>
        </div>
    );
}

function ColorDot({
    id,
    value,
    checked,
    className,
    onSelect,
}: {
    id: string;
    value: AppShellPreferences['leftSidebarType'];
    checked: boolean;
    className: string;
    onSelect: (value: AppShellPreferences['leftSidebarType']) => void;
}) {
    return (
        <div className="form-check sidebar-setting card-radio">
            <input
                className="form-check-input"
                type="radio"
                name="data-sidebar"
                id={id}
                value={value}
                checked={checked}
                onChange={(event) => {
                    if (event.target.checked) {
                        onSelect(event.target.value as AppShellPreferences['leftSidebarType']);
                    }
                }}
            />
            <Form.Check.Label className="form-check-label p-0 avatar-xs rounded-circle" htmlFor={id}>
                <span className={`avatar-title rounded-circle ${className}`}></span>
            </Form.Check.Label>
        </div>
    );
}

export default function AppShellCustomizer({ show, preferences, onOpen, onClose, onChange }: Props) {
    const { t } = useTranslation();
    const isHorizontal = preferences.layoutType === 'horizontal';
    const isTwocolumn = preferences.layoutType === 'twocolumn';
    const isSemibox = preferences.layoutType === 'semibox';
    const showSidebarControls = !isHorizontal && (!isSemibox || preferences.sidebarVisibilitytype === 'show');
    const showSidebarView = preferences.layoutType === 'vertical';

    const layoutOptions: Option[] = [
        { id: 'layout-vertical', label: t('layout.shell.customizer.options.layout.vertical'), value: 'vertical' },
        { id: 'layout-horizontal', label: t('layout.shell.customizer.options.layout.horizontal'), value: 'horizontal' },
        { id: 'layout-twocolumn', label: t('layout.shell.customizer.options.layout.twocolumn'), value: 'twocolumn' },
        { id: 'layout-semibox', label: t('layout.shell.customizer.options.layout.semibox'), value: 'semibox' },
    ];
    const schemeOptions: Option[] = [
        { id: 'mode-light', label: t('layout.shell.customizer.options.common.light'), value: 'light' },
        { id: 'mode-dark', label: t('layout.shell.customizer.options.common.dark'), value: 'dark' },
    ];
    const sidebarVisibilityOptions: Option[] = [
        { id: 'sidebar-show', label: t('layout.shell.customizer.options.sidebar_visibility.show'), value: 'show' },
        { id: 'sidebar-hidden', label: t('layout.shell.customizer.options.sidebar_visibility.hidden'), value: 'hidden' },
    ];
    const widthOptions: Option[] = [
        { id: 'width-fluid', label: t('layout.shell.customizer.options.width.fluid'), value: 'fluid' },
        { id: 'width-boxed', label: t('layout.shell.customizer.options.width.boxed'), value: 'boxed' },
    ];
    const positionOptions: Option[] = [
        { id: 'position-fixed', label: t('layout.shell.customizer.options.position.fixed'), value: 'fixed' },
        { id: 'position-scrollable', label: t('layout.shell.customizer.options.position.scrollable'), value: 'scrollable' },
    ];
    const sidebarSizeOptions: Option[] = [
        { id: 'sidebar-lg', label: t('layout.shell.customizer.options.sidebar_size.lg'), value: 'lg' },
        { id: 'sidebar-md', label: t('layout.shell.customizer.options.sidebar_size.md'), value: 'md' },
        { id: 'sidebar-sm', label: t('layout.shell.customizer.options.sidebar_size.sm'), value: 'sm' },
        { id: 'sidebar-sm-hover', label: t('layout.shell.customizer.options.sidebar_size.sm-hover'), value: 'sm-hover' },
    ];
    const sidebarViewOptions: Option[] = [
        { id: 'view-default', label: t('layout.shell.customizer.options.sidebar_view.default'), value: 'default' },
        { id: 'view-detached', label: t('layout.shell.customizer.options.sidebar_view.detached'), value: 'detached' },
    ];
    const preloaderOptions: Option[] = [
        { id: 'preloader-enable', label: t('layout.shell.customizer.options.preloader.enable'), value: 'enable' },
        { id: 'preloader-disable', label: t('layout.shell.customizer.options.preloader.disable'), value: 'disable' },
    ];

    return (
        <>
            <div className="customizer-setting d-none d-md-block">
                <div onClick={onOpen} className="btn-info rounded-pill shadow-lg btn btn-icon btn-lg p-2 rounded-pill">
                    <i className="mdi mdi-spin mdi-cog-outline fs-22"></i>
                </div>
            </div>
            <Offcanvas show={show} onHide={onClose} placement="end" className="offcanvas-end border-0">
                <Offcanvas.Header className="d-flex align-items-center bg-primary bg-gradient p-3 offcanvas-header-dark" closeButton>
                    <span className="m-0 me-2 text-white">{t('layout.shell.customizer.title')}</span>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0">
                    <SimpleBar className="h-100">
                        <div className="p-4">
                            <h6 className="mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.layout')}</h6>
                            <p className="text-muted">{t('layout.shell.customizer.descriptions.layout')}</p>
                            <div className="row gy-3">
                                {layoutOptions.map((option) => (
                                    <CardRadio
                                        key={option.id}
                                        name="data-layout"
                                        option={option}
                                        checked={preferences.layoutType === option.value}
                                        onSelect={(value) => onChange({ layoutType: value as AppShellPreferences['layoutType'] })}
                                    />
                                ))}
                            </div>

                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.color_scheme')}</h6>
                            <p className="text-muted">{t('layout.shell.customizer.descriptions.color_scheme')}</p>
                            <div className="row gy-3">
                                {schemeOptions.map((option) => (
                                    <CardRadio
                                        key={option.id}
                                        name="data-bs-theme"
                                        option={option}
                                        checked={preferences.layoutModeType === option.value}
                                        onSelect={(value) => onChange({ layoutModeType: value as AppShellPreferences['layoutModeType'] })}
                                    />
                                ))}
                            </div>

                            {isSemibox ? (
                                <>
                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.sidebar_visibility')}</h6>
                                    <p className="text-muted">{t('layout.shell.customizer.descriptions.sidebar_visibility')}</p>
                                    <div className="btn-group radio" role="group">
                                        {sidebarVisibilityOptions.map((option) => (
                                            <React.Fragment key={option.id}>
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="data-sidebar-visibility"
                                                    id={option.id}
                                                    checked={preferences.sidebarVisibilitytype === option.value}
                                                    onChange={() => onChange({ sidebarVisibilitytype: option.value as AppShellPreferences['sidebarVisibilitytype'] })}
                                                />
                                                <label className="btn btn-light w-sm" htmlFor={option.id}>{option.label}</label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </>
                            ) : null}

                            {!isTwocolumn ? (
                                <>
                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.width')}</h6>
                                    <p className="text-muted">{t('layout.shell.customizer.descriptions.width')}</p>
                                    <div className="btn-group radio" role="group">
                                        {widthOptions.map((option) => (
                                            <React.Fragment key={option.id}>
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="data-layout-width"
                                                    id={option.id}
                                                    checked={preferences.layoutWidthType === option.value}
                                                    onChange={() => onChange({ layoutWidthType: option.value as AppShellPreferences['layoutWidthType'] })}
                                                />
                                                <label className="btn btn-light w-sm" htmlFor={option.id}>{option.label}</label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </>
                            ) : null}

                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.position')}</h6>
                            <p className="text-muted">{t('layout.shell.customizer.descriptions.position')}</p>
                            <div className="btn-group radio" role="group">
                                {positionOptions.map((option) => (
                                    <React.Fragment key={option.id}>
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="data-layout-position"
                                            id={option.id}
                                            checked={preferences.layoutPositionType === option.value}
                                            onChange={() => onChange({ layoutPositionType: option.value as AppShellPreferences['layoutPositionType'] })}
                                        />
                                        <label className="btn btn-light w-sm" htmlFor={option.id}>{option.label}</label>
                                    </React.Fragment>
                                ))}
                            </div>

                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.topbar_color')}</h6>
                            <p className="text-muted">{t('layout.shell.customizer.descriptions.topbar_color')}</p>
                            <div className="row gy-3">
                                {schemeOptions.map((option) => (
                                    <CardRadio
                                        key={option.id}
                                        name="data-topbar"
                                        option={option}
                                        checked={preferences.topbarThemeType === option.value}
                                        onSelect={(value) => onChange({ topbarThemeType: value as AppShellPreferences['topbarThemeType'] })}
                                    />
                                ))}
                            </div>

                            {showSidebarControls ? (
                                <>
                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.sidebar_size')}</h6>
                                    <p className="text-muted">{t('layout.shell.customizer.descriptions.sidebar_size')}</p>
                                    <div className="row gy-3">
                                        {sidebarSizeOptions.map((option) => (
                                            <CardRadio
                                                key={option.id}
                                                name="data-sidebar-size"
                                                option={option}
                                                checked={preferences.leftsidbarSizeType === option.value}
                                                onSelect={(value) => onChange({ leftsidbarSizeType: value as AppShellPreferences['leftsidbarSizeType'] })}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : null}

                            {showSidebarView ? (
                                <>
                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.sidebar_view')}</h6>
                                    <p className="text-muted">{t('layout.shell.customizer.descriptions.sidebar_view')}</p>
                                    <div className="btn-group radio" role="group">
                                        {sidebarViewOptions.map((option) => (
                                            <React.Fragment key={option.id}>
                                                <input
                                                    type="radio"
                                                    className="btn-check"
                                                    name="data-layout-style"
                                                    id={option.id}
                                                    checked={preferences.leftSidebarViewType === option.value}
                                                    onChange={() => onChange({ leftSidebarViewType: option.value as AppShellPreferences['leftSidebarViewType'] })}
                                                />
                                                <label className="btn btn-light w-sm" htmlFor={option.id}>{option.label}</label>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </>
                            ) : null}

                            {showSidebarControls ? (
                                <>
                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.sidebar_color')}</h6>
                                    <p className="text-muted">{t('layout.shell.customizer.descriptions.sidebar_color')}</p>
                                    <div className="d-flex flex-wrap gap-2">
                                        <ColorDot id="sidebar-color-light" value="light" checked={preferences.leftSidebarType === 'light'} className="bg-white border" onSelect={(value) => onChange({ leftSidebarType: value })} />
                                        <ColorDot id="sidebar-color-dark" value="dark" checked={preferences.leftSidebarType === 'dark'} className="bg-dark" onSelect={(value) => onChange({ leftSidebarType: value })} />
                                        <ColorDot id="sidebar-color-gradient" value="gradient" checked={preferences.leftSidebarType === 'gradient'} className="bg-vertical-gradient" onSelect={(value) => onChange({ leftSidebarType: value })} />
                                        <ColorDot id="sidebar-color-gradient-2" value="gradient-2" checked={preferences.leftSidebarType === 'gradient-2'} className="bg-vertical-gradient-2" onSelect={(value) => onChange({ leftSidebarType: value })} />
                                        <ColorDot id="sidebar-color-gradient-3" value="gradient-3" checked={preferences.leftSidebarType === 'gradient-3'} className="bg-vertical-gradient-3" onSelect={(value) => onChange({ leftSidebarType: value })} />
                                        <ColorDot id="sidebar-color-gradient-4" value="gradient-4" checked={preferences.leftSidebarType === 'gradient-4'} className="bg-vertical-gradient-4" onSelect={(value) => onChange({ leftSidebarType: value })} />
                                    </div>

                                    <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.sidebar_images')}</h6>
                                    <p className="text-muted">{t('layout.shell.customizer.descriptions.sidebar_images')}</p>
                                    <div className="d-flex gap-2 flex-wrap img-switch">
                                        {[
                                            { id: 'sidebarimg-none', value: 'none', image: null },
                                            { id: 'sidebarimg-01', value: 'img-1', image: img01 },
                                            { id: 'sidebarimg-02', value: 'img-2', image: img02 },
                                            { id: 'sidebarimg-03', value: 'img-3', image: img03 },
                                            { id: 'sidebarimg-04', value: 'img-4', image: img04 },
                                        ].map((option) => (
                                            <div className="form-check sidebar-setting card-radio" key={option.id}>
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="data-sidebar-image"
                                                    id={option.id}
                                                    checked={preferences.leftSidebarImageType === option.value}
                                                    onChange={() => onChange({ leftSidebarImageType: option.value as AppShellPreferences['leftSidebarImageType'] })}
                                                />
                                                <Form.Check.Label className="form-check-label p-0 avatar-sm h-auto" htmlFor={option.id}>
                                                    {option.image ? (
                                                        <img src={option.image} alt={t('layout.shell.customizer.options.sidebar_images.preview_alt')} className="avatar-md w-auto object-fit-cover" />
                                                    ) : (
                                                        <span className="avatar-md w-auto bg-light d-flex align-items-center justify-content-center">
                                                            <i className="ri-close-fill fs-20"></i>
                                                        </span>
                                                    )}
                                                </Form.Check.Label>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : null}

                            <h6 className="mt-4 mb-0 fw-semibold text-uppercase">{t('layout.shell.customizer.sections.preloader')}</h6>
                            <p className="text-muted">{t('layout.shell.customizer.descriptions.preloader')}</p>
                            <div className="btn-group radio" role="group">
                                {preloaderOptions.map((option) => (
                                    <React.Fragment key={option.id}>
                                        <input
                                            type="radio"
                                            className="btn-check"
                                            name="data-preloader"
                                            id={option.id}
                                            checked={preferences.preloader === option.value}
                                            onChange={() => onChange({ preloader: option.value as AppShellPreferences['preloader'] })}
                                        />
                                        <label className="btn btn-light w-sm" htmlFor={option.id}>{option.label}</label>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </SimpleBar>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}
