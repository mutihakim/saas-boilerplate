import { Head, Link } from "@inertiajs/react";
import axios from "axios";
import React, { FormEvent, useMemo, useState } from "react";
import { Button, Card, Col, Dropdown, Form, Modal, Offcanvas, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import profileBg from "../../../../images/profile-bg.jpg";
import avatar2 from "../../../../images/users/avatar-2.jpg";
import TenantPageTitle from "../../../Components/Common/TenantPageTitle";
import TenantLayout from "../../../Layouts/TenantLayout";
import { parseApiError } from "../../../common/apiError";
import { parseInvitationError } from "../../../common/invitationError";
import { notify } from "../../../common/notify";
import { useTenantRoute } from "../../../common/tenantRoute";

type TenantMember = {
    id: number;
    user_id: number | null;
    user_email?: string | null;
    full_name: string;
    role_code: string;
    profile_status: string;
    onboarding_status: "no_account" | "invitation_pending" | "account_active";
    account_status?: "no_account" | "unverified" | "verified";
    whatsapp_jid?: string | null;
    row_version: number;
};

type Props = {
    members: TenantMember[];
    roleOptions: string[];
};

const defaultQuickForm = {
    full_name: "",
    role_code: "admin",
    profile_status: "active",
};

const defaultInviteForm = {
    member_id: null as number | null,
    full_name: "",
    email: "",
    role_code: "member",
    note: "",
    expires_in_days: 7,
};

function avatarInitial(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function humanizeCode(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function MembersIndex({ members: initialMembers, roleOptions }: Props) {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const [members, setMembers] = useState<TenantMember[]>(initialMembers);
    const [query, setQuery] = useState("");
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [loading, setLoading] = useState(false);
    const quickAddRoleOptions = roleOptions.filter((role) => !["owner", "tenant_owner"].includes(role));
    const initialRole = quickAddRoleOptions.includes("admin") ? "admin" : (quickAddRoleOptions[0] ?? defaultQuickForm.role_code);
    const [quickForm, setQuickForm] = useState({ ...defaultQuickForm, role_code: initialRole });
    const [inviteForm, setInviteForm] = useState({ ...defaultInviteForm, role_code: initialRole });
    const [detail, setDetail] = useState<TenantMember | null>(null);
    const [isListView, setIsListView] = useState(false);

    const membersApi = `/api/v1${tenantRoute.to("/members")}`.replace("/t/", "/tenants/");
    const invitationsApi = `/api/v1${tenantRoute.to("/invitations")}`.replace("/t/", "/tenants/");

    const filteredMembers = useMemo(() => {
        if (!query) return members;
        const q = query.toLowerCase();
        return members.filter(
            (member) =>
                member.full_name.toLowerCase().includes(q) ||
                member.role_code.toLowerCase().includes(q) ||
                member.profile_status.toLowerCase().includes(q)
        );
    }, [members, query]);

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

    function onboardingStatusLabel(status: string) {
        return t(`tenant.members.status.onboarding.${status}`, {
            defaultValue: humanizeCode(status),
        });
    }

    function showApiErrorToast(err: any, fallbackTitle: string) {
        const parsed = parseApiError(err, fallbackTitle);
        notify.error({
            title: parsed.title,
            detail: parsed.detail ?? t("tenant.members.error.try_again"),
        });
    }

    async function refreshMembers() {
        const response = await axios.get(membersApi);
        setMembers(response.data.data.members);
    }

    async function onQuickAdd(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(membersApi, quickForm);
            notify.success(t("tenant.members.toast.add_success"));
            setQuickForm({ ...defaultQuickForm, role_code: initialRole });
            setShowQuickAdd(false);
            await refreshMembers();
        } catch (err: any) {
            showApiErrorToast(err, t("tenant.members.error.add_failed"));
        } finally {
            setLoading(false);
        }
    }

    function openInviteModal(member: TenantMember) {
        if (member.onboarding_status === "account_active") {
            notify.info(t("tenant.members.toast.already_active"));
            return;
        }

        setInviteForm({
            ...defaultInviteForm,
            member_id: member.id,
            full_name: member.full_name,
            email: member.user_email ?? "",
            role_code: member.role_code === "owner" ? initialRole : member.role_code,
        });

        setShowInvite(true);
    }

    async function onInvite(e: FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(invitationsApi, inviteForm);
            notify.success(t("tenant.members.toast.invite_success"));
            setShowInvite(false);
            setInviteForm({ ...defaultInviteForm, role_code: initialRole });
            await refreshMembers();
        } catch (err: any) {
            const parsed = parseInvitationError(err, t("tenant.members.error.invite_failed"));
            notify.error({
                title: parsed.title,
                detail: parsed.detail,
            });
        } finally {
            setLoading(false);
        }
    }

    async function onDelete(member: TenantMember) {
        setLoading(true);
        try {
            await axios.delete(`${membersApi}/${member.id}`, {
                data: { row_version: member.row_version },
            });
            notify.success(t("tenant.members.toast.remove_success"));
            await refreshMembers();
            if (detail?.id === member.id) {
                setDetail(null);
            }
        } catch (err: any) {
            showApiErrorToast(err, t("tenant.members.error.remove_failed"));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head title={t("tenant.members.page_title")} />
            <TenantPageTitle title={t("tenant.members.title")} parentLabel={t("tenant.members.parent")} />

            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Body>
                            <Row className="g-2">
                                <Col sm={4}>
                                    <div className="search-box">
                                        <Form.Control
                                            type="text"
                                            placeholder={t("tenant.members.search_placeholder")}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                        />
                                        <i className="ri-search-line search-icon"></i>
                                    </div>
                                </Col>
                                <Col className="col-sm-auto ms-auto">
                                    <div className="list-grid-nav hstack gap-1">
                                        <Button
                                            variant="soft-info"
                                            className={`btn btn-icon fs-14 ${!isListView ? "active" : ""}`}
                                            onClick={() => setIsListView(false)}
                                            title={t("tenant.members.view_mode.grid")}
                                        >
                                            <i className="ri-grid-fill"></i>
                                        </Button>
                                        <Button
                                            variant="soft-info"
                                            className={`btn btn-icon fs-14 ${isListView ? "active" : ""}`}
                                            onClick={() => setIsListView(true)}
                                            title={t("tenant.members.view_mode.list")}
                                        >
                                            <i className="ri-list-unordered"></i>
                                        </Button>
                                        <Button variant="soft-primary" onClick={() => setShowQuickAdd(true)}>
                                            {t("tenant.members.actions.quick_add")}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className={`team-list ${isListView ? "list-view-filter" : "grid-view-filter"}`}>
                {filteredMembers.map((member) => (
                    <Col key={member.id}>
                        <Card className="team-box">
                            <div className="team-cover">
                                <img src={profileBg} alt="" className="img-fluid" />
                            </div>
                            <Card.Body className="p-4">
                                <Row className="align-items-center team-row">
                                    <Col className="team-settings">
                                        <Row>
                                            <Col>
                                                <div className="flex-shrink-0 me-2">
                                                    <button type="button" className="btn btn-light btn-icon rounded-circle btn-sm favourite-btn">
                                                        <i className="ri-star-fill fs-14"></i>
                                                    </button>
                                                </div>
                                            </Col>
                                            <Dropdown dir="start" className="col text-end">
                                                <Dropdown.Toggle as="a" role="button" className="arrow-none">
                                                    <i className="ri-more-fill fs-17"></i>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item as={Link} href={tenantRoute.to(`/members/${member.id}/edit`)}>
                                                        <i className="ri-pencil-line me-2 align-bottom text-muted"></i>
                                                        {t("tenant.members.actions.edit")}
                                                    </Dropdown.Item>
                                                    {member.onboarding_status !== "account_active" ? (
                                                        <Dropdown.Item onClick={() => openInviteModal(member)}>
                                                            <i className="ri-mail-send-line me-2 align-bottom text-muted"></i>
                                                            {t("tenant.members.actions.invite")}
                                                        </Dropdown.Item>
                                                    ) : null}
                                                    <Dropdown.Item onClick={() => onDelete(member)}>
                                                        <i className="ri-delete-bin-5-line me-2 align-bottom text-muted"></i>
                                                        {t("tenant.members.actions.remove")}
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </Row>
                                    </Col>
                                    <Col lg={4} className="col">
                                        <div className="team-profile-img">
                                            <div className="avatar-lg img-thumbnail rounded-circle flex-shrink-0">
                                                <div className="avatar-title text-uppercase border rounded-circle bg-light text-primary">
                                                    {avatarInitial(member.full_name)}
                                                </div>
                                            </div>
                                            <div className="team-content">
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-start text-body"
                                                    onClick={() => setDetail(member)}
                                                >
                                                    <h5 className="fs-16 mb-1">{member.full_name}</h5>
                                                </button>
                                                <p className="text-muted mb-0 text-capitalize">{roleLabel(member.role_code)}</p>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col lg={4} className="col">
                                        <Row className="text-muted text-center">
                                            <Col xs={6} className="border-end border-end-dashed">
                                                <h5 className="mb-1 text-capitalize">{profileStatusLabel(member.profile_status)}</h5>
                                                <p className="text-muted mb-0">{t("tenant.members.labels.status")}</p>
                                            </Col>
                                            <Col xs={6}>
                                                <h5 className="mb-1 text-capitalize">{onboardingStatusLabel(member.onboarding_status)}</h5>
                                                <p className="text-muted mb-0">{t("tenant.members.labels.onboarding")}</p>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col lg={2} className="col">
                                        <div className="text-end">
                                            <Link href={tenantRoute.to(`/members/${member.id}`)} className="btn btn-light view-btn">
                                                {t("tenant.members.actions.view_profile")}
                                            </Link>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal show={showQuickAdd} onHide={() => setShowQuickAdd(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("tenant.members.quick_add.title")}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={onQuickAdd}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.members.labels.full_name")}</Form.Label>
                            <Form.Control
                                value={quickForm.full_name}
                                onChange={(e) => setQuickForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.members.labels.role")}</Form.Label>
                            <Form.Select
                                value={quickForm.role_code}
                                onChange={(e) => setQuickForm((prev) => ({ ...prev, role_code: e.target.value }))}
                            >
                                {quickAddRoleOptions.map((role) => (
                                    <option key={role} value={role}>
                                        {roleLabel(role)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>{t("tenant.members.labels.status")}</Form.Label>
                            <Form.Select
                                value={quickForm.profile_status}
                                onChange={(e) => setQuickForm((prev) => ({ ...prev, profile_status: e.target.value }))}
                            >
                                <option value="active">{profileStatusLabel("active")}</option>
                                <option value="inactive">{profileStatusLabel("inactive")}</option>
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowQuickAdd(false)}>
                            {t("Cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("tenant.members.actions.saving") : t("tenant.members.actions.add_member")}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal show={showInvite} onHide={() => setShowInvite(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("tenant.members.invite.title")}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={onInvite}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.members.labels.email")}</Form.Label>
                            <Form.Control
                                type="email"
                                value={inviteForm.email}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.members.labels.full_name")}</Form.Label>
                            <Form.Control
                                value={inviteForm.full_name}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, full_name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.members.labels.role")}</Form.Label>
                            <Form.Select
                                value={inviteForm.role_code}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, role_code: e.target.value }))}
                            >
                                {quickAddRoleOptions.map((role) => (
                                    <option key={role} value={role}>
                                        {roleLabel(role)}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.members.labels.note_optional")}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={inviteForm.note}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, note: e.target.value }))}
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>{t("tenant.members.labels.expires_in_days")}</Form.Label>
                            <Form.Control
                                type="number"
                                min={1}
                                max={30}
                                value={inviteForm.expires_in_days}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, expires_in_days: Number(e.target.value) }))}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowInvite(false)}>
                            {t("Cancel")}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? t("tenant.members.actions.sending") : t("tenant.members.actions.send_invitation")}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Offcanvas show={Boolean(detail)} placement="end" onHide={() => setDetail(null)} className="offcanvas-end border-0">
                <Offcanvas.Body className="profile-offcanvas p-0">
                    <div className="team-cover">
                        <img src={profileBg} alt="" className="img-fluid" />
                    </div>
                    <div className="p-3 text-center">
                        <img src={avatar2} alt="" className="avatar-lg img-thumbnail rounded-circle mx-auto" />
                        <div className="mt-3">
                            <h5 className="fs-15 profile-name mb-1">{detail?.full_name}</h5>
                            <p className="text-muted profile-designation text-capitalize mb-0">
                                {detail ? roleLabel(detail.role_code) : "-"}
                            </p>
                        </div>
                    </div>
                    <Row className="g-0 text-center">
                        <Col xs={6}>
                            <div className="p-3 border border-dashed border-start-0">
                                <h5 className="mb-1 profile-project text-capitalize">
                                    {detail ? profileStatusLabel(detail.profile_status) : "-"}
                                </h5>
                                <p className="text-muted mb-0">{t("tenant.members.labels.status")}</p>
                            </div>
                        </Col>
                        <Col xs={6}>
                            <div className="p-3 border border-dashed border-start-0">
                                <h5 className="mb-1 profile-task text-capitalize">
                                    {detail ? onboardingStatusLabel(detail.onboarding_status) : "-"}
                                </h5>
                                <p className="text-muted mb-0">{t("tenant.members.labels.onboarding")}</p>
                            </div>
                        </Col>
                    </Row>
                </Offcanvas.Body>
                <div className="offcanvas-foorter border p-3 hstack gap-3 text-center position-relative">
                    {detail ? (
                        <Link href={tenantRoute.to(`/members/${detail.id}`)} className="btn btn-primary w-100">
                            <i className="ri-user-3-fill align-bottom ms-1"></i> {t("tenant.members.actions.view_profile")}
                        </Link>
                    ) : null}
                </div>
            </Offcanvas>
        </>
    );
}

MembersIndex.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default MembersIndex;
