import React, { useEffect, useMemo, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import languages from '../../common/languages';
import i18n from '../../i18n';

function resolveLanguage() {
    const storedLanguage = localStorage.getItem('I18N_LANGUAGE') ?? 'en';
    const currentLanguage = storedLanguage === 'id' ? 'id' : 'en';

    if (storedLanguage !== currentLanguage) {
        localStorage.setItem('I18N_LANGUAGE', currentLanguage);
    }

    return currentLanguage;
}

const LanguageDropdown = () => {
    const { t } = useTranslation();
    const [selectedLang, setSelectedLang] = useState<string>(() => resolveLanguage());

    useEffect(() => {
        i18n.changeLanguage(selectedLang);
        localStorage.setItem('I18N_LANGUAGE', selectedLang);
    }, [selectedLang]);

    const changeLanguageAction = (lang: string) => {
        setSelectedLang(lang);
    };

    const activeLanguage = useMemo(
        () => languages[selectedLang as keyof typeof languages] ?? languages.en,
        [selectedLang]
    );

    return (
        <Dropdown align="end" className="topbar-head-dropdown">
            <Dropdown.Toggle className="btn btn-icon btn-topbar rounded-circle arrow-none" as="button">
                <span className="visually-hidden">{t('layout.shell.topbar.change_language')}</span>
                <img src={activeLanguage.flag} alt={t(`layout.languages.${selectedLang}`)} height="20" className="rounded" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="py-2">
                {Object.entries(languages).map(([key, language]) => (
                    <Dropdown.Item
                        key={key}
                        onClick={() => changeLanguageAction(key)}
                        active={selectedLang === key}
                        className="d-flex align-items-center gap-2"
                    >
                        <img src={language.flag} alt={t(`layout.languages.${key}`)} className="rounded" height="18" />
                        <span className="align-middle">{t(`layout.languages.${key}`)}</span>
                    </Dropdown.Item>
                ))}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default LanguageDropdown;
