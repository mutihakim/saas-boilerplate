import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const Reviews = () => {
    return (
        <React.Fragment>
            <section className="section bg-primary" id="reviews">
                <div className="bg-overlay bg-overlay-pattern"></div>
                <Container>
                    <Row className="justify-content-center">
                        <Col lg={10}>
                            <div className="text-center">
                                <div>
                                    <i className="ri-double-quotes-l text-success display-3"></i>
                                </div>
                                <h4 className="text-white mb-5"><span className="text-success">19k</span>+ Satisfied clients</h4>

                                <Swiper modules={[Navigation, Pagination, Autoplay]} pagination={{ clickable: true }} navigation={true} loop={true} autoplay={{ delay: 2500, disableOnInteraction: false }} className="mySwiper swiper client-review-swiper rounded">
                                    <div className="swiper-wrapper">
                                        <SwiperSlide>
                                            <div className="row justify-content-center">
                                                <div className="col-10">
                                                    <div className="text-white-50">
                                                        <p className="fs-20 ff-secondary mb-4">" Kami bisa launching tenant baru jauh lebih cepat karena fondasi autentikasi, billing, dan workspace sudah rapi dari awal. "</p>

                                                        <div>
                                                            <h5 className="text-white">Raka Pratama</h5>
                                                            <p>- Founder, Opslane</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="row justify-content-center">
                                                <div className="col-10">
                                                    <div className="text-white-50">
                                                        <p className="fs-20 ff-secondary mb-4">" Tim kami tidak lagi merakit ulang dashboard setiap proyek. Boilerplate ini cukup modular untuk ditambah fitur tanpa mengganggu workflow yang sudah ada. "</p>

                                                        <div>
                                                            <h5 className="text-white">Nadia Lestari</h5>
                                                            <p>- Product Lead, Karyanet</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="row justify-content-center">
                                                <div className="col-10">
                                                    <div className="text-white-50">
                                                        <p className="fs-20 ff-secondary mb-4">" Dokumentasinya jelas, area tenant dan admin terpisah dengan baik, dan proses porting modul baru jadi lebih aman karena shell inti sudah bersih. "</p>

                                                        <div>
                                                            <h5 className="text-white">Faris Mahendra</h5>
                                                            <p>- Engineering Manager, Boxify</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    </div>
                                    <div className="swiper-button-next bg-white rounded-circle"></div>
                                    <div className="swiper-button-prev bg-white rounded-circle"></div>
                                    <div className="swiper-pagination position-relative mt-4"></div>
                                </Swiper>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </React.Fragment>
    );
};

export default Reviews;
