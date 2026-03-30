import React, { useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import ApplicationLogo from '../Components/ApplicationLogo';
import { useSelector } from "react-redux";
import { createSelector } from '@reduxjs/toolkit';

export default function Guest({ children }: any) {
    const selectLayoutState = (state : any) => state.Layout;
    const selectLayoutProperties = createSelector(
        selectLayoutState,
        (state:any) => ({
            layoutModeType: state.layoutModeType,
            backgroundImageType: state.backgroundImageType,
        })
    );
    // Inside your component
    const {
        layoutModeType, backgroundImageType
    }:any = useSelector(selectLayoutProperties);

    useEffect(() => {
        const landing = window.location.pathname.slice(1);
        const nftLanding = window.location.pathname.slice(1);

        if (layoutModeType === "dark") {
            document.body.setAttribute("data-bs-theme", "dark");
            document.documentElement.setAttribute("data-bs-theme", "dark");
            document.documentElement.setAttribute("data-body-image", backgroundImageType);

            if (landing === "landing") { document.documentElement.setAttribute("data-body-image", "none"); }
            if (nftLanding === "nft-landing") { document.documentElement.setAttribute("data-body-image", "none"); }

        } else {
            document.body.setAttribute("data-bs-theme", "light");
            document.documentElement.setAttribute("data-bs-theme", "light");
            document.documentElement.setAttribute("data-body-image", backgroundImageType);

            if (landing === "landing") { document.documentElement.setAttribute("data-body-image", "none"); }
            if (nftLanding === "nft-landing") { document.documentElement.setAttribute("data-body-image", "none"); }
        }
        return () => {
            document.body.removeAttribute("data-bs-theme");
            document.documentElement.removeAttribute("data-bs-theme");
            document.documentElement.removeAttribute("data-body-image");
        }
    }, [layoutModeType, backgroundImageType]);
    return (
        <React.Fragment>
            <div className="auth-page-wrapper">

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
