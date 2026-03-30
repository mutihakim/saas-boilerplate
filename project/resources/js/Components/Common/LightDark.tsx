import { useTranslation } from 'react-i18next';

interface LightDarkProps {
    layoutMode: string;
    onChangeLayoutMode: (mode: 'light' | 'dark') => void;
}

const LightDark = ({ layoutMode, onChangeLayoutMode }: LightDarkProps) => {
    const { t } = useTranslation();
    const nextMode = layoutMode === 'dark' ? 'light' : 'dark';
    const icon = layoutMode === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
    const label = layoutMode === 'dark'
        ? t('layout.shell.topbar.switch_light_mode')
        : t('layout.shell.topbar.switch_dark_mode');

    return (
        <div className="d-flex">
            <button
                onClick={() => onChangeLayoutMode(nextMode)}
                type="button"
                className="btn btn-icon btn-topbar rounded-circle light-dark-mode"
                aria-label={label}
                title={label}
            >
                <i className={`${icon} fs-5`}></i>
            </button>
        </div>
    );
};

export default LightDark;
