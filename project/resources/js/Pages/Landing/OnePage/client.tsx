import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const clientNames = ['Amazon', 'Walmart', 'Lenovo', 'PayPal', 'Shopify', 'Verizon'];

const Client = () => {
    return (
        <React.Fragment>
            <div className="pt-5 mt-5">
                <Container>
                    <Row>
                        <Col lg={12}>

                            <div className="text-center mt-5">
                                <h5 className="fs-20">Trusted <span className="text-primary text-decoration-underline">by</span> the world's best</h5>
                                <Swiper
                                    slidesPerView={4}
                                    spaceBetween={30}
                                    // pagination={{
                                    //     clickable: true,
                                    // }}
                                    pagination={false}
                                    breakpoints={{
                                        576: {
                                            slidesPerView: 2,
                                        },
                                        768: {
                                            slidesPerView: 3,
                                        },
                                        1024: {
                                            slidesPerView: 4,
                                        },
                                    }}
                                    loop={true}
                                    autoplay={{ delay: 1000, disableOnInteraction: false }}
                                    modules={[Pagination, Autoplay]}
                                    className="mySwiper swiper trusted-client-slider mt-sm-5 mt-4 mb-sm-5 mb-4"
                                >
                                    {clientNames.map((client) => (
                                        <SwiperSlide key={client}>
                                            <div className="client-images d-flex align-items-center justify-content-center rounded border bg-light-subtle px-4 py-3">
                                                <span className="fw-semibold fs-18 text-uppercase text-muted">{client}</span>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>

                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default Client;
