import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import React, { FormEvent, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Dropdown, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

import illustration1 from '../../../../images/illustrator-1.png';
import TenantLayout from '../../../Layouts/TenantLayout';
import { parseApiError } from '../../../common/apiError';
import { notify } from '../../../common/notify';
import { useTenantRoute } from '../../../common/tenantRoute';

type ChatItem = {
    jid: string;
    name: string;
    contact_type: 'member' | 'external' | 'group';
    member_id: number | null;
    last_message: string;
    last_message_at: string | null;
    unread_count: number;
};

type ChatMessage = {
    id: number;
    direction: 'incoming' | 'outgoing';
    chat_jid: string;
    sender_jid: string | null;
    recipient_jid: string | null;
    payload: { text?: string; delivery?: string } | null;
    read_at: string | null;
    created_at: string;
};

const MESSAGE_BATCH_SIZE = 15;

function formatTime(input?: string | null) {
    if (!input) return '-';
    return new Date(input).toLocaleString();
}

function initialsFromName(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function WhatsAppChatsPage() {
    const { t } = useTranslation();
    const tenantRoute = useTenantRoute();
    const { props } = usePage<any>();
    const tenantId = props.currentTenant?.id ?? null;
    const apiBase = `/api/v1${tenantRoute.to('/whatsapp')}`.replace('/t/', '/tenants/');
    const [loading, setLoading] = useState(false);
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [selectedJid, setSelectedJid] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasMoreMessages, setHasMoreMessages] = useState(false);
    const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [contactQuery, setContactQuery] = useState('');
    const [messageQuery, setMessageQuery] = useState('');
    const [searchMenuOpen, setSearchMenuOpen] = useState(false);
    const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const conversationRef = React.useRef<HTMLDivElement>(null);
    const shouldAutoScrollRef = React.useRef(true);
    const redirectingToLoginRef = React.useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        if (!shouldAutoScrollRef.current) {
            shouldAutoScrollRef.current = true;
            return;
        }

        scrollToBottom();
    }, [messages]);

    const selectedChat = useMemo(
        () => chats.find((chat) => chat.jid === selectedJid) ?? null,
        [chats, selectedJid]
    );

    const filteredChats = useMemo(() => {
        if (!contactQuery) return chats;
        const q = contactQuery.toLowerCase();
        return chats.filter((chat) => chat.name.toLowerCase().includes(q) || chat.jid.toLowerCase().includes(q));
    }, [chats, contactQuery]);

    const filteredMessages = useMemo(() => {
        if (!messageQuery.trim()) return messages;
        const q = messageQuery.toLowerCase();
        return messages.filter((message) => (message.payload?.text ?? '').toLowerCase().includes(q));
    }, [messages, messageQuery]);

    function redirectToLogin() {
        if (redirectingToLoginRef.current) {
            return;
        }

        redirectingToLoginRef.current = true;
        const intended = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        window.location.assign(`/login?intended=${encodeURIComponent(intended)}`);
    }

    function showApiError(err: any, fallback: string) {
        const parsed = parseApiError(err, fallback);
        notify.error({
            title: parsed.title,
            detail: parsed.detail ?? t('tenant.whatsapp.chats.error.try_again'),
        });

        if (err?.response?.status === 401) {
            redirectToLogin();
        }
    }

    function contactTypeLabel(type: ChatItem['contact_type']) {
        return t(`tenant.whatsapp.chats.contact_type.${type}`, {
            defaultValue: type,
        });
    }

    async function loadChats() {
        const response = await axios.get(`${apiBase}/chats`);
        const nextChats = response.data.data.chats as ChatItem[];
        setChats(nextChats);
        if (!selectedJid && nextChats.length > 0) {
            setSelectedJid(nextChats[0].jid);
        }
    }

    async function loadMessages(
        jid: string,
        options?: {
            beforeId?: number | null;
            prepend?: boolean;
        }
    ) {
        const response = await axios.get(`${apiBase}/chats/${encodeURIComponent(jid)}/messages`, {
            params: {
                limit: MESSAGE_BATCH_SIZE,
                before_id: options?.beforeId ?? undefined,
            },
        });

        const payload = response.data.data ?? {};
        const incomingMessages = (payload.messages ?? []) as ChatMessage[];
        const hasMore = Boolean(payload.has_more);
        const nextBefore = payload.next_before_id ? Number(payload.next_before_id) : null;

        if (options?.prepend) {
            const listEl = conversationRef.current;
            const prevHeight = listEl?.scrollHeight ?? 0;
            const prevTop = listEl?.scrollTop ?? 0;

            shouldAutoScrollRef.current = false;
            setMessages((current) => {
                const existingIds = new Set(current.map((item) => item.id));
                const olderMessages = incomingMessages.filter((item) => !existingIds.has(item.id));
                return [...olderMessages, ...current];
            });

            requestAnimationFrame(() => {
                if (!listEl) return;
                const nextHeight = listEl.scrollHeight;
                listEl.scrollTop = prevTop + (nextHeight - prevHeight);
            });
        } else {
            shouldAutoScrollRef.current = true;
            setMessages(incomingMessages);
        }

        setHasMoreMessages(hasMore);
        setNextBeforeId(nextBefore);
    }

    async function markRead(jid: string) {
        await axios.post(`${apiBase}/chats/${encodeURIComponent(jid)}/read`);
    }

    async function bootstrap() {
        setLoading(true);
        try {
            await loadChats();
        } catch (err: any) {
            showApiError(err, t('tenant.whatsapp.chats.error.load_chats_failed'));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        bootstrap();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (!selectedJid) {
            setMessages([]);
            setHasMoreMessages(false);
            setNextBeforeId(null);
            return;
        }

        (async () => {
            setLoading(true);
            try {
                await loadMessages(selectedJid);
                await markRead(selectedJid);
                await loadChats();
            } catch (err: any) {
                showApiError(err, t('tenant.whatsapp.chats.error.load_messages_failed'));
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJid]);

    const selectedJidRef = React.useRef(selectedJid);
    React.useEffect(() => {
        selectedJidRef.current = selectedJid;
    }, [selectedJid]);

    React.useEffect(() => {
        if (!tenantId) return;
        if (!(window as any).Echo) return;

        const channelName = `tenant.${tenantId}.whatsapp`;
        const channel = (window as any).Echo.private(channelName);

        channel.listen('.whatsapp.message.received', () => {
            // Silently refresh UI
            if (selectedJidRef.current) {
                loadMessages(selectedJidRef.current).catch((err) => {
                    if (err?.response?.status === 401) {
                        redirectToLogin();
                    }
                });
            }
            loadChats().catch((err) => {
                if (err?.response?.status === 401) {
                    redirectToLogin();
                }
            });
        });

        return () => {
            channel.stopListening('.whatsapp.message.received');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tenantId]);

    async function onLoadMore() {
        if (!selectedJid || !hasMoreMessages || !nextBeforeId || loadingMore) {
            return;
        }

        setLoadingMore(true);
        try {
            await loadMessages(selectedJid, { prepend: true, beforeId: nextBeforeId });
        } catch (err: any) {
            showApiError(err, t('tenant.whatsapp.chats.error.load_messages_failed'));
        } finally {
            setLoadingMore(false);
        }
    }

    async function onSend(e: FormEvent) {
        e.preventDefault();
        if (!selectedJid || !messageText.trim()) {
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${apiBase}/chats/${encodeURIComponent(selectedJid)}/send`, {
                message: messageText,
            });
            setMessageText('');
            notify.success(t('tenant.whatsapp.chats.toast.queued'));
            await loadMessages(selectedJid);
            await loadChats();
        } catch (err: any) {
            showApiError(err, t('tenant.whatsapp.chats.error.send_failed'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Head title={t('tenant.whatsapp.chats.page_title')} />
            <div className="chat-wrapper d-lg-flex gap-1 mx-n4 mt-n4 p-1">
                <div className="chat-leftsidebar">
                    <Card className="mb-0">
                        <div className="px-4 pt-4 mb-3">
                            <div className="d-flex align-items-center mb-3">
                                <h5 className="mb-0 flex-grow-1">{t('tenant.whatsapp.chats.panel_title')}</h5>
                            </div>
                            <div className="search-box">
                                <Form.Control
                                    type="text"
                                    placeholder={t('tenant.whatsapp.chats.search_placeholder')}
                                    value={contactQuery}
                                    onChange={(e) => setContactQuery(e.target.value)}
                                />
                                <i className="ri-search-line search-icon"></i>
                            </div>
                        </div>
                        <div className="chat-room-list pt-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 260px)', margin: '-16px 0px 0px' }}>
                            <div className="chat-message-list">
                                <ul className="list-unstyled chat-list chat-user-list users-list mb-0">
                                    {filteredChats.map((chat) => (
                                        <li
                                            key={chat.jid}
                                            className={selectedJid === chat.jid ? 'active' : ''}
                                        >
                                            <button
                                                type="button"
                                                className={`w-100 border-0 bg-transparent text-start p-0 ${chat.unread_count > 0 ? 'unread-msg-user' : ''}`}
                                                onClick={() => setSelectedJid(chat.jid)}
                                            >
                                                <div className="d-flex align-items-center">
                                                    <div className="flex-shrink-0 chat-user-img online user-own-img align-self-center me-3 ms-0">
                                                        <div className="avatar-xs">
                                                            <span className="avatar-title rounded-circle bg-primary-subtle text-primary text-uppercase">
                                                                {initialsFromName(chat.name)}
                                                            </span>
                                                        </div>
                                                        <span className="user-status"></span>
                                                    </div>
                                                    <div className="flex-grow-1 overflow-hidden">
                                                        <p className="fw-medium text-truncate mb-0">
                                                            {chat.name}
                                                            {' '}
                                                            <Badge bg="light" text="dark" className="ms-1 text-capitalize">
                                                                {contactTypeLabel(chat.contact_type)}
                                                            </Badge>
                                                        </p>
                                                        <p className="text-muted text-truncate mb-0">{chat.last_message || chat.jid}</p>
                                                    </div>
                                                    <div className="flex-shrink-0 ms-2 text-end">
                                                        <small className="text-muted d-block">{formatTime(chat.last_message_at)}</small>
                                                        {chat.unread_count > 0 ? (
                                                            <Badge pill bg="danger">{chat.unread_count}</Badge>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                    {!filteredChats.length ? (
                                        <li className="text-center text-muted py-4">{t('tenant.whatsapp.chats.empty_chats')}</li>
                                    ) : null}
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="user-chat w-100 overflow-hidden">
                    <Card className="mb-0">
                        <Card.Header className="p-3 user-chat-topbar">
                            <Row className="align-items-center">
                                <Col sm={4} xs={8}>
                                    <div className="d-flex align-items-center">
                                        <div className="flex-shrink-0 d-block d-lg-none me-3">
                                            <button type="button" className="user-chat-remove fs-18 p-1 border-0 bg-transparent">
                                                <i className="ri-arrow-left-s-line align-bottom"></i>
                                            </button>
                                        </div>
                                        <div className="flex-grow-1 overflow-hidden">
                                            <h5 className="text-truncate mb-0 fs-16">{selectedChat?.name ?? t('tenant.whatsapp.chats.select_chat')}</h5>
                                            <p className="text-truncate text-muted fs-13 mb-0">{selectedChat?.jid ?? t('tenant.whatsapp.chats.time_empty')}</p>
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={8} xs={4}>
                                    <ul className="list-inline user-chat-nav text-end mb-0">
                                        <li className="list-inline-item m-0">
                                            <Button variant="ghost-none" size="sm" className="btn btn-ghost-secondary btn-icon" disabled={!selectedChat}>
                                                <i className="ri-phone-line align-bottom"></i>
                                            </Button>
                                        </li>
                                        <li className="list-inline-item m-0">
                                            <Button variant="ghost-none" size="sm" className="btn btn-ghost-secondary btn-icon" disabled={!selectedChat}>
                                                <i className="ri-vidicon-line align-bottom"></i>
                                            </Button>
                                        </li>
                                        <li className="list-inline-item m-0">
                                            <Dropdown className="chat-option-dropdown" align="end">
                                                <Dropdown.Toggle as="button" className="btn btn-ghost-secondary btn-icon btn-sm border-0 bg-transparent">
                                                    <i className="ri-more-2-fill align-middle"></i>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onClick={() => setSearchMenuOpen((prev) => !prev)}>
                                                        {t('tenant.whatsapp.chats.actions.search')}
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => notify.info(t('tenant.whatsapp.chats.actions.archive_info'))}>
                                                        {t('tenant.whatsapp.chats.actions.archive')}
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => notify.info(t('tenant.whatsapp.chats.actions.mute_info'))}>
                                                        {t('tenant.whatsapp.chats.actions.mute')}
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onClick={() => setSettingsMenuOpen((prev) => !prev)}>
                                                        {t('tenant.whatsapp.chats.actions.settings')}
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </li>
                                    </ul>
                                </Col>
                            </Row>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div className={`position-relative ${searchMenuOpen ? '' : 'd-none'}`}>
                                <div className="search-box chat-search-box">
                                    <Form.Control
                                        type="text"
                                        className="form-control bg-light border-light"
                                        placeholder={t('tenant.whatsapp.chats.search_messages_placeholder')}
                                        value={messageQuery}
                                        onChange={(e) => setMessageQuery(e.target.value)}
                                    />
                                    <i className="ri-search-2-line search-icon"></i>
                                </div>
                            </div>

                            <div
                                ref={conversationRef}
                                style={{ maxHeight: 'calc(100vh - 420px)', minHeight: 360 }}
                                className="chat-conversation p-3 p-lg-4 overflow-auto"
                            >
                                {selectedJid && hasMoreMessages && !messageQuery.trim() ? (
                                    <div className="d-flex justify-content-center mb-3">
                                        <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill border bg-light-subtle shadow-sm">
                                            <Badge bg="secondary-subtle" text="secondary" pill className="text-uppercase">
                                                {t('tenant.whatsapp.chats.load_more_badge')}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="outline-secondary"
                                                onClick={onLoadMore}
                                                disabled={loadingMore || loading}
                                                className="rounded-pill"
                                            >
                                                {loadingMore
                                                    ? t('tenant.whatsapp.chats.loading_more')
                                                    : t('tenant.whatsapp.chats.load_more')}
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                                <ul className="list-unstyled chat-conversation-list">
                                    {filteredMessages.map((message) => (
                                        <li
                                            key={message.id}
                                            className={`chat-list ${message.direction === 'incoming' ? 'left' : 'right'}`}
                                        >
                                            <div className="conversation-list">
                                                {message.direction === 'incoming' ? (
                                                    <div className="chat-avatar">
                                                        <div className="avatar-xs">
                                                            <span className="avatar-title rounded-circle bg-light text-primary text-uppercase">
                                                                {selectedChat ? initialsFromName(selectedChat.name) : 'U'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <div className="user-chat-content">
                                                    <div className="ctext-wrap">
                                                        <div className="ctext-wrap-content">
                                                            <p className="mb-0 ctext-content">{message.payload?.text || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="conversation-name">
                                                        <small className="text-muted">{formatTime(message.created_at)}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                    {!filteredMessages.length ? (
                                        <li className="text-center text-muted py-5">
                                            <img src={illustration1} alt="" className="img-fluid mb-3" style={{ maxWidth: 140 }} />
                                            <h6 className="mb-1">{t('tenant.whatsapp.chats.empty_messages_title')}</h6>
                                            <p className="mb-0">{t('tenant.whatsapp.chats.empty_messages')}</p>
                                        </li>
                                    ) : null}
                                    <div ref={messagesEndRef} />
                                </ul>
                            </div>

                            <div className="chat-input-section p-3 p-lg-4 border-top border-top-dashed">
                                <Form onSubmit={onSend}>
                                    <Row className="g-0 align-items-center">
                                        <Col className="col-auto">
                                            <div className="chat-input-links me-2">
                                                <div className="links-list-item">
                                                    <button
                                                        type="button"
                                                        className="btn btn-link text-decoration-none btn btn-ghost-secondary btn-icon"
                                                        onClick={() => setSettingsMenuOpen((prev) => !prev)}
                                                    >
                                                        <i className="ri-emotion-line align-middle"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                className="chat-input bg-light border-light"
                                                placeholder={t('tenant.whatsapp.chats.message_placeholder')}
                                                value={messageText}
                                                onChange={(e) => setMessageText(e.target.value)}
                                                disabled={!selectedJid || loading}
                                            />
                                        </Col>
                                        <Col className="col-auto">
                                            <div className="chat-input-links ms-2">
                                                <div className="links-list-item">
                                                    <Button type="submit" className="btn btn-success chat-send waves-effect waves-light" disabled={!selectedJid || loading || !messageText.trim()}>
                                                        <i className="ri-send-plane-2-fill align-bottom"></i>
                                                        <span className="ms-1 d-none d-sm-inline">{t('tenant.whatsapp.chats.send')}</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>

                            <div className={`border-top p-2 bg-light ${settingsMenuOpen ? '' : 'd-none'}`}>
                                <div className="d-flex flex-wrap gap-2">
                                    <Button size="sm" variant="light" onClick={() => notify.info(t('tenant.whatsapp.chats.actions.clear_info'))}>
                                        {t('tenant.whatsapp.chats.actions.clear')}
                                    </Button>
                                    <Button size="sm" variant="light" onClick={() => notify.info(t('tenant.whatsapp.chats.actions.export_info'))}>
                                        {t('tenant.whatsapp.chats.actions.export')}
                                    </Button>
                                    <Button size="sm" variant="light" onClick={() => setSettingsMenuOpen(false)}>
                                        {t('tenant.whatsapp.chats.actions.close')}
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>
            </div>
        </>
    );
}

WhatsAppChatsPage.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;

export default WhatsAppChatsPage;
