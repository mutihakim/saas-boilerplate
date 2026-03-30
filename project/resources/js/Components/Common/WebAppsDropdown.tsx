import { Link } from '@inertiajs/react';
import React, { useState } from 'react';
import { Button, Col, Dropdown, Row } from 'react-bootstrap';

const appLinks = [
    { label: 'GitHub', icon: 'ri-github-fill' },
    { label: 'Bitbucket', icon: 'ri-git-branch-line' },
    { label: 'Dribbble', icon: 'ri-dribbble-line' },
    { label: 'Dropbox', icon: 'ri-inbox-archive-line' },
    { label: 'Mailchimp', icon: 'ri-mail-send-line' },
    { label: 'Slack', icon: 'ri-slack-line' },
];

export default function WebAppsDropdown() {
    const [isWebAppDropdown, setIsWebAppDropdown] = useState(false);

    return (
        <Dropdown
            show={isWebAppDropdown}
            onToggle={(nextShow) => setIsWebAppDropdown(nextShow)}
            className="topbar-head-dropdown ms-1 header-item"
        >
            <Dropdown.Toggle as="button" type="button" className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle arrow-none">
                <i className="bx bx-category-alt fs-22"></i>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-lg p-0 dropdown-menu-end">
                <div className="p-3 border-top-0 border-start-0 border-end-0 border-dashed border">
                    <Row className="align-items-center">
                        <Col>
                            <h6 className="m-0 fw-semibold fs-15">Web Apps</h6>
                        </Col>
                        <div className="col-auto">
                            <Button variant="link" className="btn btn-sm btn-soft-info">
                                View All Apps <i className="ri-arrow-right-s-line align-middle"></i>
                            </Button>
                        </div>
                    </Row>
                </div>

                <div className="p-2">
                    <Row className="g-0">
                        {appLinks.map((app) => (
                            <Col key={app.label}>
                                <Link className="dropdown-icon-item" href="#">
                                    <i className={`${app.icon} fs-24 text-primary`}></i>
                                    <span>{app.label}</span>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </div>
            </Dropdown.Menu>
        </Dropdown>
    );
}
