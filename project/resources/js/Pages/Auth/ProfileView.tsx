import { Head, Link, usePage } from '@inertiajs/react';
import React from 'react';
import { Badge, Card, Col, Row, Table } from 'react-bootstrap';

import profileBg from '../../../images/profile-bg.jpg';
import avatar1 from '../../../images/users/avatar-1.jpg';
import TenantLayout from '../../Layouts/TenantLayout';

type Membership = {
    id: number;
    tenant_name: string;
    tenant_slug: string;
    role_code: string;
};

export default function ProfileView() {
    const { props } = usePage<any>();
    const user = props.auth.user;
    const tenantMemberships: Membership[] = props.tenantMemberships ?? [];

    return (
        <>
            <Head title="Profile" />
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 className="mb-sm-0">Account Overview</h4>
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <span>Account</span>
                        </li>
                        <li className="breadcrumb-item active">Overview</li>
                    </ol>
                </div>
            </div>
            <div className="profile-foreground position-relative mx-n4 mt-n4">
                <div className="profile-wid-bg">
                    <img src={profileBg} alt="" className="profile-wid-img" />
                </div>
            </div>
            <div className="pt-4 mb-4 mb-lg-3 pb-lg-4">
                <Row className="g-4 align-items-center">
                    <div className="col-auto">
                        <div className="avatar-lg">
                            <img src={user.avatar_url || avatar1} alt="user" className="img-thumbnail rounded-circle" />
                        </div>
                    </div>
                    <Col>
                        <div className="p-2">
                            <h3 className="text-white mb-1">{user.name}</h3>
                            <p className="text-white text-opacity-75 mb-1">{user.job_title || 'Member'}</p>
                            <div className="hstack text-white-50 gap-2">
                                <span>{user.email}</span>
                                <span>{user.phone || '-'}</span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} className="col-lg-auto">
                        <Link href={route('profile.settings')} className="btn btn-success">
                            <i className="ri-edit-box-line align-bottom"></i> Edit Profile
                        </Link>
                        <Link href={route('profile.security')} className="btn btn-soft-primary ms-2">
                            <i className="ri-shield-keyhole-line align-bottom"></i> Security
                        </Link>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col xxl={3}>
                    <Card>
                        <Card.Body>
                            <h5 className="card-title mb-3">Info</h5>
                            <div className="table-responsive">
                                <Table className="table-borderless mb-0">
                                    <tbody>
                                        <tr>
                                            <th className="ps-0" scope="row">Full Name :</th>
                                            <td className="text-muted">{user.name}</td>
                                        </tr>
                                        <tr>
                                            <th className="ps-0" scope="row">Mobile :</th>
                                            <td className="text-muted">{user.phone || '-'}</td>
                                        </tr>
                                        <tr>
                                            <th className="ps-0" scope="row">E-mail :</th>
                                            <td className="text-muted">{user.email}</td>
                                        </tr>
                                        <tr>
                                            <th className="ps-0" scope="row">Location :</th>
                                            <td className="text-muted">{[user.city, user.country].filter(Boolean).join(', ') || '-'}</td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={9}>
                    <Card>
                        <Card.Body>
                            <h5 className="card-title mb-3">Tenant Memberships</h5>
                            {tenantMemberships.map((membership: Membership) => (
                                <div key={membership.id} className="d-flex justify-content-between align-items-center border rounded px-3 py-2 mb-2">
                                    <div>
                                        <h6 className="mb-0">{membership.tenant_name}</h6>
                                        <small className="text-muted">{membership.tenant_slug}</small>
                                    </div>
                                    <Badge bg="primary-subtle" text="primary" className="text-capitalize">
                                        {membership.role_code.replace('_', ' ')}
                                    </Badge>
                                </div>
                            ))}
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                            <h5 className="card-title mb-3">About</h5>
                            <p className="text-muted mb-0">{user.bio || 'No bio yet.'}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

ProfileView.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
