import { Head, Link, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import { Alert, Button, Card, Col, Form, Nav, Row, Tab } from 'react-bootstrap';

import profileBg from '../../../images/profile-bg.jpg';
import avatar1 from '../../../images/users/avatar-1.jpg';
import TenantLayout from '../../Layouts/TenantLayout';

export default function ProfilePage() {
    const { props } = usePage<any>();
    const user = props.auth.user;

    const profileForm = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        job_title: user.job_title ?? '',
        bio: user.bio ?? '',
        avatar_url: user.avatar_url ?? '',
        address_line: user.address_line ?? '',
        city: user.city ?? '',
        country: user.country ?? '',
        postal_code: user.postal_code ?? '',
    });

    const deleteForm = useForm({ password: '' });

    return (
        <>
            <Head title="Profile Settings" />
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 className="mb-sm-0">Account Settings</h4>
                <div className="page-title-right">
                    <ol className="breadcrumb m-0">
                        <li className="breadcrumb-item">
                            <span>Account</span>
                        </li>
                        <li className="breadcrumb-item active">Settings</li>
                    </ol>
                </div>
            </div>
            <div className="position-relative mx-n4 mt-n4">
                <div className="profile-wid-bg profile-setting-img">
                    <img src={profileBg} className="profile-wid-img" alt="" />
                </div>
            </div>
            <Row>
                <Col xxl={3}>
                    <Card className="mt-n5">
                        <Card.Body className="p-4">
                            <div className="text-center">
                                <div className="profile-user position-relative d-inline-block mx-auto mb-4">
                                    <img
                                        src={profileForm.data.avatar_url || avatar1}
                                        className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                                        alt="user-profile"
                                    />
                                </div>
                                <h5 className="fs-16 mb-1">{profileForm.data.name}</h5>
                                <p className="text-muted mb-0">{profileForm.data.job_title || 'Member'}</p>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card>
                        <Card.Body>
                                    <div className="d-grid">
                                <Link href={route('profile.edit')} className="btn btn-soft-primary">
                                    <i className="ri-eye-line me-1 align-bottom"></i> View Account
                                </Link>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col xxl={9}>
                    <Card className="mt-xxl-n5">
                        <Tab.Container defaultActiveKey="personal-details">
                            <Card.Header>
                                <Nav className="nav-tabs-custom rounded card-header-tabs border-bottom-0" role="tablist">
                                    <Nav.Item>
                                        <Nav.Link eventKey="personal-details">Personal Details</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="danger-zone">Danger Zone</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {props.status ? <Alert variant="success">{props.status}</Alert> : null}

                                <Tab.Content>
                                    <Tab.Pane eventKey="personal-details">
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                profileForm.patch(route('profile.update'));
                                            }}
                                        >
                                            <Row>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.name}
                                                            onChange={(e) => profileForm.setData('name', e.target.value)}
                                                            isInvalid={Boolean(profileForm.errors.name)}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{profileForm.errors.name}</Form.Control.Feedback>
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Email Address</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            value={profileForm.data.email}
                                                            onChange={(e) => profileForm.setData('email', e.target.value)}
                                                            isInvalid={Boolean(profileForm.errors.email)}
                                                        />
                                                        <Form.Control.Feedback type="invalid">{profileForm.errors.email}</Form.Control.Feedback>
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Phone Number</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.phone}
                                                            onChange={(e) => profileForm.setData('phone', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Designation</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.job_title}
                                                            onChange={(e) => profileForm.setData('job_title', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Avatar URL</Form.Label>
                                                        <Form.Control
                                                            type="url"
                                                            value={profileForm.data.avatar_url}
                                                            onChange={(e) => profileForm.setData('avatar_url', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">City</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.city}
                                                            onChange={(e) => profileForm.setData('city', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Country</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.country}
                                                            onChange={(e) => profileForm.setData('country', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Postal Code</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.postal_code}
                                                            onChange={(e) => profileForm.setData('postal_code', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Address</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={profileForm.data.address_line}
                                                            onChange={(e) => profileForm.setData('address_line', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">Bio</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            value={profileForm.data.bio}
                                                            onChange={(e) => profileForm.setData('bio', e.target.value)}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="hstack gap-2 justify-content-end">
                                                        <Button type="submit" className="btn btn-success" disabled={profileForm.processing}>
                                                            {profileForm.processing ? 'Saving...' : 'Update'}
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </Form>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="danger-zone">
                                        <h5 className="card-title text-decoration-underline mb-3">Delete This Account</h5>
                                        <p className="text-muted">Untuk keamanan, masukkan password saat ini sebelum menghapus akun.</p>
                                        <Form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                deleteForm.delete(route('profile.destroy'));
                                            }}
                                        >
                                            <div className="mb-3" style={{ maxWidth: '320px' }}>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Current password"
                                                    value={deleteForm.data.password}
                                                    onChange={(e) => deleteForm.setData('password', e.target.value)}
                                                    isInvalid={Boolean(deleteForm.errors.password)}
                                                />
                                                <Form.Control.Feedback type="invalid">{deleteForm.errors.password}</Form.Control.Feedback>
                                            </div>
                                            <div className="hstack gap-2 mt-3">
                                                <Button type="submit" variant="soft-danger" disabled={deleteForm.processing}>
                                                    {deleteForm.processing ? 'Deleting...' : 'Delete Account'}
                                                </Button>
                                            </div>
                                        </Form>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Card.Body>
                        </Tab.Container>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

ProfilePage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
