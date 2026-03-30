import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import SimpleBar from 'simplebar-react';

import { buildShellNavigation, ShellNavItem } from '../../common/shellNavigation';
import { SharedPageProps } from '../../types/page';

type SearchEntry = {
    key: string;
    labelKey: string;
    href: string;
    icon?: string;
    parentKey?: string;
};

function flattenItems(items: ShellNavItem[], parentKey?: string): SearchEntry[] {
    return items.flatMap((item) => {
        const current: SearchEntry[] = item.href
            ? [{ key: item.id, labelKey: item.labelKey, href: item.href, icon: item.icon, parentKey }]
            : [];

        if (!item.children?.length) {
            return current;
        }

        return current.concat(flattenItems(item.children, item.labelKey));
    });
}

export default function SearchOption() {
    const { props } = usePage<SharedPageProps>();
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const sections = useMemo(() => buildShellNavigation(props), [props]);
    const entries = useMemo(
        () => sections.flatMap((section) => flattenItems(section.items, section.titleKey)),
        [sections]
    );
    const translatedEntries = useMemo(() => (
        entries.map((entry) => ({
            ...entry,
            label: t(entry.labelKey),
            parent: entry.parentKey ? t(entry.parentKey) : '',
        }))
    ), [entries, t]);
    const filteredEntries = useMemo(() => {
        if (!searchTerm.trim()) {
            return [];
        }

        const normalized = searchTerm.toLowerCase();

        return translatedEntries.filter((entry) => {
            return entry.label.toLowerCase().includes(normalized)
                || entry.href.toLowerCase().includes(normalized)
                || entry.parent.toLowerCase().includes(normalized);
        });
    }, [searchTerm, translatedEntries]);

    useEffect(() => {
        const searchOptions = document.getElementById('search-close-options');
        const dropdown = document.getElementById('search-dropdown');
        const searchInput = document.getElementById('search-options') as HTMLInputElement | null;

        if (!searchOptions || !dropdown || !searchInput) {
            return undefined;
        }

        const handleSearchInput = () => {
            const inputLength = searchInput.value.length;

            if (inputLength > 0) {
                dropdown.classList.add('show');
                searchOptions.classList.remove('d-none');
            } else {
                dropdown.classList.remove('show');
                searchOptions.classList.add('d-none');
            }
        };

        const handleSearchClose = () => {
            searchInput.value = '';
            setSearchTerm('');
            dropdown.classList.remove('show');
            searchOptions.classList.add('d-none');
        };

        const handleBodyClick = (event: MouseEvent) => {
            if ((event.target as HTMLElement | null)?.id !== 'search-options') {
                dropdown.classList.remove('show');
                searchOptions.classList.add('d-none');
            }
        };

        searchInput.addEventListener('focus', handleSearchInput);
        searchInput.addEventListener('keyup', handleSearchInput);
        searchOptions.addEventListener('click', handleSearchClose);
        document.body.addEventListener('click', handleBodyClick);

        return () => {
            searchInput.removeEventListener('focus', handleSearchInput);
            searchInput.removeEventListener('keyup', handleSearchInput);
            searchOptions.removeEventListener('click', handleSearchClose);
            document.body.removeEventListener('click', handleBodyClick);
        };
    }, []);

    return (
        <form className="app-search d-none d-md-block">
            <div className="position-relative">
                <Form.Control
                    type="text"
                    className="form-control"
                    placeholder={t('layout.shell.search.placeholder')}
                    id="search-options"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                />
                <span className="mdi mdi-magnify search-widget-icon"></span>
                <span
                    className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                    id="search-close-options"
                ></span>
            </div>
            <div className="dropdown-menu dropdown-menu-lg" id="search-dropdown">
                <SimpleBar style={{ maxHeight: '320px' }}>
                    <div className="dropdown-header">
                        <h6 className="text-overflow text-muted mb-0 text-uppercase">{t('layout.shell.search.navigation_heading')}</h6>
                    </div>

                    {filteredEntries.length > 0 ? (
                        filteredEntries.map((entry) => (
                            <Link key={entry.key} href={entry.href} className="dropdown-item notify-item">
                                <i className={`${entry.icon ?? 'ri-links-line'} align-middle fs-xl text-muted me-2`}></i>
                                <span>{entry.parent ? `${entry.parent} / ${entry.label}` : entry.label}</span>
                            </Link>
                        ))
                    ) : (
                        <div className="dropdown-item text-muted py-3">
                            {searchTerm.trim() ? t('layout.shell.search.empty') : t('layout.shell.search.hint')}
                        </div>
                    )}
                </SimpleBar>
            </div>
        </form>
    );
}
