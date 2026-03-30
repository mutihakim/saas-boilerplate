import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import React, { FormEvent, useState } from "react";
import { Alert, Button, Card, Col, Form, Nav, Row, Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import profileBg from "../../../../images/profile-bg.jpg";
import avatar1 from "../../../../images/users/avatar-1.jpg";
import TenantPageTitle from "../../../Components/Common/TenantPageTitle";
import TenantLayout from "../../../Layouts/TenantLayout";
import { parseApiError } from "../../../common/apiError";
import { notify } from "../../../common/notify";
import { useTenantRoute } from "../../../common/tenantRoute";

type MemberUser = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    job_title: string | null;
    bio: string | null;
    avatar_url: string | null;
    address_line: string | null;
    city: string | null;
    country: string | null;
    postal_code: string | null;
} | null;

type Member = {
    id: number;
    full_name: string;
    role_code: string;
    profile_status: string;
    whatsapp_jid: string | null;
    row_version: number;
    user: MemberUser;
};

type Props = {
    member: Member;
    roleOptions: string[];
};

function humanizeCode(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

export default function EditMember({ member, roleOptions }: Props) {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const [form, setForm] = useState({
        full_name: member.full_name,
        role_code: member.role_code,
        profile_status: member.profile_status,
        whatsapp_jid: member.whatsapp_jid ?? "",
        row_version: member.row_version,
        name: member.user?.name ?? "",
        email: member.user?.email ?? "",
        phone: member.user?.phone ?? "",
        job_title: member.user?.job_title ?? "",
        bio: member.user?.bio ?? "",
        avatar_url: member.user?.avatar_url ?? "",
        address_line: member.user?.address_line ?? "",
        city: member.user?.city ?? "",
        country: member.user?.country ?? "",
        postal_code: member.user?.postal_code ?? "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const editableRoleOptions = roleOptions.filter((role) => {
        if (["owner", "tenant_owner"].includes(role)) {
            return member.role_code === role;
        }
        return true;
    });

    const apiUrl = `/api/v1${tenantRoute.to(`/members/${member.id}/profile`)}`.replace("/t/", "/tenants/");

    function roleLabel(roleCode: string) {
        return t(`tenant.members.roles.${roleCode}`, {
            defaultValue: humanizeCode(roleCode),
        });
    }

    function profileStatusLabel(status: string) {
        return t(`tenant.members.status.profile.${status}`, {
            defaultValue: humanizeCode(status),
        });
    }

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            const response = await axios.patch(apiUrl, form);
            const fresh = response.data.data.member;
            setForm((prev) => ({ ...prev, row_version: fresh.row_version }));
            notify.success(t("tenant.members.toast.profile_updated"));
        } catch (err: any) {
            const parsed = parseApiError(err, t("tenant.members.error.update_failed"));
            const message = parsed.detail ? `${parsed.title}. ${parsed.detail}` : parsed.title;
            setError(message);
            notify.error({
                title: parsed.title,
                detail: parsed.detail ?? t("tenant.members.error.try_again"),
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Head title={t("tenant.members.edit.page_title")} />
            <TenantPageTitle title={t("tenant.members.edit.title")} parentLabel={t("tenant.members.parent")} />
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
                                        src={member.user?.avatar_url || avatar1}
                                        className="rounded-circle avatar-xl img-thumbnail user-profile-image"
                                        alt="member-avatar"
                                    />
                                </div>
                                <h5 className="fs-16 mb-1">{form.full_name}</h5>
                                <p className="text-muted mb-0 text-capitalize">{roleLabel(form.role_code)}</p>
                            </div>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <div className="flex-grow-1">
                                    <h5 className="card-title mb-0">{t("tenant.members.edit.membership")}</h5>
                                </div>
                            </div>
                            <div className="mb-3">
                                <Form.Label className="form-label">{t("tenant.members.labels.role")}</Form.Label>
                                <Form.Select
                                    value={form.role_code}
                                    onChange={(e) => setForm((prev) => ({ ...prev, role_code: e.target.value }))}
                                >
                                    {editableRoleOptions.map((role) => (
                                        <option key={role} value={role}>
                                            {roleLabel(role)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </div>
                            <div>
                                <Form.Label className="form-label">{t("tenant.members.labels.status")}</Form.Label>
                                <Form.Select
                                    value={form.profile_status}
                                    onChange={(e) => setForm((prev) => ({ ...prev, profile_status: e.target.value }))}
                                >
                                    <option value="active">{profileStatusLabel("active")}</option>
                                    <option value="inactive">{profileStatusLabel("inactive")}</option>
                                </Form.Select>
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
                                        <Nav.Link eventKey="personal-details">{t("tenant.members.edit.personal_details")}</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {error ? <Alert variant="danger">{error}</Alert> : null}
                                {!member.user ? (
                                    <Alert variant="warning">{t("tenant.members.edit.member_not_linked")}</Alert>
                                ) : null}

                                <Tab.Content>
                                    <Tab.Pane eventKey="personal-details">
                                        <Form onSubmit={onSubmit}>
                                            <Row>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.full_name")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.full_name}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                                            required
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.display_name")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.name}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.whatsapp_jid")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder={t("tenant.members.edit.whatsapp_placeholder")}
                                                            value={form.whatsapp_jid}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, whatsapp_jid: e.target.value }))}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.phone_number")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.phone}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.email_address")}</Form.Label>
                                                        <Form.Control
                                                            type="email"
                                                            value={form.email}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.designation")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.job_title}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, job_title: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={6}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.avatar_url")}</Form.Label>
                                                        <Form.Control
                                                            type="url"
                                                            value={form.avatar_url}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.city")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.city}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.country")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.country}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={4}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.postal_code")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.postal_code}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, postal_code: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.address")}</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={form.address_line}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, address_line: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="mb-3">
                                                        <Form.Label className="form-label">{t("tenant.members.labels.bio")}</Form.Label>
                                                        <Form.Control
                                                            as="textarea"
                                                            rows={4}
                                                            value={form.bio}
                                                            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
                                                            disabled={!member.user}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col lg={12}>
                                                    <div className="hstack gap-2 justify-content-end">
                                                        <Link href={tenantRoute.to("/members")} className="btn btn-light">
                                                            {t("Back")}
                                                        </Link>
                                                        <Button type="submit" className="btn btn-success" disabled={saving}>
                                                            {saving ? t("tenant.members.actions.saving") : t("tenant.members.actions.update")}
                                                        </Button>
                                                    </div>
                                                </Col>
                                            </Row>
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

EditMember.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
