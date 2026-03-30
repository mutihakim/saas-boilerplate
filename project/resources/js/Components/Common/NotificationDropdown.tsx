import React, { useState } from 'react';
import { Button, Col, Dropdown, Nav, Row, Tab } from 'react-bootstrap';
import SimpleBar from 'simplebar-react';

import bell from '../../../images/svg/bell.svg';
import avatar2 from '../../../images/users/avatar-2.jpg';
import avatar3 from '../../../images/users/avatar-3.jpg';
import avatar6 from '../../../images/users/avatar-6.jpg';
import avatar8 from '../../../images/users/avatar-8.jpg';

export default function NotificationDropdown() {
    const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);

    return (
        <Dropdown
            show={isNotificationDropdown}
            onToggle={(nextShow) => setIsNotificationDropdown(nextShow)}
            className="topbar-head-dropdown ms-1 header-item"
        >
            <Dropdown.Toggle type="button" as="button" className="arrow-none btn btn-icon btn-topbar btn-ghost-secondary rounded-circle">
                <i className="bx bx-bell fs-22"></i>
                <span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
                    3
                    <span className="visually-hidden">unread notifications</span>
                </span>
            </Dropdown.Toggle>
            <Dropdown.Menu className="dropdown-menu-lg dropdown-menu-end p-0">
                <div className="p-3 bg-primary bg-pattern rounded-top">
                    <Row className="align-items-center">
                        <Col>
                            <h6 className="m-0 fs-16 fw-semibold text-white">Notifications</h6>
                        </Col>
                        <div className="col-auto dropdown-tabs">
                            <span className="badge bg-light-subtle fs-13 text-body">4 New</span>
                        </div>
                    </Row>
                </div>

                <Tab.Container defaultActiveKey="all">
                    <div className="px-2 pt-2 bg-primary bg-pattern">
                        <Nav className="nav-tabs nav-tabs-custom" role="tablist">
                            <Nav.Item>
                                <Nav.Link eventKey="all">All (4)</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="messages">Messages</Nav.Link>
                            </Nav.Item>
                            <Nav.Item>
                                <Nav.Link eventKey="alerts">Alerts</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </div>

                    <Tab.Content>
                        <Tab.Pane id="all" eventKey="all" className="py-2 ps-2">
                            <SimpleBar style={{ maxHeight: '300px' }} className="pe-2">
                                <div className="text-reset notification-item d-block dropdown-item position-relative">
                                    <div className="d-flex">
                                        <div className="avatar-xs me-3 flex-shrink-0">
                                            <span className="avatar-title bg-info-subtle text-info rounded-circle fs-16">
                                                <i className="bx bx-badge-check"></i>
                                            </span>
                                        </div>
                                        <div className="flex-grow-1">
                                            <Button variant="link" href="#" className="stretched-link p-0">
                                                <h6 className="mt-0 mb-2 lh-base">
                                                    Your <b>workspace health</b> summary is ready for review.
                                                </h6>
                                            </Button>
                                            <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                <span><i className="mdi mdi-clock-outline"></i> Just 30 sec ago</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-reset notification-item d-block dropdown-item position-relative active">
                                    <div className="d-flex">
                                        <img src={avatar2} className="me-3 rounded-circle avatar-xs" alt="user-pic" />
                                        <div className="flex-grow-1">
                                            <Button variant="link" href="#" className="stretched-link p-0">
                                                <h6 className="mt-0 mb-1 fs-13 fw-semibold">Angela Bernier</h6>
                                            </Button>
                                            <div className="fs-13 text-muted">
                                                <p className="mb-1">Reviewed your billing automation checklist.</p>
                                            </div>
                                            <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                <span><i className="mdi mdi-clock-outline"></i> 48 min ago</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-reset notification-item d-block dropdown-item position-relative">
                                    <div className="d-flex">
                                        <div className="avatar-xs me-3 flex-shrink-0">
                                            <span className="avatar-title bg-danger-subtle text-danger rounded-circle fs-16">
                                                <i className="bx bx-message-square-dots"></i>
                                            </span>
                                        </div>
                                        <div className="flex-grow-1">
                                            <Button variant="link" href="#" className="stretched-link p-0">
                                                <h6 className="mt-0 mb-2 fs-13 lh-base">
                                                    You have received <b className="text-success">20</b> new tenant messages.
                                                </h6>
                                            </Button>
                                            <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                <span><i className="mdi mdi-clock-outline"></i> 2 hrs ago</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-reset notification-item d-block dropdown-item position-relative">
                                    <div className="d-flex">
                                        <img src={avatar8} className="me-3 rounded-circle avatar-xs" alt="user-pic" />
                                        <div className="flex-grow-1">
                                            <Button variant="link" href="#" className="stretched-link p-0">
                                                <h6 className="mt-0 mb-1 fs-13 fw-semibold">Maureen Gibson</h6>
                                            </Button>
                                            <div className="fs-13 text-muted">
                                                <p className="mb-1">Published a new admin rollout note.</p>
                                            </div>
                                            <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                <span><i className="mdi mdi-clock-outline"></i> 4 hrs ago</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="my-3 text-center">
                                    <button type="button" className="btn btn-soft-success waves-effect waves-light">
                                        View All Notifications <i className="ri-arrow-right-line align-middle"></i>
                                    </button>
                                </div>
                            </SimpleBar>
                        </Tab.Pane>

                        <Tab.Pane id="messages" eventKey="messages" className="py-2 ps-2">
                            <SimpleBar style={{ maxHeight: '300px' }} className="pe-2">
                                {[avatar3, avatar2, avatar6, avatar8].map((avatar, index) => (
                                    <div className="text-reset notification-item d-block dropdown-item" key={avatar + index}>
                                        <div className="d-flex">
                                            <img src={avatar} className="me-3 rounded-circle avatar-xs" alt="user-pic" />
                                            <div className="flex-grow-1">
                                                <Button variant="link" href="#" className="stretched-link p-0">
                                                    <h6 className="mt-0 mb-1 fs-13 fw-semibold">Team update</h6>
                                                </Button>
                                                <div className="fs-13 text-muted">
                                                    <p className="mb-1">A teammate mentioned you in the workspace notes.</p>
                                                </div>
                                                <p className="mb-0 fs-11 fw-medium text-uppercase text-muted">
                                                    <span><i className="mdi mdi-clock-outline"></i> 30 min ago</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="my-3 text-center">
                                    <button type="button" className="btn btn-soft-success waves-effect waves-light">
                                        View All Messages <i className="ri-arrow-right-line align-middle"></i>
                                    </button>
                                </div>
                            </SimpleBar>
                        </Tab.Pane>

                        <Tab.Pane id="alerts" eventKey="alerts" className="p-4">
                            <div className="w-25 w-sm-50 pt-3 mx-auto">
                                <img src={bell} className="img-fluid" alt="notification bell" />
                            </div>
                            <div className="text-center pb-5 mt-2">
                                <h6 className="fs-18 fw-semibold lh-base">Hey! You have no alerts right now.</h6>
                            </div>
                        </Tab.Pane>
                    </Tab.Content>
                </Tab.Container>
            </Dropdown.Menu>
        </Dropdown>
    );
}
