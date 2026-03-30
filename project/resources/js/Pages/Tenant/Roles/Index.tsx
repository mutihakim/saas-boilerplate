import { Head } from "@inertiajs/react";
import axios from "axios";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { Alert, Badge, Button, Card, Col, Dropdown, Form, Modal, Row, Table } from "react-bootstrap";
import { useTranslation } from "react-i18next";

import TenantPageTitle from "../../../Components/Common/TenantPageTitle";
import TenantLayout from "../../../Layouts/TenantLayout";
import { parseApiError } from "../../../common/apiError";
import { notify } from "../../../common/notify";
import { useTenantRoute } from "../../../common/tenantRoute";

type RoleItem = {
    id: number;
    name: string;
    display_name: string;
    is_system: boolean;
    row_version: number;
    permissions: string[];
    members_count: number;
    members_preview: { id: number; name: string; avatar_url: string | null }[];
};

type PermissionModules = Record<string, string[]>;

type Props = {
    roles: RoleItem[];
    permissionModules: PermissionModules;
};

const defaultNewRole = { name: "", display_name: "" };

const roleColor = (index: number) => {
    const colors = ["primary", "danger", "warning", "success", "info"];
    return colors[index % colors.length];
};

const sortActions = (actions: string[]): string[] => {
    const order = ["view", "create", "update", "delete", "assign"];
    return [...actions].sort((a, b) => {
        const aIdx = order.indexOf(a);
        const bIdx = order.indexOf(b);
        const ai = aIdx === -1 ? 999 : aIdx;
        const bi = bIdx === -1 ? 999 : bIdx;
        return ai - bi;
    });
};

function humanizeCode(value: string) {
    return value
        .replace(/_/g, " ")
        .split(".")
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(" ");
}

export default function RolesIndex({ roles: initialRoles, permissionModules }: Props) {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const apiBase = `/api/v1${tenantRoute.to("/roles")}`.replace("/t/", "/tenants/");

    const [roles, setRoles] = useState<RoleItem[]>(initialRoles ?? []);
    const [modules, setModules] = useState<PermissionModules>(permissionModules ?? {});
    const [selectedRole, setSelectedRole] = useState<RoleItem | null>((initialRoles && initialRoles.length > 0) ? initialRoles[0] : null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(selectedRole?.permissions ?? []);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showMatrixModal, setShowMatrixModal] = useState(false);
    const [newRole, setNewRole] = useState(defaultNewRole);
    const [query, setQuery] = useState("");
    const [isListView, setIsListView] = useState(false);

    async function loadRoles() {
        const response = await axios.get(apiBase);
        setRoles(response.data.data.roles);
        setModules(response.data.data.permission_modules);

        if (selectedRole) {
            const freshSelected = response.data.data.roles.find((role: RoleItem) => role.id === selectedRole.id) ?? null;
            setSelectedRole(freshSelected);
        }
    }

    useEffect(() => {
        setSelectedPermissions(selectedRole?.permissions ?? []);
    }, [selectedRole]);

    const filteredRoles = useMemo(() => {
        if (!query) return roles;
        const q = query.toLowerCase();
        return roles.filter((role) => role.display_name.toLowerCase().includes(q) || role.name.toLowerCase().includes(q));
    }, [query, roles]);

    const moduleRows = useMemo(() => Object.entries(modules), [modules]);
    const actionColumns = useMemo(() => {
        const unique = new Set<string>();
        Object.values(modules).forEach((actions) => actions.forEach((action) => unique.add(action)));
        return sortActions(Array.from(unique));
    }, [modules]);

    function roleSummary(role: RoleItem): string {
        if (role.name.includes("owner")) return t("tenant.roles.summary.owner");
        if (role.name.includes("admin")) return t("tenant.roles.summary.admin");
        if (role.name.includes("viewer")) return t("tenant.roles.summary.viewer");
        if (role.name.includes("operator")) return t("tenant.roles.summary.operator");
        if (role.name.includes("member")) return t("tenant.roles.summary.member");
        return t("tenant.roles.summary.custom");
    }

    function formatModuleLabel(moduleName: string): string {
        return t(`tenant.roles.modules.${moduleName}`, {
            defaultValue: humanizeCode(moduleName),
        });
    }

    function formatActionLabel(action: string): string {
        return t(`tenant.roles.actions_matrix.${action}`, {
            defaultValue: humanizeCode(action),
        });
    }

    function showApiErrorToast(err: any, fallbackTitle: string) {
        const parsed = parseApiError(err, fallbackTitle);
        notify.error({
            title: parsed.title,
            detail: parsed.detail ?? t("tenant.roles.error.try_again"),
        });
    }

    function openRoleMatrix(role: RoleItem) {
        setSelectedRole(role);
        setShowMatrixModal(true);
    }

    function togglePermission(name: string) {
        if (selectedRole?.is_system) {
            return;
        }
        setSelectedPermissions((prev) => (prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]));
    }

    async function onCreateRole(e: FormEvent) {
        e.preventDefault();
        setSaving(true);
        try {
            await axios.post(apiBase, newRole);
            notify.success(t("tenant.roles.toast.created"));
            setNewRole(defaultNewRole);
            setShowModal(false);
            await loadRoles();
        } catch (err: any) {
            showApiErrorToast(err, t("tenant.roles.error.create_failed"));
        } finally {
            setSaving(false);
        }
    }

    async function saveRoleName() {
        if (!selectedRole) return;
        setSaving(true);
        try {
            const response = await axios.patch(`${apiBase}/${selectedRole.id}`, {
                display_name: selectedRole.display_name,
                row_version: selectedRole.row_version,
            });
            const updated = response.data.data.role;
            setSelectedRole((prev) => (prev ? { ...prev, row_version: updated.row_version, display_name: updated.display_name } : prev));
            notify.success(t("tenant.roles.toast.updated"));
            await loadRoles();
            setShowMatrixModal(false);
        } catch (err: any) {
            const code = err?.response?.data?.error?.code;
            if (code === "VERSION_CONFLICT") {
                notify.error({
                    title: t("tenant.roles.error.version_conflict_title"),
                    detail: t("tenant.roles.error.version_conflict_detail"),
                });
            } else {
                showApiErrorToast(err, t("tenant.roles.error.update_failed"));
            }
        } finally {
            setSaving(false);
        }
    }

    async function savePermissions() {
        if (!selectedRole || selectedRole.is_system) return;
        setSaving(true);
        try {
            const response = await axios.patch(`${apiBase}/${selectedRole.id}/permissions`, {
                permissions: selectedPermissions,
                row_version: selectedRole.row_version,
            });
            const updated = response.data.data.role;
            setSelectedRole((prev) => prev ? {
                ...prev,
                row_version: updated.row_version,
                permissions: updated.permissions.map((p: { name: string } | string) => typeof p === "string" ? p : p.name),
            } : prev);
            notify.success(t("tenant.roles.toast.permissions_updated"));
            await loadRoles();
            setShowMatrixModal(false);
        } catch (err: any) {
            const code = err?.response?.data?.error?.code;
            if (code === "VERSION_CONFLICT") {
                notify.error({
                    title: t("tenant.roles.error.version_conflict_title"),
                    detail: t("tenant.roles.error.version_conflict_detail"),
                });
            } else {
                showApiErrorToast(err, t("tenant.roles.error.permissions_failed"));
            }
        } finally {
            setSaving(false);
        }
    }

    async function deleteRole(role: RoleItem) {
        if (role.is_system) return;
        setSaving(true);
        try {
            await axios.delete(`${apiBase}/${role.id}`);
            notify.success(t("tenant.roles.toast.deleted"));
            if (selectedRole?.id === role.id) {
                setSelectedRole(null);
                setSelectedPermissions([]);
            }
            await loadRoles();
        } catch (err: any) {
            showApiErrorToast(err, t("tenant.roles.error.delete_failed"));
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <Head title={t("tenant.roles.page_title")} />
            <TenantPageTitle title={t("tenant.roles.title")} parentLabel={t("tenant.roles.parent")} />

            <Row>
                <Col lg={12}>
                    <Card>
                        <Card.Body>
                            <Row className="g-2">
                                <Col sm={4}>
                                    <div className="search-box">
                                        <Form.Control
                                            type="text"
                                            placeholder={t("tenant.roles.search_placeholder")}
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
                                            title={t("tenant.roles.view_mode.grid")}
                                        >
                                            <i className="ri-grid-fill"></i>
                                        </Button>
                                        <Button
                                            variant="soft-info"
                                            className={`btn btn-icon fs-14 ${isListView ? "active" : ""}`}
                                            onClick={() => setIsListView(true)}
                                            title={t("tenant.roles.view_mode.list")}
                                        >
                                            <i className="ri-list-unordered"></i>
                                        </Button>
                                        <Button onClick={() => setShowModal(true)}>
                                            <i className="ri-add-fill me-1 align-bottom"></i>
                                            {t("tenant.roles.actions.create_role")}
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="g-3">
                <Col xl={12}>
                    {!isListView ? (
                        <Row className="team-list grid-view-filter g-3">
                            {filteredRoles.map((role, idx) => {
                                const accent = roleColor(idx);
                                return (
                                    <Col key={role.id}>
                                        <Card className={`team-box h-100 ${selectedRole?.id === role.id ? "border-primary" : ""}`}>
                                            <Card.Body>
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex gap-3 align-items-start">
                                                        <div className="avatar-sm">
                                                            <div className={`avatar-title rounded-circle bg-${accent}-subtle text-${accent}`}>
                                                                <i className="ri-shield-star-line fs-18"></i>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h5 className="fs-16 mb-0">{role.display_name}</h5>
                                                            <small className="text-muted">
                                                                {role.is_system ? t("tenant.roles.badge.default_role") : t("tenant.roles.badge.custom_role")}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <Dropdown align="end">
                                                        <Dropdown.Toggle as="a" className="arrow-none text-muted" role="button">
                                                            <i className="ri-more-2-fill fs-16"></i>
                                                        </Dropdown.Toggle>
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item onClick={() => openRoleMatrix(role)}>{t("tenant.roles.actions.open_matrix")}</Dropdown.Item>
                                                            {!role.is_system ? (
                                                                <Dropdown.Item onClick={() => deleteRole(role)}>{t("tenant.roles.actions.delete")}</Dropdown.Item>
                                                            ) : null}
                                                        </Dropdown.Menu>
                                                    </Dropdown>
                                                </div>
                                                <p className="text-muted mb-3">{roleSummary(role)}</p>
                                                <p className="mb-3">
                                                    {role.members_count} {role.members_count === 1 ? t("tenant.roles.people.single") : t("tenant.roles.people.plural")}
                                                </p>
                                                <div className="d-flex gap-2 align-items-center">
                                                    <Button size="sm" variant="soft-primary" onClick={() => openRoleMatrix(role)}>
                                                        {t("tenant.roles.actions.open")}
                                                    </Button>
                                                    <Badge bg="light" text="dark">
                                                        {role.permissions.length} {t("tenant.roles.permissions_count")}
                                                    </Badge>
                                                    {role.members_preview.map((m) => (
                                                        <span key={m.id} className="avatar-xxs">
                                                            <span className="avatar-title rounded-circle bg-light text-dark">
                                                                {m.name.slice(0, 1).toUpperCase()}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}

                            <Col>
                                <Card className="h-100 border border-dashed border-warning-subtle" style={{ cursor: "pointer" }} onClick={() => setShowModal(true)}>
                                    <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                                        <div className="avatar-md mb-3">
                                            <div className="avatar-title rounded-circle bg-warning-subtle text-warning fs-22">
                                                <i className="ri-rocket-line"></i>
                                            </div>
                                        </div>
                                        <h4 className="mb-1">{t("tenant.roles.add_card.title")}</h4>
                                        <p className="text-muted mb-0">{t("tenant.roles.add_card.subtitle")}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    ) : (
                        <Card>
                            <Card.Body>
                                <div className="table-responsive">
                                    <Table className="align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>{t("tenant.roles.table.role")}</th>
                                                <th>{t("tenant.roles.table.type")}</th>
                                                <th>{t("tenant.roles.table.members")}</th>
                                                <th>{t("tenant.roles.table.permissions")}</th>
                                                <th className="text-end">{t("tenant.roles.table.action")}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRoles.map((role) => (
                                                <tr key={role.id}>
                                                    <td>
                                                        <h6 className="mb-0">{role.display_name}</h6>
                                                        <small className="text-muted">{role.name}</small>
                                                    </td>
                                                    <td>
                                                        <Badge bg={role.is_system ? "soft-primary" : "soft-secondary"} text={role.is_system ? "primary" : "secondary"}>
                                                            {role.is_system ? t("tenant.roles.badge.default") : t("tenant.roles.badge.custom")}
                                                        </Badge>
                                                    </td>
                                                    <td>{role.members_count}</td>
                                                    <td>{role.permissions.length}</td>
                                                    <td className="text-end">
                                                        <Button size="sm" variant="soft-primary" className="me-2" onClick={() => openRoleMatrix(role)}>
                                                            {t("tenant.roles.actions.open")}
                                                        </Button>
                                                        {!role.is_system ? (
                                                            <Button size="sm" variant="soft-danger" onClick={() => deleteRole(role)}>
                                                                {t("tenant.roles.actions.delete")}
                                                            </Button>
                                                        ) : null}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t("tenant.roles.create_modal.title")}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={onCreateRole}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>{t("tenant.roles.create_modal.system_name")}</Form.Label>
                            <Form.Control
                                placeholder={t("tenant.roles.create_modal.system_name_placeholder")}
                                value={newRole.name}
                                onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>{t("tenant.roles.create_modal.display_name")}</Form.Label>
                            <Form.Control
                                placeholder={t("tenant.roles.create_modal.display_name_placeholder")}
                                value={newRole.display_name}
                                onChange={(e) => setNewRole((prev) => ({ ...prev, display_name: e.target.value }))}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>{t("Cancel")}</Button>
                        <Button type="submit" disabled={saving}>{saving ? t("tenant.roles.actions.saving") : t("tenant.roles.actions.create")}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal
                show={showMatrixModal}
                onHide={() => setShowMatrixModal(false)}
                centered
                size="xl"
                backdrop="static"
                keyboard={false}
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t("tenant.roles.matrix.title")}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {!selectedRole ? (
                        <Alert variant="info" className="mb-0">{t("tenant.roles.matrix.select_role")}</Alert>
                    ) : (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">{selectedRole.display_name}</h5>
                                <Badge bg="light" text="dark">v{selectedRole.row_version}</Badge>
                            </div>
                            <Row className="g-2 mb-3">
                                <Col md={9}>
                                    <Form.Control
                                        value={selectedRole.display_name}
                                        disabled={selectedRole.is_system}
                                        onChange={(e) => setSelectedRole((prev) => prev ? ({ ...prev, display_name: e.target.value }) : prev)}
                                    />
                                </Col>
                                <Col md={3}>
                                    <Button onClick={saveRoleName} disabled={saving || selectedRole.is_system} className="w-100">
                                        {t("tenant.roles.actions.save_name")}
                                    </Button>
                                </Col>
                            </Row>
                            {selectedRole.is_system ? (
                                <Alert variant="light" className="py-2">
                                    {t("tenant.roles.matrix.system_locked")}
                                </Alert>
                            ) : null}
                            <Table responsive bordered>
                                <thead>
                                    <tr>
                                        <th>{t("tenant.roles.matrix.module")}</th>
                                        {actionColumns.map((action) => (
                                            <th key={action} className="text-center">{formatActionLabel(action)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {moduleRows.map(([moduleName, actions]) => (
                                        <tr key={moduleName}>
                                            <td className="fw-semibold">
                                                <div>{formatModuleLabel(moduleName)}</div>
                                                <small className="text-muted">{moduleName}</small>
                                            </td>
                                            {actionColumns.map((action) => {
                                                const supported = actions.includes(action);
                                                const permissionName = `${moduleName}.${action}`;

                                                return (
                                                    <td key={permissionName} className="text-center align-middle">
                                                        {supported ? (
                                                            <Form.Check
                                                                type="checkbox"
                                                                className="d-inline-flex justify-content-center"
                                                                disabled={selectedRole.is_system}
                                                                checked={selectedPermissions.includes(permissionName)}
                                                                onChange={() => togglePermission(permissionName)}
                                                            />
                                                        ) : (
                                                            <span className="text-muted">-</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => setShowMatrixModal(false)}>{t("tenant.roles.actions.close")}</Button>
                    <Button onClick={savePermissions} disabled={saving || !selectedRole || selectedRole.is_system}>
                        {saving ? t("tenant.roles.actions.saving") : t("tenant.roles.actions.save_permissions")}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

RolesIndex.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
