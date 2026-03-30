import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

import TenantLayout from '../../Layouts/TenantLayout';

type Tenant = {
    id: number;
    name: string;
    slug: string;
    role_code: string;
};

export default function Selector({ tenants }: { tenants: Tenant[] }) {
    return (
        <>
            <Head title="Select Tenant" />
            <Container fluid className="px-0">
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-between mb-3">
                    <h1 className="h4 mb-0">Pilih Tenant Aktif</h1>
                    <Link as="button" method="post" href={route('logout')} className="btn btn-outline-danger btn-sm">
                        Logout
                    </Link>
                </div>

                {tenants.length === 0 ? (
                    <Card>
                        <Card.Body>
                            <p className="mb-1 fw-semibold">Belum ada tenant aktif untuk akun ini.</p>
                            <p className="text-muted mb-3">
                                Hubungi owner tenant agar akun Anda ditambahkan sebagai member.
                            </p>
                            <Link as="button" method="post" href={route('logout')} className="btn btn-primary btn-sm">
                                Logout
                            </Link>
                        </Card.Body>
                    </Card>
                ) : (
                    <Row className="g-3">
                        {tenants.map((tenant) => (
                            <Col lg={4} md={6} key={tenant.id}>
                                <Card className="h-100">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start">
                                            <div>
                                                <h2 className="h6 mb-1">{tenant.name}</h2>
                                                <p className="text-muted mb-0">{tenant.slug}</p>
                                            </div>
                                            <span className="badge text-bg-light">{tenant.role_code}</span>
                                        </div>
                                        <Link className="btn btn-primary btn-sm mt-3" href={`/t/${tenant.slug}/dashboard`}>
                                            Buka Workspace
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
}

Selector.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
