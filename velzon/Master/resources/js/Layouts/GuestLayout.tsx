import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import ApplicationLogo from '../Components/ApplicationLogo';
import { createSelector } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';


export default function Guest({ children }: any) {

    const selectLayoutState = (state:any) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (layout:any) => ({
            layoutThemeType: layout.layoutThemeType,
            layoutModeType: layout.layoutModeType,
        })
    );
    // Inside your component
    const {
        layoutModeType,
        layoutThemeType,
    } :any = useSelector(selectLayoutProperties);

    useEffect(() => {
        document.body.setAttribute("data-theme", layoutThemeType);

        if (layoutModeType === "dark") {
            document.body.setAttribute("data-bs-theme", "dark");
        } else {
            document.body.setAttribute("data-bs-theme", "light");
        }
        return () => {
            document.body.removeAttribute("data-bs-theme");
            document.body.removeAttribute("data-theme");
        };
    }, [layoutModeType, layoutThemeType]);

    return (
        <React.Fragment>
            <div className="auth-page-wrapper">
                <div className="auth-one-bg-position auth-one-bg" id="auth-particles22"
                >
                    <div className="bg-overlay"
                    >
                    </div>
                    <div className='shape'>
                        <ApplicationLogo />
                    </div>
                </div>

                {children}

                <footer className="footer">
                    <div className="container">
                        <Row>
                            <Col lg={12}>
                                <div className="text-center">
                                    <p className="mb-0 text-muted">&copy; {new Date().getFullYear()} Velzon. Crafted with <i className="mdi mdi-heart text-danger"></i> by Themesbrand</p>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </footer>
            </div>
        </React.Fragment>
    );
}
