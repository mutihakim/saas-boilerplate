import React from 'react';

type SectionProps = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
};

export function CompatPageSection({ title, description, actions, children, className = '' }: SectionProps) {
    return (
        <section className={`card border-0 shadow-sm ${className}`.trim()}>
            <div className="card-body">
                {title || description || actions ? (
                    <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
                        <div>
                            {title ? <h4 className="mb-1">{title}</h4> : null}
                            {description ? <p className="text-muted mb-0">{description}</p> : null}
                        </div>
                        {actions ? <div>{actions}</div> : null}
                    </div>
                ) : null}
                {children}
            </div>
        </section>
    );
}

type TitleProps = {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    actions?: React.ReactNode;
};

export function CompatPageTitle({ title, subtitle, actions }: TitleProps) {
    return (
        <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <div>
                <h4 className="mb-sm-0">{title}</h4>
                {subtitle ? <p className="text-muted mb-0 mt-1">{subtitle}</p> : null}
            </div>
            {actions ? <div className="page-title-right d-flex flex-wrap gap-2">{actions}</div> : null}
        </div>
    );
}
