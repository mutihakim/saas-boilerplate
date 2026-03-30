import { Head, Link } from "@inertiajs/react";
import React from "react";
import { Badge, Button, Card, Col, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import profileBg from "../../../../images/profile-bg.jpg";
import avatar1 from "../../../../images/users/avatar-1.jpg";
import TenantPageTitle from "../../../Components/Common/TenantPageTitle";
import TenantLayout from "../../../Layouts/TenantLayout";
import { useTenantRoute } from "../../../common/tenantRoute";

type MemberPayload = {
    id: number;
    full_name: string;
    role_code: string;
    profile_status: string;
    whatsapp_jid: string | null;
    row_version: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone?: string | null;
        job_title?: string | null;
        bio?: string | null;
        avatar_url?: string | null;
        address_line?: string | null;
        city?: string | null;
        country?: string | null;
        postal_code?: string | null;
    } | null;
};

type Props = {
    member: MemberPayload;
    canEdit: boolean;
};

function humanizeCode(value: string) {
    return value.replace(/_/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
}

function MemberView({ member, canEdit }: Props) {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const user = member.user;
    const location = [user?.address_line, user?.city, user?.country, user?.postal_code].filter(Boolean).join(", ");

    const roleLabel = t(`tenant.members.roles.${member.role_code}`, {
        defaultValue: humanizeCode(member.role_code),
    });
    const statusLabel = t(`tenant.members.status.profile.${member.profile_status}`, {
        defaultValue: humanizeCode(member.profile_status),
    });

    return (
        <>
            <Head title={t("tenant.members.view.page_title")} />
            <TenantPageTitle title={t("tenant.members.view.title")} parentLabel={t("tenant.members.parent")} />

            <div className="profile-foreground position-relative mx-n4 mt-n4">
                <div className="profile-wid-bg">
                    <img src={profileBg} alt="" className="profile-wid-img" />
                </div>
            </div>

            <div className="pt-4 mb-4 mb-lg-3 pb-lg-4">
                <Row className="g-4 align-items-center">
                    <div className="col-auto">
                        <div className="avatar-lg">
                            <img src={user?.avatar_url || avatar1} alt="user" className="img-thumbnail rounded-circle" />
                        </div>
                    </div>
                    <Col>
                        <div className="p-2">
                            <h3 className="text-white mb-1">{member.full_name}</h3>
                            <p className="text-white text-opacity-75 mb-1">{user?.job_title || t("tenant.members.view.team_member")}</p>
                            <div className="hstack text-white-50 gap-2">
                                <span>{user?.email || "-"}</span>
                                <span>{user?.phone || "-"}</span>
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} className="col-lg-auto text-lg-end">
                        <Badge bg="primary-subtle" text="primary" className="text-capitalize me-2">
                            {roleLabel}
                        </Badge>
                        <Badge bg="light" text="dark" className="text-capitalize">
                            {statusLabel}
                        </Badge>
                        <div className="mt-3">
                            {canEdit ? (
                                <Link href={tenantRoute.to(`/members/${member.id}/edit`)}>
                                    <Button variant="success">
                                        <i className="ri-edit-box-line align-bottom"></i> {t("tenant.members.actions.edit_profile")}
                                    </Button>
                                </Link>
                            ) : null}
                        </div>
                    </Col>
                </Row>
            </div>

            <Row>
                <Col xxl={4}>
                    <Card>
                        <Card.Body>
                            <h5 className="card-title mb-3">{t("tenant.members.view.member_info")}</h5>
                            <Table className="table-borderless mb-0">
                                <tbody>
                                    <tr>
                                        <th className="ps-0" scope="row">{t("tenant.members.labels.full_name")} :</th>
                                        <td className="text-muted">{member.full_name}</td>
                                    </tr>
                                    <tr>
                                        <th className="ps-0" scope="row">{t("tenant.members.labels.email")} :</th>
                                        <td className="text-muted">{user?.email || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th className="ps-0" scope="row">{t("tenant.members.labels.mobile")} :</th>
                                        <td className="text-muted">{user?.phone || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th className="ps-0" scope="row">{t("tenant.members.labels.location")} :</th>
                                        <td className="text-muted">{location || "-"}</td>
                                    </tr>
                                    <tr>
                                        <th className="ps-0" scope="row">{t("tenant.members.labels.role")} :</th>
                                        <td className="text-muted text-capitalize">{roleLabel}</td>
                                    </tr>
                                    <tr>
                                        <th className="ps-0" scope="row">{t("tenant.members.labels.whatsapp_jid")} :</th>
                                        <td className="text-muted">{member.whatsapp_jid || "-"}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xxl={8}>
                    <Card>
                        <Card.Body>
                            <h5 className="card-title mb-3">{t("tenant.members.view.about")}</h5>
                            <p className="text-muted mb-0">{user?.bio || t("tenant.members.view.no_bio")}</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

MemberView.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default MemberView;
