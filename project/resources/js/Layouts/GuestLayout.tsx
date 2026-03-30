import React from 'react';
import { Col, Row } from 'react-bootstrap';

import ApplicationLogo from '../Components/ApplicationLogo';
export default function Guest({ children }: any) {
    return (
        <React.Fragment>
            <div className="auth-page-wrapper auth-clean-shell">
                <div className="auth-one-bg-position auth-one-bg auth-clean-shell__backdrop" id="auth-particles22">
                    <div className="bg-overlay"></div>
                    <div className='shape auth-clean-shell__brandmark'>
                        <ApplicationLogo />
                    </div>
                </div>

                {children}

                <footer className="footer">
                    <div className="container">
                        <Row>
                            <Col lg={12}>
                                <div className="text-center">
                                    <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} appsah. Built for modern SaaS teams.</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </footer>
            </div>
        </React.Fragment>
    );
}
