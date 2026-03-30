import { Link } from '@inertiajs/react';
import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';

// Import Images
import logolight from "../../../../images/appsah-logo-light.png";


const Footer = () => {
    return (
        <React.Fragment>
            <footer className="custom-footer bg-dark py-5 position-relative">
                <Container>
                    <Row>
                        <Col lg={4} className="mt-4">
                            <div>
                                <div>
                                    <img src={logolight} alt="logo light" height="17" />
                                </div>
                                <div className="mt-4 fs-13">
                                    <p>Production-ready SaaS starter kit</p>
                                    <p className="ff-secondary">appsah helps product teams ship multi-tenant SaaS modules with a clean shell, predictable workflow, and an isolated compat path for future page ports.</p>
                                </div>
                            </div>
                        </Col>

                        <Col lg={7} className="ms-lg-auto">
                            <Row>
                                <Col sm={4} className="mt-4">
                                    <h5 className="text-white mb-0">Product</h5>
                                    <div className="text-muted mt-3">
                                        <ul className="list-unstyled ff-secondary footer-list">
                                            <li><Link href="/landing#features">Features</Link></li>
                                            <li><Link href="/landing#plans">Plans</Link></li>
                                            <li><Link href="/landing#reviews">Customer Stories</Link></li>
                                            <li><Link href="/landing#team">Team</Link></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col sm={4} className="mt-4">
                                    <h5 className="text-white mb-0">Explore</h5>
                                    <div className="text-muted mt-3">
                                        <ul className="list-unstyled ff-secondary footer-list">
                                            <li><Link href="/register">Create Account</Link></li>
                                            <li><Link href="/login">Sign In</Link></li>
                                            <li><Link href="/health">Health Check</Link></li>
                                            <li><Link href="/sitemap.xml">Sitemap</Link></li>
                                        </ul>
                                    </div>
                                </Col>
                                <Col sm={4} className="mt-4">
                                    <h5 className="text-white mb-0">Support</h5>
                                    <div className="text-muted mt-3">
                                        <ul className="list-unstyled ff-secondary footer-list">
                                            <li><Link href="/landing#contact">FAQ</Link></li>
                                            <li><Link href="/landing#contact">Contact</Link></li>
                                            <li><a href="mailto:hello@appsah.com">hello@appsah.com</a></li>
                                        </ul>
                                    </div>
                                </Col>
                            </Row>
                        </Col>

                    </Row>

                    <Row className="text-center text-sm-start align-items-center mt-5">
                        <Col sm={6}>

                            <div>
                                <p className="copy-rights mb-0">
                                    {new Date().getFullYear()} (c) appsah
                                </p>
                            </div>
                        </Col>
                        <Col sm={6}>
                            <div className="text-sm-end mt-3 mt-sm-0">
                                <ul className="list-inline mb-0 footer-social-link">
                                    <li className="list-inline-item">
                                        <a href="https://github.com" className="avatar-xs d-block" target="_blank" rel="noreferrer">
                                            <div className="avatar-title rounded-circle">
                                                <i className="ri-window-line"></i>
                                            </div>
                                        </a>
                                    </li>
                                    <li className="list-inline-item">
                                        <a href="https://github.com" className="avatar-xs d-block" target="_blank" rel="noreferrer">
                                            <div className="avatar-title rounded-circle">
                                                <i className="ri-github-fill"></i>
                                            </div>
                                        </a>
                                    </li>
                                    <li className="list-inline-item">
                                        <a href="https://www.linkedin.com" className="avatar-xs d-block" target="_blank" rel="noreferrer">
                                            <div className="avatar-title rounded-circle">
                                                <i className="ri-linkedin-fill"></i>
                                            </div>
                                        </a>
                                    </li>
                                    <li className="list-inline-item">
                                        <a href="mailto:hello@appsah.com" className="avatar-xs d-block">
                                            <div className="avatar-title rounded-circle">
                                                <i className="ri-mail-send-line"></i>
                                            </div>
                                        </a>
                                    </li>
                                    <li className="list-inline-item">
                                        <Link href="/register" className="avatar-xs d-block">
                                            <div className="avatar-title rounded-circle">
                                                <i className="ri-rocket-line"></i>
                                            </div>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </React.Fragment >
    );
};

export default Footer;

