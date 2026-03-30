const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const axios = require('axios');
const express = require('express');
const qrImage = require('qrcode');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const execFileAsync = promisify(execFile);

const PORT = Number(process.env.PORT || 3010);
const SERVICE_NAME = 'tenant-whatsapp-service';
const APP_CALLBACK_URL = (process.env.APP_CALLBACK_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const INTERNAL_TOKEN = process.env.WHATSAPP_INTERNAL_TOKEN || '';
const AUTH_DIR = process.env.WA_AUTH_DIR || path.join(__dirname, '..', 'wa-auth');
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 8000);
const CONNECTING_TIMEOUT_MS = Number(process.env.CONNECTING_TIMEOUT_MS || 60000);
const CALLBACK_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000];
const CALLBACK_MAX_ATTEMPTS = Number(process.env.CALLBACK_RETRY_ATTEMPTS || 5);

if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
}

const app = express();
app.use(express.json({ limit: '2mb' }));

const callbackHttp = axios.create({
    baseURL: APP_CALLBACK_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
        'X-Internal-Token': INTERNAL_TOKEN,
    },
});

const runtimes = new Map();

function nowIso() {
    return new Date().toISOString();
}

function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function logEvent(level, event, payload = {}) {
    const entry = {
        ts: nowIso(),
        level,
        service: SERVICE_NAME,
        event,
        tenant_id: payload.tenant_id ?? null,
        session_name: payload.session_name ?? null,
        connection_status: payload.connection_status ?? null,
        auto_connect: payload.auto_connect ?? null,
        reason: payload.reason ?? null,
        meta: payload.meta ?? null,
    };

    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(entry));
}

process.on('unhandledRejection', (reason) => {
    logEvent('error', 'runtime.unhandled_rejection', {
        reason: 'unhandled_rejection',
        meta: {
            detail: String(reason?.stack || reason?.message || reason || 'unknown'),
        },
    });
});

process.on('uncaughtException', (error) => {
    logEvent('error', 'runtime.uncaught_exception', {
        reason: 'uncaught_exception',
        meta: {
            detail: String(error?.stack || error?.message || error || 'unknown'),
        },
    });
});

function isAuthorized(req) {
    const byHeader = req.header('X-Internal-Token') || '';
    const byBearer = (req.header('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!INTERNAL_TOKEN) {
        return false;
    }

    return byHeader === INTERNAL_TOKEN || byBearer === INTERNAL_TOKEN;
}

function requireInternalToken(req, res, next) {
    if (!isAuthorized(req)) {
        return res.status(403).json({
            ok: false,
            error: { code: 'FORBIDDEN', message: 'Invalid internal token.' },
        });
    }

    return next();
}

function toSessionName(tenantId) {
    const asNumber = Number(tenantId);
    if (!Number.isFinite(asNumber) || asNumber < 1) {
        return `tenant-${tenantId}`;
    }

    return `tenant-${asNumber.toString(16)}`;
}

function sessionDirName(sessionName) {
    return `session-${sessionName}`;
}

function sessionDirPath(sessionName) {
    return path.join(AUTH_DIR, sessionDirName(sessionName));
}

function purgeAuthArtifacts(sessionName) {
    const target = sessionDirPath(sessionName);
    const resolvedTarget = path.resolve(target);
    const resolvedRoot = path.resolve(AUTH_DIR);
    if (!resolvedTarget.startsWith(resolvedRoot)) {
        return false;
    }

    if (!fs.existsSync(resolvedTarget)) {
        return false;
    }

    fs.rmSync(resolvedTarget, { recursive: true, force: true });
    return true;
}

function isRestoreableStatus(status) {
    return status === 'connecting' || status === 'connected';
}

function isRestoreEligible(connectionStatus, autoConnect) {
    return autoConnect === true && isRestoreableStatus(String(connectionStatus || '').toLowerCase());
}

function isLogoutLikeReason(reason) {
    const text = String(reason || '').toLowerCase();
    return text.includes('logout')
        || text.includes('logged out')
        || text.includes('replaced')
        || text.includes('restart required');
}

function isSupportedJid(jid) {
    return /^\d{6,20}@(c|g|lid)\.us$/.test((jid || '').trim());
}

function isBrowserLockError(error) {
    const text = String(error?.message || error || '').toLowerCase();
    return text.includes('browser is already running')
        || text.includes('used by another process')
        || text.includes('userdatadir');
}

async function killSessionBrowserProcesses(sessionName) {
    const targetDir = sessionDirPath(sessionName);
    if (process.platform === 'win32') {
        const escapedDir = targetDir.replace(/'/g, "''").toLowerCase();
        const script = [
            `$needle = '${escapedDir}'`,
            '$killed = @()',
            'Get-CimInstance Win32_Process | Where-Object {',
            "  $_.CommandLine -and $_.CommandLine.ToLower().Contains($needle) -and $_.Name -match '^(chrome|chromium|msedge|chrome-headless-shell)\\.exe$'",
            '} | ForEach-Object {',
            '  try {',
            '    Stop-Process -Id $_.ProcessId -Force -ErrorAction Stop',
            '    $killed += $_.ProcessId',
            '  } catch {}',
            '}',
            'Write-Output ($killed.Count)',
        ].join('; ');

        try {
            const { stdout } = await execFileAsync('powershell', ['-NoProfile', '-Command', script], { timeout: 10000 });
            return Number.parseInt(String(stdout || '').trim(), 10) || 0;
        } catch {
            return 0;
        }
    }

    try {
        await execFileAsync('pkill', ['-f', targetDir], { timeout: 10000 });
        return 1;
    } catch {
        return 0;
    }
}

async function safeDestroyClient(runtime) {
    if (!runtime?.client) {
        return;
    }

    try {
        await runtime.client.destroy();
    } catch {
        // swallow: safe cleanup path
    }
    runtime.client = null;
}

async function postSessionState(tenantId, patch) {
    const runtime = runtimes.get(String(tenantId));
    const connectionStatus = String(patch.connection_status || '').toLowerCase();
    const autoConnect = typeof patch.auto_connect === 'boolean' ? patch.auto_connect : null;
    const normalizedMeta = {
        ...(patch.meta && typeof patch.meta === 'object' ? patch.meta : {}),
    };

    if (typeof normalizedMeta.lifecycle_state !== 'string' && typeof normalizedMeta.disconnect_reason === 'string') {
        normalizedMeta.lifecycle_state = normalizedMeta.disconnect_reason;
    }
    if (connectionStatus === 'connecting' && typeof normalizedMeta.lifecycle_state !== 'string') {
        normalizedMeta.lifecycle_state = 'connecting';
    }
    if (connectionStatus === 'connected' && typeof normalizedMeta.lifecycle_state !== 'string') {
        normalizedMeta.lifecycle_state = 'connected';
    }
    if (typeof autoConnect === 'boolean') {
        normalizedMeta.restore_eligible = isRestoreEligible(connectionStatus, autoConnect);
    } else if (connectionStatus === 'disconnected') {
        normalizedMeta.restore_eligible = false;
    }

    const payload = {
        tenant_id: Number(tenantId),
        connection_status: patch.connection_status,
        connected_jid: patch.connected_jid ?? null,
        meta: Object.keys(normalizedMeta).length > 0 ? normalizedMeta : null,
        auto_connect: typeof autoConnect === 'boolean' ? autoConnect : undefined,
    };

    const maxAttempts = Math.max(1, CALLBACK_MAX_ATTEMPTS);
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
            await callbackHttp.post('/internal/v1/whatsapp/session-state', payload);
            logEvent('info', 'session.state.callback.sent', {
                tenant_id: Number(tenantId),
                session_name: runtime?.sessionName ?? toSessionName(tenantId),
                connection_status: patch.connection_status ?? null,
                auto_connect: typeof patch.auto_connect === 'boolean' ? patch.auto_connect : null,
                meta: {
                    connected_jid: patch.connected_jid ?? null,
                    attempt,
                },
            });
            return true;
        } catch (error) {
            const status = error.response?.status || null;
            const detail = error.response?.data || error.message;
            if (attempt < maxAttempts) {
                logEvent('warn', 'session.state.callback.retrying', {
                    tenant_id: Number(tenantId),
                    session_name: runtime?.sessionName ?? toSessionName(tenantId),
                    connection_status: patch.connection_status ?? null,
                    auto_connect: typeof patch.auto_connect === 'boolean' ? patch.auto_connect : null,
                    reason: 'callback_error',
                    meta: {
                        attempt,
                        max_attempts: maxAttempts,
                        status,
                        error: detail,
                    },
                });
                const delay = CALLBACK_RETRY_DELAYS_MS[Math.min(attempt - 1, CALLBACK_RETRY_DELAYS_MS.length - 1)];
                // eslint-disable-next-line no-await-in-loop
                await wait(delay);
                continue;
            }

            logEvent('error', 'session.state.callback.failed_final', {
                tenant_id: Number(tenantId),
                session_name: runtime?.sessionName ?? toSessionName(tenantId),
                connection_status: patch.connection_status ?? null,
                auto_connect: typeof patch.auto_connect === 'boolean' ? patch.auto_connect : null,
                reason: 'callback_error',
                meta: {
                    attempt,
                    max_attempts: maxAttempts,
                    status,
                    error: detail,
                },
            });
            return false;
        }
    }

    return false;
}

async function postMessage(payload) {
    try {
        await callbackHttp.post('/internal/v1/whatsapp/messages', payload);
    } catch (error) {
        const detail = error.response?.data || error.message;
        // eslint-disable-next-line no-console
        console.error('[DEBUG] Failed to send messages callback', payload.tenant_id, detail);
    }
}

function ensureRuntime(tenantId, sessionName) {
    const key = String(tenantId);
    const existing = runtimes.get(key);
    if (existing) {
        return existing;
    }

    const runtime = {
        tenantId: Number(tenantId),
        sessionName: sessionName || toSessionName(tenantId),
        status: 'disconnected',
        connectedJid: null,
        client: null,
        initializing: false,
        connectTimeoutRef: null,
        isStopping: false,
    };

    runtimes.set(key, runtime);
    return runtime;
}

function clearConnectTimeout(runtime) {
    if (runtime.connectTimeoutRef) {
        clearTimeout(runtime.connectTimeoutRef);
        runtime.connectTimeoutRef = null;
    }
}

function scheduleConnectTimeout(runtime) {
    clearConnectTimeout(runtime);

    runtime.connectTimeoutRef = setTimeout(async () => {
        if (runtime.status !== 'connecting' || runtime.isStopping) {
            return;
        }

        logEvent('warn', 'session.connect.timeout', {
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            auto_connect: false,
            reason: 'qr_timeout',
        });

        runtime.isStopping = true;
        try {
            if (runtime.client) {
                await runtime.client.destroy();
            }
        } catch (error) {
            const detail = error.response?.data || error.message;
            logEvent('error', 'session.destroy.failed', {
                tenant_id: runtime.tenantId,
                session_name: runtime.sessionName,
                connection_status: runtime.status,
                reason: 'destroy_after_timeout_failed',
                meta: { error: detail },
            });
        } finally {
            runtime.client = null;
            runtime.status = 'disconnected';
            runtime.connectedJid = null;
            clearConnectTimeout(runtime);

            await postSessionState(runtime.tenantId, {
                connection_status: 'disconnected',
                connected_jid: null,
                auto_connect: false,
                meta: {
                    disconnect_reason: 'qr_timeout',
                    lifecycle_state: 'qr_timeout',
                    restore_eligible: false,
                    disconnected_at: nowIso(),
                },
            });

            setTimeout(() => {
                runtime.isStopping = false;
            }, 5000);
        }
    }, CONNECTING_TIMEOUT_MS);
}

function registerClientHandlers(runtime) {
    const { client, tenantId } = runtime;

    client.on('qr', async (qrText) => {
        runtime.status = 'connecting';
        runtime.connectedJid = null;
        logEvent('info', 'session.qr.generated', {
            tenant_id: tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            meta: {
                qr_length: String(qrText || '').length,
            },
        });

        qrcode.generate(qrText, { small: true });
        let qrDataUrl = null;
        try {
            qrDataUrl = await qrImage.toDataURL(qrText, { errorCorrectionLevel: 'M', margin: 2, scale: 8 });
        } catch (_error) {
            qrDataUrl = null;
        }

        await postSessionState(tenantId, {
            connection_status: 'connecting',
            connected_jid: null,
            meta: {
                has_qr: true,
                qr_text: qrText,
                qr_data_url: qrDataUrl,
                qr_generated_at: nowIso(),
            },
        });
    });

    client.on('authenticated', async () => {
        runtime.status = 'connecting';
        logEvent('info', 'session.authenticated', {
            tenant_id: tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
        });
        await postSessionState(tenantId, {
            connection_status: 'connecting',
            connected_jid: null,
            auto_connect: true,
            meta: {
                authenticated_at: nowIso(),
            },
        });
    });

    client.on('ready', async () => {
        runtime.status = 'connected';
        runtime.connectedJid = client.info?.wid?._serialized || null;
        clearConnectTimeout(runtime);
        logEvent('info', 'session.ready', {
            tenant_id: tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            meta: {
                connected_jid: runtime.connectedJid,
            },
        });
        await postSessionState(tenantId, {
            connection_status: 'connected',
            connected_jid: runtime.connectedJid,
            auto_connect: true,
            meta: {
                ready_at: nowIso(),
            },
        });
    });

    client.on('auth_failure', async (message) => {
        runtime.status = 'disconnected';
        runtime.connectedJid = null;
        clearConnectTimeout(runtime);
        const authPurged = purgeAuthArtifacts(runtime.sessionName);
        if (authPurged) {
            logEvent('warn', 'session.auth.purged', {
                tenant_id: tenantId,
                session_name: runtime.sessionName,
                reason: 'remote_logout',
            });
        }
        logEvent('warn', 'session.disconnected', {
            tenant_id: tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            auto_connect: false,
            reason: 'remote_logout',
            meta: {
                detail: String(message || ''),
            },
        });
        await postSessionState(tenantId, {
            connection_status: 'disconnected',
            connected_jid: null,
            auto_connect: false,
            meta: {
                disconnect_reason: 'remote_logout',
                lifecycle_state: 'remote_logout',
                restore_eligible: false,
                auth_failure_at: nowIso(),
                reason: String(message || ''),
            },
        });
    });

    client.on('disconnected', async (reason) => {
        if (runtime.isStopping) {
            return;
        }

        runtime.status = 'disconnected';
        runtime.connectedJid = null;
        clearConnectTimeout(runtime);
        const logoutLike = isLogoutLikeReason(reason);
        if (logoutLike) {
            const authPurged = purgeAuthArtifacts(runtime.sessionName);
            if (authPurged) {
                logEvent('warn', 'session.auth.purged', {
                    tenant_id: tenantId,
                    session_name: runtime.sessionName,
                    reason: 'remote_logout',
                });
            }
        }
        logEvent('warn', 'session.disconnected', {
            tenant_id: tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            reason: logoutLike ? 'remote_logout' : 'service_disconnected',
            meta: {
                detail: String(reason || ''),
            },
        });
        await postSessionState(tenantId, {
            connection_status: 'disconnected',
            connected_jid: null,
            auto_connect: logoutLike ? false : undefined,
            meta: {
                disconnect_reason: logoutLike ? 'remote_logout' : 'service_disconnected',
                lifecycle_state: logoutLike ? 'remote_logout' : 'service_disconnected',
                disconnected_at: nowIso(),
                reason: String(reason || ''),
            },
        });
    });

    client.on('message', async (message) => {
        if (message.fromMe) {
            return;
        }

        await postMessage({
            tenant_id: tenantId,
            direction: 'incoming',
            whatsapp_message_id: message.id?._serialized || `incoming-${Date.now()}`,
            sender_jid: message.from || null,
            recipient_jid: message.to || runtime.connectedJid,
            payload: {
                text: message.body || '',
                type: message.type || 'chat',
                timestamp: message.timestamp || null,
            },
        });
    });
}

async function startSession(tenantId, sessionName) {
    const runtime = ensureRuntime(tenantId, sessionName);
    logEvent('info', 'session.connect.requested', {
        tenant_id: runtime.tenantId,
        session_name: runtime.sessionName,
        connection_status: runtime.status,
        auto_connect: true,
    });

    if (runtime.initializing || runtime.status === 'connected') {
        logEvent('info', 'session.connect.skipped', {
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            reason: runtime.initializing ? 'initializing' : 'already_connected',
        });

        await postSessionState(tenantId, {
            connection_status: runtime.status,
            connected_jid: runtime.connectedJid,
            auto_connect: true,
            meta: {
                lifecycle_state: runtime.status,
                restore_eligible: true,
            },
        });

        return runtime;
    }

    runtime.initializing = true;
    runtime.isStopping = false;
    runtime.status = 'connecting';
    logEvent('info', 'session.connect.starting', {
        tenant_id: runtime.tenantId,
        session_name: runtime.sessionName,
        connection_status: runtime.status,
        auto_connect: true,
    });
    scheduleConnectTimeout(runtime);

    await postSessionState(tenantId, {
        connection_status: 'connecting',
        connected_jid: null,
        auto_connect: true,
        meta: {
            connect_requested_at: nowIso(),
            lifecycle_state: 'connecting',
            restore_eligible: true,
        },
    });

    if (!runtime.client) {
        runtime.client = new Client({
            authStrategy: new LocalAuth({
                clientId: runtime.sessionName,
                dataPath: AUTH_DIR,
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            },
        });

        registerClientHandlers(runtime);
    }

    try {
        await runtime.client.initialize();
    } catch (error) {
        logEvent('error', 'session.initialize.failed', {
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            reason: 'initialize_failed',
            meta: {
                error: String(error?.message || error || 'unknown'),
            },
        });

        if (isBrowserLockError(error)) {
            logEvent('warn', 'session.browser_lock.detected', {
                tenant_id: runtime.tenantId,
                session_name: runtime.sessionName,
                connection_status: runtime.status,
                reason: 'browser_lock',
            });

            await safeDestroyClient(runtime);
            const killed = await killSessionBrowserProcesses(runtime.sessionName);
            runtime.client = new Client({
                authStrategy: new LocalAuth({
                    clientId: runtime.sessionName,
                    dataPath: AUTH_DIR,
                }),
                puppeteer: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                },
            });
            registerClientHandlers(runtime);

            try {
                await runtime.client.initialize();
                logEvent('warn', 'session.browser_lock.recovered', {
                    tenant_id: runtime.tenantId,
                    session_name: runtime.sessionName,
                    connection_status: runtime.status,
                    reason: 'browser_lock_recovered',
                    meta: {
                        killed_process_count: killed,
                    },
                });
                return runtime;
            } catch (retryError) {
                logEvent('error', 'session.browser_lock.recover_failed', {
                    tenant_id: runtime.tenantId,
                    session_name: runtime.sessionName,
                    connection_status: runtime.status,
                    reason: 'browser_lock_recover_failed',
                    meta: {
                        error: String(retryError?.message || retryError || 'unknown'),
                        killed_process_count: killed,
                    },
                });

                runtime.status = 'disconnected';
                runtime.connectedJid = null;
                clearConnectTimeout(runtime);
                await postSessionState(runtime.tenantId, {
                    connection_status: 'disconnected',
                    connected_jid: null,
                    auto_connect: false,
                    meta: {
                        disconnect_reason: 'browser_lock',
                        lifecycle_state: 'service_disconnected',
                        restore_eligible: false,
                        disconnected_at: nowIso(),
                    },
                });

                throw retryError;
            }
        }

        throw error;
    } finally {
        runtime.initializing = false;
    }

    return runtime;
}

async function stopSession(tenantId, options = {}) {
    const reason = options.reason || 'manual_disconnect';
    const shouldLogout = options.logout === true;
    const shouldPurgeAuth = options.purge_auth === true;
    const runtime = ensureRuntime(tenantId);
    runtime.isStopping = true;
    clearConnectTimeout(runtime);

    const stopEvent = reason === 'manual_remove' ? 'session.removed.manual' : 'session.stopped.manual';
    logEvent('info', stopEvent, {
        tenant_id: runtime.tenantId,
        session_name: runtime.sessionName,
        connection_status: runtime.status,
        auto_connect: false,
        reason,
    });

    if (runtime.client) {
        try {
            if (shouldLogout && typeof runtime.client.logout === 'function') {
                await runtime.client.logout();
            }
            await runtime.client.destroy();
        } catch (error) {
            const detail = error.response?.data || error.message;
            logEvent('error', 'session.destroy.failed', {
                tenant_id: runtime.tenantId,
                session_name: runtime.sessionName,
                connection_status: runtime.status,
                reason: shouldLogout ? 'manual_remove_failed' : 'manual_destroy_failed',
                meta: { error: detail },
            });
        }
    }

    runtime.client = null;
    runtime.status = 'disconnected';
    runtime.connectedJid = null;

    if (shouldPurgeAuth) {
        const removed = purgeAuthArtifacts(runtime.sessionName);
        if (removed) {
            logEvent('info', 'session.auth.purged', {
                tenant_id: runtime.tenantId,
                session_name: runtime.sessionName,
                reason,
            });
        }
    }

    await postSessionState(tenantId, {
        connection_status: 'disconnected',
        connected_jid: null,
        auto_connect: false,
        meta: {
            disconnect_reason: reason,
            lifecycle_state: reason,
            restore_eligible: false,
            disconnected_at: nowIso(),
            disconnected_by_api_at: nowIso(),
        },
    });

    setTimeout(() => {
        runtime.isStopping = false;
    }, 5000);

    return runtime;
}

app.get('/health', (_req, res) => {
    const sessions = Array.from(runtimes.values()).map((runtime) => ({
        tenant_id: runtime.tenantId,
        session_name: runtime.sessionName,
        connection_status: runtime.status,
        connected_jid: runtime.connectedJid,
    }));

    res.json({
        ok: true,
        service: 'tenant-whatsapp-service',
        sessions,
    });
});

app.use('/api/v1', requireInternalToken);

function asyncRoute(handler) {
    return async (req, res) => {
        try {
            await handler(req, res);
        } catch (error) {
            logEvent('error', 'http.request.failed', {
                tenant_id: Number(req.params?.tenantId) || null,
                session_name: req.body?.session_name || null,
                reason: 'request_failed',
                meta: {
                    path: req.path,
                    method: req.method,
                    error: String(error?.message || error || 'unknown'),
                },
            });
            if (!res.headersSent) {
                res.status(500).json({
                    ok: false,
                    error: {
                        code: 'INTERNAL_ERROR',
                        message: 'Failed to process request.',
                    },
                });
            }
        }
    };
}

app.get('/api/v1/tenants/:tenantId/whatsapp/session', (req, res) => {
    const tenantId = Number(req.params.tenantId);
    const runtime = ensureRuntime(tenantId);

    res.json({
        ok: true,
        data: {
            session: {
                tenant_id: runtime.tenantId,
                session_name: runtime.sessionName,
                connection_status: runtime.status,
                connected_jid: runtime.connectedJid,
            },
        },
    });
});

app.post('/api/v1/tenants/:tenantId/whatsapp/session/connect', asyncRoute(async (req, res) => {
    const tenantId = Number(req.params.tenantId);
    const sessionName = req.body?.session_name || toSessionName(tenantId);
    const runtime = ensureRuntime(tenantId, sessionName);

    startSession(tenantId, sessionName).catch((error) => {
        logEvent('error', 'session.connect.background_failed', {
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            reason: 'background_start_failed',
            meta: {
                error: String(error?.message || error || 'unknown'),
            },
        });
    });

    res.status(202).json({
        ok: true,
        data: {
            status: 'accepted',
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: 'connecting',
        },
    });
}));

app.post('/api/v1/tenants/:tenantId/whatsapp/session/disconnect', asyncRoute(async (req, res) => {
    const tenantId = Number(req.params.tenantId);
    const runtime = await stopSession(tenantId, { reason: 'manual_disconnect' });

    res.json({
        ok: true,
        data: {
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
        },
    });
}));

app.post('/api/v1/tenants/:tenantId/whatsapp/session/remove', asyncRoute(async (req, res) => {
    const tenantId = Number(req.params.tenantId);
    const runtime = await stopSession(tenantId, {
        reason: 'manual_remove',
        logout: true,
        purge_auth: true,
    });

    res.json({
        ok: true,
        data: {
            tenant_id: runtime.tenantId,
            session_name: runtime.sessionName,
            connection_status: runtime.status,
            removed: true,
        },
    });
}));

app.post('/api/v1/tenants/:tenantId/whatsapp/messages/send', asyncRoute(async (req, res) => {
    const tenantId = Number(req.params.tenantId);
    const runtime = ensureRuntime(tenantId);
    const to = String(req.body?.to || '').trim();
    const message = String(req.body?.message || '');
    const notificationKey = req.body?.notification_key || null;

    if (!isSupportedJid(to)) {
        return res.status(422).json({
            ok: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid destination JID.',
                details: { to },
            },
        });
    }

    if (!message) {
        return res.status(422).json({
            ok: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Message is required.',
            },
        });
    }

    if (!runtime.client || runtime.status !== 'connected') {
        return res.status(422).json({
            ok: false,
            error: {
                code: 'WHATSAPP_NOT_CONNECTED',
                message: 'Session is not connected.',
            },
        });
    }

    try {
        const sent = await runtime.client.sendMessage(to, message);
        const messageId = sent.id?._serialized || `outgoing-${Date.now()}`;

        // Run asynchronously without awaiting to prevent deadlocking PHP workers and to avoid exceeding Laravel's UI timeout.
        postMessage({
            tenant_id: tenantId,
            direction: 'outgoing',
            whatsapp_message_id: messageId,
            sender_jid: runtime.connectedJid,
            recipient_jid: to,
            payload: {
                text: message,
                type: sent.type || 'chat',
                delivery: 'queued',
                notification_key: notificationKey,
            },
        });

        return res.json({
            ok: true,
            data: {
                queued: true,
                delivery: 'queued',
                message_id: messageId,
                to,
            },
        });
    } catch (error) {
        const detail = error.response?.data || error.message;
        // eslint-disable-next-line no-console
        console.error('Failed to send message', tenantId, detail);

        return res.status(500).json({
            ok: false,
            error: {
                code: 'SEND_FAILED',
                message: 'Failed to send message through WhatsApp client.',
            },
        });
    }
}));

async function restoreSessions() {
    if (!INTERNAL_TOKEN) {
        logEvent('error', 'restore.failed', {
            reason: 'missing_internal_token',
        });
        return;
    }

    logEvent('info', 'restore.evaluate.start');

    try {
        const allRowsResponse = await callbackHttp.get('/internal/v1/whatsapp/sessions', {
            params: { include_all: true },
        });
        const eligibleRowsResponse = await callbackHttp.get('/internal/v1/whatsapp/sessions', {
            params: { eligible_only: true },
        });
        const sessions = allRowsResponse.data?.data?.sessions || [];
        const eligibleRows = eligibleRowsResponse.data?.data?.sessions || [];
        const eligibleBySession = new Map(
            eligibleRows.map((row) => [row.session_name || toSessionName(row.tenant_id), row])
        );
        const knownSessionNames = new Set(
            sessions.map((session) => session.session_name || toSessionName(session.tenant_id))
        );
        const authDirs = fs.readdirSync(AUTH_DIR, { withFileTypes: true })
            .filter((entry) => entry.isDirectory() && entry.name.startsWith('session-'))
            .map((entry) => entry.name);

        for (const authDir of authDirs) {
            const sessionName = authDir.replace(/^session-/, '');
            if (knownSessionNames.has(sessionName)) {
                continue;
            }

            const removed = purgeAuthArtifacts(sessionName);
            if (removed) {
                logEvent('warn', 'orphan_auth_removed', {
                    session_name: sessionName,
                    reason: 'missing_db_row',
                });
            }
        }

        let startedCount = 0;
        let skippedCount = 0;
        for (const session of sessions) {
            const sessionName = session.session_name || toSessionName(session.tenant_id);
            const isEligible = eligibleBySession.has(sessionName);
            const lifecycleState = typeof session?.meta?.lifecycle_state === 'string'
                ? session.meta.lifecycle_state
                : (typeof session?.meta?.disconnect_reason === 'string' ? session.meta.disconnect_reason : null);
            logEvent('info', 'restore.row.evaluated', {
                tenant_id: Number(session.tenant_id),
                session_name: sessionName,
                connection_status: session.connection_status ?? null,
                auto_connect: Boolean(session.auto_connect),
                meta: {
                    restore_eligible: isEligible,
                    lifecycle_state: lifecycleState,
                },
            });

            if (!isEligible) {
                skippedCount += 1;
                const reason = lifecycleState || (!session.auto_connect ? 'auto_connect_false' : 'status_not_restoreable');
                logEvent('warn', 'restore.row.not_eligible', {
                    tenant_id: Number(session.tenant_id),
                    session_name: sessionName,
                    connection_status: session.connection_status ?? null,
                    auto_connect: Boolean(session.auto_connect),
                    reason,
                    meta: {
                        attempted_restore: false,
                    },
                });
                continue;
            }
            const eligibleRow = eligibleBySession.get(sessionName);
            const tenantId = Number(eligibleRow.tenant_id);
            logEvent('info', 'restore.row.starting', {
                tenant_id: tenantId,
                session_name: sessionName,
                connection_status: 'connecting',
                auto_connect: true,
            });
            await startSession(tenantId, sessionName);
            startedCount += 1;
        }

        logEvent('info', 'restore.evaluate.completed', {
            meta: {
                evaluated: sessions.length,
                eligible: eligibleRows.length,
                started: startedCount,
                skipped: skippedCount,
            },
        });
    } catch (error) {
        const detail = error.response?.data || error.message;
        logEvent('error', 'restore.failed', {
            reason: 'restore_request_failed',
            meta: {
                error: detail,
            },
        });
    }
}

app.listen(PORT, async () => {
    logEvent('info', 'service.started', {
        meta: {
            port: PORT,
            callback_url: APP_CALLBACK_URL,
        },
    });
    await restoreSessions();
});
