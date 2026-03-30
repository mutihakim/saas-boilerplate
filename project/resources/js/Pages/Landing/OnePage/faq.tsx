import classnames from "classnames";
import React, { useState } from 'react';
import { Col, Container, Row, Collapse } from 'react-bootstrap';

const Faqs = () => {

    const [col1, setcol1] = useState<boolean>(true);
    const [col2, setcol2] = useState<boolean>(false);
    const [col3, setcol3] = useState<boolean>(false);
    const [col4, setcol4] = useState<boolean>(false);

    const [col9, setcol5] = useState<boolean>(false);
    const [col10, setcol6] = useState<boolean>(true);
    const [col11, setcol7] = useState<boolean>(false);
    const [col12, setcol8] = useState<boolean>(false);

    const t_col1 = () => {
        setcol1(!col1);
        setcol2(false);
        setcol3(false);
        setcol4(false);

    };

    const t_col2 = () => {
        setcol2(!col2);
        setcol1(false);
        setcol3(false);
        setcol4(false);

    };

    const t_col3 = () => {
        setcol3(!col3);
        setcol1(false);
        setcol2(false);
        setcol4(false);

    };

    const t_col4 = () => {
        setcol4(!col4);
        setcol1(false);
        setcol2(false);
        setcol3(false);
    };

    const t_col5 = () => {
        setcol5(!col9);
        setcol6(false);
        setcol7(false);
        setcol8(false);

    };

    const t_col6 = () => {
        setcol6(!col10);
        setcol7(false);
        setcol8(false);
        setcol5(false);

    };

    const t_col7 = () => {
        setcol7(!col11);
        setcol5(false);
        setcol6(false);
        setcol8(false);

    };

    const t_col8 = () => {
        setcol8(!col12);
        setcol5(false);
        setcol6(false);
        setcol7(false);
    };

    return (
        <React.Fragment>
            <section className="section">
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={8}>
                            <div className="text-center mb-5">
                                <h3 className="mb-3 fw-bold">Frequently Asked Questions</h3>
                                <p className="text-muted mb-4">Need more detail before adopting appsah for your product? These are the questions teams usually ask before they start porting modules.</p>

                                <div>
                                    <a href="mailto:hello@appsah.com" className="btn btn-primary btn-label rounded-pill me-1"><i className="ri-mail-line label-icon align-middle rounded-pill fs-16 me-2"></i> Email Us</a>
                                    <a href="/register" className="btn btn-info btn-label rounded-pill"><i className="ri-rocket-line label-icon align-middle rounded-pill fs-16 me-2"></i> Start Trial</a>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="g-lg-5 g-4">
                        <Col lg={6}>
                            <div className="d-flex align-items-center mb-2">
                                <div className="flex-shrink-0 me-1">
                                    <i className="ri-question-line fs-24 align-middle text-success me-1"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h5 className="mb-0 fw-bold">General Questions</h5>
                                </div>
                            </div>
                            <div className="accordion custom-accordionwithicon custom-accordion-border accordion-border-box"
                                id="genques-accordion">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="genques-headingOne">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col1 }
                                            )}
                                            type="button"
                                            onClick={t_col1}
                                            style={{ cursor: "pointer" }}
                                        >
                                            What makes appsah different from a raw admin template?
                                        </button>
                                    </h2>
                                    <Collapse in={col1} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            appsah is structured as a product-ready SaaS core. The shell, navigation, permissions, and subscription guards are already normalized so your team extends features instead of rebuilding fundamentals.
                                        </div>
                                    </Collapse>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="genques-headingTwo">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col2 }
                                            )}
                                            type="button"
                                            onClick={t_col2}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Can we still use pages from the reference library later?
                                        </button>
                                    </h2>
                                    <Collapse in={col2} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            Yes. New references should be ported through the compatibility boundary. That keeps the core shell clean while preserving a predictable path for future module imports.
                                        </div>
                                    </Collapse>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="genques-headingThree">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col3 }
                                            )}
                                            type="button"
                                            onClick={t_col3}
                                            style={{ cursor: "pointer" }}
                                        >
                                            How do you keep the core app clean over time?
                                        </button>
                                    </h2>
                                    <Collapse in={col3} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            The project now enforces route namespace policy, banned legacy imports, banned legacy packages, and a single navigation source through the cleanliness check and CI pipeline.
                                        </div>
                                    </Collapse>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="genques-headingFour">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col4 }
                                            )}
                                            type="button"
                                            onClick={t_col4}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Which parts of the app are considered active product surface?
                                        </button>
                                    </h2>
                                    <Collapse in={col4} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            Only `Auth`, `Tenant`, `Admin`, and `Landing` remain in the shipped page tree. Legacy demo namespaces and template-only shells have been removed from the active app surface.
                                        </div>
                                    </Collapse>
                                </div>
                            </div>
                        </Col>

                        <Col lg={6}>
                            <div className="d-flex align-items-center mb-2">
                                <div className="flex-shrink-0 me-1">
                                    <i className="ri-shield-keyhole-line fs-24 align-middle text-success me-1"></i>
                                </div>
                                <div className="flex-grow-1">
                                    <h5 className="mb-0 fw-bold">Privacy &amp; Security</h5>
                                </div>
                            </div>

                            <div className="accordion custom-accordionwithicon custom-accordion-border accordion-border-box"
                                id="privacy-accordion">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="privacy-headingOne">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col9 }
                                            )}
                                            type="button"
                                            onClick={t_col5}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Does the shell support dark mode and saved preferences?
                                        </button>
                                    </h2>
                                    <Collapse in={col9} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            Yes. The core shell persists a small preference contract for color mode, sidebar state, and content width, with backward-compatible mapping for any older stored layout keys.
                                        </div>
                                    </Collapse>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="privacy-headingTwo">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col10 }
                                            )}
                                            type="button"
                                            onClick={t_col6}
                                            style={{ cursor: "pointer" }}
                                        >
                                            How are tenant access and permissions enforced?
                                        </button>
                                    </h2>
                                    <Collapse in={col10} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            Tenant routes pass through tenant initialization, access checks, team permission context, and feature entitlement middleware before the page or API handler executes.
                                        </div>
                                    </Collapse>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="privacy-headingThree">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col11 }
                                            )}
                                            type="button"
                                            onClick={t_col7}
                                            style={{ cursor: "pointer" }}
                                        >
                                            What quality checks should we trust before merging a new module?
                                        </button>
                                    </h2>
                                    <Collapse in={col11} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            At minimum: cleanliness check, lint, typecheck, build, docs build, and backend tests. Workspace smoke tests are also available for environments that provide seeded credentials.
                                        </div>
                                    </Collapse>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="privacy-headingFour">
                                        <button
                                            className={classnames(
                                                "accordion-button",
                                                "fw-semibold fs-14",
                                                { collapsed: !col12 }
                                            )}
                                            type="button"
                                            onClick={t_col8}
                                            style={{ cursor: "pointer" }}
                                        >
                                            Can this boilerplate grow without another shell refactor?
                                        </button>
                                    </h2>
                                    <Collapse in={col12} className="accordion-collapse">
                                        <div className="accordion-body ff-secondary">
                                            That is the goal. The shell has been reduced to stable core concerns, while the compat layer isolates optional styling helpers for future reference imports.
                                        </div>
                                    </Collapse>
                                </div>
                            </div>

                            {/* <!--end accordion--> */}
                        </Col>
                    </Row>
                </Container>
            </section>
        </React.Fragment>
    );
};

export default Faqs;
