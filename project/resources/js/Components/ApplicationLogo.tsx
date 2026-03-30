import { usePage } from '@inertiajs/react';
import React from 'react';

import logoDark from '../../images/appsah-logo-dark.png';
import logoLight from '../../images/appsah-logo-light.png';
import logoSm from '../../images/appsah-logo-sm.png';
import { SharedPageProps } from '../types/page';

type Props = {
    compact?: boolean;
    dark?: boolean;
    className?: string;
};

export default function ApplicationLogo({ compact = false, dark = false, className = '' }: Props) {
    const { props } = usePage<SharedPageProps>();
    const branding = props.currentTenant?.branding;
    const tenantName = props.currentTenant?.presentable_name || props.currentTenant?.display_name || props.currentTenant?.name || 'appsah';
    const source = compact
        ? (branding?.logoIconUrl || branding?.logoDarkUrl || branding?.logoLightUrl || logoSm)
        : (dark ? (branding?.logoDarkUrl || branding?.logoLightUrl || logoDark) : (branding?.logoLightUrl || branding?.logoDarkUrl || logoLight));
    const height = compact ? 28 : 24;

    return <img src={source} alt={tenantName} height={height} className={className} />;
}
