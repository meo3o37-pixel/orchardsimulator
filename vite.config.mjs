import { defineConfig, loadEnv } from 'vite';
import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const ANIMATION_LAB_PRESET_FILE = path.resolve(process.cwd(), 'src/data/animationLabPresets.js');
const ANIMATION_LAB_DATA_DIR = path.resolve(process.cwd(), 'src/data');
const EXTERNAL_MAP_DATA_FILE = path.resolve(process.cwd(), 'src/data/external-map-data.json');
const FIELD_MAP_300_SAVED_PRESET_FILE = path.resolve(process.cwd(), 'src/features/fieldMap300/fieldMap300SavedPreset.json');
const FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE = path.resolve(process.cwd(), 'src/features/fieldMap300/fieldMap300FacilityCatalogOverrides.json');
const BUG_REPORT_FILE = path.resolve(process.cwd(), 'data/bug-reports.jsonl');
const GAME_ACTION_LOG_DIR = path.resolve(process.cwd(), 'data/game-logs');
const CHAT_MESSAGES_FILE = path.resolve(process.cwd(), 'data/chat-messages.jsonl');
const AUTH_LOGIN_LOG_FILE = path.resolve(process.cwd(), 'data/account-login-logs.jsonl');
const AUTH_SESSIONS_FILE = path.resolve(process.cwd(), 'data/auth-sessions.json');
const DEV_MODAL_LAYOUT_DIR = path.resolve(process.cwd(), 'data/dev-modal-layout');
const UPDATE_PLAN_FILE = path.resolve(process.cwd(), 'data/update-plan.json');
const ACCOUNTS_FILE = path.resolve(process.cwd(), 'data/accounts.json');
const ACCOUNT_SAVES_DIR = path.resolve(process.cwd(), 'data/account-saves');
const ACCOUNT_SAVE_SLOT_COUNT = 6;
const UPDATE_PLAN_ADMIN_USERNAMES = new Set(['meo3o']);
const normalizeWatchFilePath = (filePath) => path.resolve(String(filePath || '')).replace(/\\/g, '/').toLowerCase();
const SUPPRESSED_HOT_UPDATES = new Set();
const ANIMATION_LAB_PRESET_FILE_KEY = normalizeWatchFilePath(ANIMATION_LAB_PRESET_FILE);
const EXTERNAL_MAP_DATA_FILE_KEY = normalizeWatchFilePath(EXTERNAL_MAP_DATA_FILE);
const FIELD_MAP_300_SAVED_PRESET_FILE_KEY = normalizeWatchFilePath(FIELD_MAP_300_SAVED_PRESET_FILE);
const FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE_KEY = normalizeWatchFilePath(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE);
const PRESENCE_TTL_MS = 45 * 1000;
const RECENT_VISITOR_WINDOW_MS = 10 * 60 * 1000;
const CHAT_HISTORY_LIMIT = 80;
const CHAT_MAX_MESSAGE_LENGTH = 240;
const CHAT_TIME_ZONE = 'Asia/Seoul';
const CHAT_EVENT_SEND = 'orchard:chat_send';
const CHAT_EVENT_MESSAGE = 'orchard:chat_message';
const CHAT_EVENT_DELETE = 'orchard:chat_delete';
const CHAT_EVENT_ERROR = 'orchard:chat_error';
const DEFAULT_LM_STUDIO_BASE_URL = 'http://192.168.0.4:1234';
let LM_STUDIO_BASE_URL = DEFAULT_LM_STUDIO_BASE_URL;
let LM_STUDIO_CHAT_API_URL = `${LM_STUDIO_BASE_URL}/v1/chat/completions`;
let LM_STUDIO_MODELS_API_URL = `${LM_STUDIO_BASE_URL}/v1/models`;
let LM_STUDIO_NATIVE_CHAT_API_URL = `${LM_STUDIO_BASE_URL}/api/v1/chat`;
let LM_STUDIO_API_AUTH_TOKEN = '';
const STATIC_ASSET_CACHE_EXTENSIONS = new Set([
  '.apng',
  '.avif',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.m4a',
  '.mp3',
  '.mp4',
  '.oga',
  '.ogg',
  '.otf',
  '.png',
  '.svg',
  '.ttf',
  '.wav',
  '.webm',
  '.webp',
  '.woff',
  '.woff2'
]);
const DEV_STATIC_ASSET_CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400';
const PREVIEW_HASHED_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';
const PREVIEW_STATIC_ASSET_CACHE_CONTROL = 'public, max-age=604800, stale-while-revalidate=86400';
const LM_STUDIO_PHONE_HELPER_MODEL_FALLBACKS = Object.freeze([
  'qwen/qwen3.5-9b',
  'qwen/qwen3-vl-8b',
  'google/gemma-4-e4b',
  'google/gemma-4-12b-qat'
]);
const lmStudioReasoningOffLikelySupportedByModelId = (modelId = '') => {
  const normalizedModelId = String(modelId || '').trim().toLowerCase();
  if (!normalizedModelId) return false;
  return (
    normalizedModelId === 'qwen/qwen3.5-9b'
    || normalizedModelId === 'qwen/qwen3-vl-8b'
    || normalizedModelId === 'qwen/qwen3.6-27b'
    || normalizedModelId.startsWith('qwen/qwen3')
  );
};
const livePresenceByViewerId = new Map();
const accountSessionByToken = new Map();
const accountActiveTokenByUserId = new Map();
const AUTH_COOKIE_NAME = 'orchard_auth_token';
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const AUTH_SESSION_MAX_AGE_MS = AUTH_COOKIE_MAX_AGE_SECONDS * 1000;
let cachedChatMessages = [];
let cachedChatMessagesLoaded = false;

const cleanupPresenceMap = (now = Date.now()) => {
  livePresenceByViewerId.forEach((entry, viewerId) => {
    if (!entry || ((now - Number(entry.lastSeenAt || 0)) > RECENT_VISITOR_WINDOW_MS)) {
      livePresenceByViewerId.delete(viewerId);
    }
  });
};

const buildPresenceSummary = () => {
  const now = Date.now();
  cleanupPresenceMap(now);
  const onlineUserSet = new Set();
  const recentUserSet = new Set();
  const onlineUsernameSet = new Set();
  livePresenceByViewerId.forEach((entry) => {
    const ageMs = now - Number(entry?.lastSeenAt || 0);
    const userKey = String(entry?.userId || '').trim() || String(entry?.username || '').trim();
    const username = String(entry?.username || '').trim();
    if (!userKey) return;
    if (ageMs <= PRESENCE_TTL_MS) {
      onlineUserSet.add(userKey);
      if (username) onlineUsernameSet.add(username);
    }
    if (ageMs <= RECENT_VISITOR_WINDOW_MS) recentUserSet.add(userKey);
  });
  return {
    ok: true,
    enabled: true,
    onlineCount: onlineUserSet.size,
    recentCount: recentUserSet.size,
    onlineUsernames: [...onlineUsernameSet].sort((a, b) => a.localeCompare(b, 'ko')),
    updatedAt: now
  };
};

const readJsonFile = async (filePath, fallbackValue) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw) return fallbackValue;
    try {
      return JSON.parse(raw);
    } catch (parseError) {
      const repairedRaw = recoverLeadingJsonDocument(raw);
      if (!repairedRaw) throw parseError;
      const backupPath = `${filePath}.broken-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      await fs.copyFile(filePath, backupPath);
      await fs.writeFile(filePath, repairedRaw, 'utf8');
      return JSON.parse(repairedRaw);
    }
  } catch (error) {
    if (error?.code === 'ENOENT') return fallbackValue;
    throw error;
  }
};

const recoverLeadingJsonDocument = (rawValue) => {
  const raw = String(rawValue || '').replace(/^\uFEFF/, '');
  const trimmed = raw.trimStart();
  if (!trimmed) return '';
  const firstChar = trimmed[0];
  if (firstChar !== '{' && firstChar !== '[') return null;
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let index = 0; index < trimmed.length; index += 1) {
    const char = trimmed[index];
    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === '{' || char === '[') {
      depth += 1;
      continue;
    }
    if (char === '}' || char === ']') {
      depth -= 1;
      if (depth === 0) {
        const candidate = trimmed.slice(0, index + 1);
        const trailing = trimmed.slice(index + 1).trim();
        if (trailing) return `${candidate}\n`;
        return null;
      }
    }
  }
  return null;
};

const sanitizeAuthSessionRecord = (entry) => {
  const token = String(entry?.token || '').trim();
  const userId = String(entry?.userId || '').trim();
  const username = String(entry?.username || '').trim();
  const createdAt = Number(entry?.createdAt || 0);
  if (!token || !userId || !username || !Number.isFinite(createdAt) || createdAt <= 0) return null;
  return { token, userId, username, createdAt };
};

const pruneExpiredAuthSessions = (now = Date.now()) => {
  let changed = false;
  accountSessionByToken.forEach((session, token) => {
    const createdAt = Number(session?.createdAt || 0);
    if (!Number.isFinite(createdAt) || createdAt <= 0 || (now - createdAt) > AUTH_SESSION_MAX_AGE_MS) {
      accountSessionByToken.delete(token);
      changed = true;
    }
  });
  accountActiveTokenByUserId.forEach((token, userId) => {
    const session = accountSessionByToken.get(String(token || '').trim()) || null;
    if (!session || String(session.userId || '') !== String(userId || '')) {
      accountActiveTokenByUserId.delete(userId);
      changed = true;
    }
  });
  return changed;
};

const persistAuthSessionStore = () => {
  pruneExpiredAuthSessions();
  const payload = {
    version: 1,
    sessions: [...accountSessionByToken.values()]
      .map((entry) => sanitizeAuthSessionRecord(entry))
      .filter(Boolean)
  };
  fsSync.mkdirSync(path.dirname(AUTH_SESSIONS_FILE), { recursive: true });
  const tempPath = `${AUTH_SESSIONS_FILE}.tmp-${process.pid}-${Date.now()}-${randomBytes(4).toString('hex')}`;
  fsSync.writeFileSync(tempPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fsSync.renameSync(tempPath, AUTH_SESSIONS_FILE);
};

const loadAuthSessionStore = () => {
  try {
    const raw = fsSync.readFileSync(AUTH_SESSIONS_FILE, 'utf8');
    if (!String(raw || '').trim()) return;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      const repairedRaw = recoverLeadingJsonDocument(raw);
      if (!repairedRaw) throw parseError;
      parsed = JSON.parse(repairedRaw);
    }
    const sessions = Array.isArray(parsed?.sessions) ? parsed.sessions : [];
    accountSessionByToken.clear();
    accountActiveTokenByUserId.clear();
    for (const rawSession of sessions) {
      const session = sanitizeAuthSessionRecord(rawSession);
      if (!session) continue;
      const previousToken = accountActiveTokenByUserId.get(session.userId);
      const previousSession = previousToken ? accountSessionByToken.get(previousToken) : null;
      if (previousSession && Number(previousSession.createdAt || 0) > session.createdAt) continue;
      if (previousToken) accountSessionByToken.delete(previousToken);
      accountSessionByToken.set(session.token, session);
      accountActiveTokenByUserId.set(session.userId, session.token);
    }
    if (pruneExpiredAuthSessions()) {
      persistAuthSessionStore();
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      console.warn('[auth] failed to load persisted sessions:', error);
    }
  }
};

loadAuthSessionStore();

const appendJsonLineFile = async (filePath, row) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, `${JSON.stringify(row)}\n`, 'utf8');
};

const getRequestRemoteAddress = (req) => {
  const forwardedFor = String(req?.headers?.['x-forwarded-for'] || '').split(',')[0].trim();
  return forwardedFor || String(req?.socket?.remoteAddress || '').trim();
};
const buildInvalidSessionPayload = (token = '') => {
  const safeToken = String(token || '').trim();
  const reason = safeToken && accountSessionByToken.size === 0 ? 'server_restarted' : 'session_replaced';
  return { ok: false, error: 'invalid_session', reason };
};

const writeAuthLoginLog = async (req, patch = {}) => {
  const row = {
    createdAt: new Date().toISOString(),
    host: String(req?.headers?.host || ''),
    remoteAddress: getRequestRemoteAddress(req),
    userAgent: String(req?.headers?.['user-agent'] || ''),
    event: String(patch?.event || 'auth'),
    result: String(patch?.result || 'unknown'),
    username: String(patch?.username || ''),
    userId: String(patch?.userId || ''),
    detail: String(patch?.detail || '')
  };
  await appendJsonLineFile(AUTH_LOGIN_LOG_FILE, row);
};

const readChatMessagesFile = async () => {
  try {
    const raw = await fs.readFile(CHAT_MESSAGES_FILE, 'utf8');
    if (!raw.trim()) return [];
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry) => entry && typeof entry === 'object');
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
};

const parseChatTimestamp = (value) => {
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : 0;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : 0;
};

const chatDayKeyOf = (value = Date.now()) => {
  const timestamp = parseChatTimestamp(value) || Date.now();
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: CHAT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(timestamp));
};

const readLmStudioLoadedModels = async () => {
  const response = await fetch(LM_STUDIO_MODELS_API_URL, {
    method: 'GET',
    headers: buildLmStudioRequestHeaders({
      Accept: 'application/json'
    })
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `LM Studio 모델 목록 조회 실패 (${response.status}): ${String(detail || response.statusText || '').trim()}`
    );
  }
  const payload = await response.json();
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({
      id: String(entry?.id || '').trim(),
      reasoningAllowedOptions: Array.isArray(entry?.capabilities?.reasoning?.allowed_options)
        ? entry.capabilities.reasoning.allowed_options.map((value) => String(value || '').trim()).filter(Boolean)
        : []
    }))
    .filter((entry) => entry.id);
};

const resolveLmStudioPhoneHelperModel = async (requestedModel = '') => {
  const normalizedRequestedModel = String(requestedModel || '').trim();
  const loadedModels = await readLmStudioLoadedModels();
  const loadedModelIds = loadedModels.map((entry) => entry.id);
  if (!loadedModelIds.length) {
    throw new Error('LM Studio에 현재 로드된 모델이 없습니다.');
  }
  const candidateModelIds = [
    normalizedRequestedModel,
    ...LM_STUDIO_PHONE_HELPER_MODEL_FALLBACKS
  ].filter(Boolean);
  const resolvedModel = candidateModelIds.find((modelId) => loadedModelIds.includes(modelId));
  if (resolvedModel) {
    const resolvedModelEntry = loadedModels.find((entry) => entry.id === resolvedModel) || null;
    return {
      modelId: resolvedModel,
      reasoningOffSupported: Boolean(
        resolvedModelEntry?.reasoningAllowedOptions?.includes('off')
        || lmStudioReasoningOffLikelySupportedByModelId(resolvedModel)
      )
    };
  }
  throw new Error(
    `사용 가능한 상담 모델을 찾지 못했습니다. 현재 로드된 모델: ${loadedModelIds.join(', ')}`
  );
};

const extractLmStudioChatMessageText = (payload = null) => {
  const outputItems = Array.isArray(payload?.output) ? payload.output : [];
  return outputItems
    .filter((entry) => entry && entry.type === 'message')
    .map((entry) => {
      if (typeof entry?.content === 'string') return String(entry.content || '').trim();
      if (Array.isArray(entry?.content)) {
        return entry.content
          .map((part) => {
            if (typeof part === 'string') return part;
            if (part && typeof part === 'object' && 'text' in part) return String(part.text || '');
            if (part && typeof part === 'object' && 'content' in part) return String(part.content || '');
            return '';
          })
          .join('')
          .trim();
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n')
    .trim();
};

const buildLmStudioToolFallbackContext = (payload = null) => {
  const outputItems = Array.isArray(payload?.output) ? payload.output : [];
  return outputItems
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return '';
      if (entry.type === 'tool_call') {
        const toolName = String(entry.tool || '').trim() || 'unknown_tool';
        const toolOutput = typeof entry.output === 'string'
          ? entry.output.trim()
          : lmStudioErrorDetailTextOf(entry.output);
        if (!toolOutput) return '';
        return `[도구:${toolName}]\n${toolOutput}`;
      }
      if (entry.type === 'reasoning') {
        const reasoningText = String(entry.content || '').trim();
        return reasoningText ? `[추론]\n${reasoningText}` : '';
      }
      if (entry.type === 'invalid_tool_call') {
        const invalidReason = lmStudioErrorDetailTextOf(entry.reason || entry.metadata || '');
        return invalidReason ? `[도구실패]\n${invalidReason}` : '';
      }
      return '';
    })
    .filter(Boolean)
    .join('\n\n')
    .trim();
};

const buildLmStudioDirectFallbackReply = (payload = null) => {
  const outputItems = Array.isArray(payload?.output) ? payload.output : [];
  const toolOutputs = outputItems
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return '';
      if (entry.type !== 'tool_call') return '';
      if (typeof entry.output === 'string') return String(entry.output || '').trim();
      return lmStudioErrorDetailTextOf(entry.output);
    })
    .filter(Boolean);
  if (toolOutputs.length) {
    return toolOutputs.join('\n\n').trim();
  }
  return '';
};

const splitTextForPhoneHelperStream = (text = '') => {
  const glyphs = Array.from(String(text || ''));
  const chunks = [];
  for (let index = 0; index < glyphs.length; index += 2) {
    chunks.push(glyphs.slice(index, index + 2).join(''));
  }
  return chunks;
};

const writePhoneHelperOpenAiStream = (res, text = '') => {
  const chunks = splitTextForPhoneHelperStream(text);
  for (const chunk of chunks) {
    res.write(`data: ${JSON.stringify({
      choices: [
        {
          delta: {
            content: chunk
          }
        }
      ]
    })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
};

const lmStudioErrorDetailTextOf = (value) => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value).trim();
  if (Array.isArray(value)) {
    return value
      .map((entry) => lmStudioErrorDetailTextOf(entry))
      .filter(Boolean)
      .join(' / ')
      .trim();
  }
  if (value && typeof value === 'object') {
    const preferred = [
      value.message,
      value.detail,
      value.error,
      value.reason,
      value.code,
      value.type
    ]
      .map((entry) => lmStudioErrorDetailTextOf(entry))
      .filter(Boolean);
    if (preferred.length) return preferred.join(' / ').trim();
    try {
      return JSON.stringify(value);
    } catch {
      return '[unserializable_error_object]';
    }
  }
  return '';
};

const buildLmStudioRequestHeaders = (extraHeaders = {}) => ({
  ...extraHeaders,
  ...(LM_STUDIO_API_AUTH_TOKEN ? { Authorization: `Bearer ${LM_STUDIO_API_AUTH_TOKEN}` } : {})
});

const normalizeChatMessage = (entry) => {
  const id = String(entry?.id || '').trim();
  const username = String(entry?.username || '').trim();
  const text = sanitizeChatText(entry?.text);
  const createdAtMs = parseChatTimestamp(entry?.createdAt);
  if (!id || !username || !text || createdAtMs <= 0) return null;
  return {
    id,
    username,
    text,
    createdAt: new Date(createdAtMs).toISOString()
  };
};

const writeChatMessagesFile = async (messages) => {
  await fs.mkdir(path.dirname(CHAT_MESSAGES_FILE), { recursive: true });
  const lines = (Array.isArray(messages) ? messages : []).map((message) => JSON.stringify(message));
  await fs.writeFile(CHAT_MESSAGES_FILE, lines.length ? `${lines.join('\n')}\n` : '', 'utf8');
};

const ensureChatMessagesLoaded = async () => {
  if (cachedChatMessagesLoaded) return cachedChatMessages;
  const loaded = await readChatMessagesFile();
  const todayKey = chatDayKeyOf();
  const normalized = loaded.map(normalizeChatMessage).filter(Boolean);
  const todayMessages = normalized
    .filter((message) => chatDayKeyOf(message.createdAt) === todayKey)
    .slice(-CHAT_HISTORY_LIMIT);
  if (todayMessages.length !== loaded.length || todayMessages.some((message, index) => JSON.stringify(message) !== JSON.stringify(loaded[index]))) {
    await writeChatMessagesFile(todayMessages);
  }
  cachedChatMessages = todayMessages;
  cachedChatMessagesLoaded = true;
  return cachedChatMessages;
};

const appendChatMessage = async (message) => {
  const normalized = normalizeChatMessage(message);
  if (!normalized) return;
  const currentMessages = await ensureChatMessagesLoaded();
  cachedChatMessages = [...currentMessages, normalized].slice(-CHAT_HISTORY_LIMIT);
  await writeChatMessagesFile(cachedChatMessages);
  cachedChatMessagesLoaded = true;
};

const deleteChatMessageById = async (messageId) => {
  const targetId = String(messageId || '').trim();
  if (!targetId) return false;
  const currentMessages = await ensureChatMessagesLoaded();
  const nextMessages = currentMessages.filter((message) => String(message?.id || '').trim() !== targetId);
  if (nextMessages.length === currentMessages.length) return false;
  cachedChatMessages = nextMessages;
  await writeChatMessagesFile(cachedChatMessages);
  cachedChatMessagesLoaded = true;
  return true;
};

const writeJsonFile = async (filePath, value) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}-${randomBytes(4).toString('hex')}`;
  await fs.writeFile(tempPath, JSON.stringify(value, null, 2), 'utf8');
  await fs.rename(tempPath, filePath);
};

const sanitizeUpdatePlanTable = (rawTable) => {
  if (!rawTable || typeof rawTable !== 'object' || Array.isArray(rawTable)) return null;
  const caption = String(rawTable.caption || '').trim();
  const columns = Array.isArray(rawTable.columns)
    ? rawTable.columns.map((cell) => String(cell || '').trim()).filter(Boolean)
    : [];
  const rows = Array.isArray(rawTable.rows)
    ? rawTable.rows
      .filter((row) => Array.isArray(row))
      .map((row) => row.map((cell) => String(cell || '').trim()))
      .filter((row) => row.some(Boolean))
    : [];
  if (!caption && !columns.length && !rows.length) return null;
  return { caption, columns, rows };
};

const sanitizeUpdatePlanEntries = (rawEntries) => {
  if (!Array.isArray(rawEntries)) return [];
  return rawEntries.map((entry, index) => {
    const safeEntry = entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {};
    const items = Array.isArray(safeEntry.items)
      ? safeEntry.items.map((item) => String(item || '').trim()).filter(Boolean)
      : [];
    const table = sanitizeUpdatePlanTable(safeEntry.table);
    return {
      id: String(safeEntry.id || `plan-${index + 1}`),
      date: String(safeEntry.date || '').trim(),
      title: String(safeEntry.title || '').trim(),
      items,
      ...(table ? { table } : {})
    };
  }).filter((entry) => entry.date || entry.title || entry.items.length || entry.table);
};
const isUpdatePlanAdminSession = (session) => UPDATE_PLAN_ADMIN_USERNAMES.has(String(session?.username || '').trim().toLowerCase());

const normalizeUsername = (value) => String(value || '').trim();
const isValidUsername = (value) => /^[0-9A-Za-z_가-힣-]{3,24}$/.test(String(value || '').trim());
const hashPassword = (password, saltHex) => scryptSync(String(password || ''), saltHex, 64).toString('hex');
const createPasswordRecord = (password) => {
  const saltHex = randomBytes(16).toString('hex');
  return {
    saltHex,
    passwordHash: hashPassword(password, saltHex)
  };
};
const verifyPassword = (password, account) => {
  if (!account?.saltHex || !account?.passwordHash) return false;
  const candidate = Buffer.from(hashPassword(password, account.saltHex), 'hex');
  const stored = Buffer.from(String(account.passwordHash || ''), 'hex');
  if (candidate.length !== stored.length) return false;
  return timingSafeEqual(candidate, stored);
};
const accountSaveFileOf = (userId) => path.join(ACCOUNT_SAVES_DIR, `${String(userId || '')}.json`);
const sanitizeGamePayload = (game) => (
  game && typeof game === 'object' && Array.isArray(game.fields)
    ? JSON.parse(JSON.stringify(game))
    : null
);
const sanitizeAccountPreferences = (raw) => {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const housingEntryButtonPositionRaw = source.housingEntryButtonPosition && typeof source.housingEntryButtonPosition === 'object'
    ? source.housingEntryButtonPosition
    : {};
  const townMarkerPositions = source.townMarkerPositions && typeof source.townMarkerPositions === 'object' && !Array.isArray(source.townMarkerPositions)
    ? source.townMarkerPositions
    : {};
  const lastActiveSaveSlotRaw = source.lastActiveSaveSlot == null || source.lastActiveSaveSlot === ''
    ? null
    : Math.floor(Number(source.lastActiveSaveSlot));
  const lastViewStateSource = source.lastViewState && typeof source.lastViewState === 'object' && !Array.isArray(source.lastViewState)
    ? source.lastViewState
    : {};
  const safePhoneApps = new Set(['bank', 'weather', 'messages', 'contacts', 'labor', 'health', 'settings', 'apple-helper-chat']);
  const safeHousingObjects = new Set([
    'fridge',
    'meal',
    'bed',
    'hvac',
    'bathroom',
    'closet',
    'storage',
    'window',
    'pc',
    'livingDetail',
    'farmLog',
    'calendar'
  ]);
  const safeMapLocationKeys = new Set(['farmMart', 'pesticideShop', 'seedlingShop', 'fuelStation', 'machineRent', 'smallCity', 'foodMart', 'constructionOffice', 'maintenanceShop', 'smallApc', 'bank', 'townOffice', 'landBank', 'laborOffice']);
  const safeMapLocationViews = new Set(['menu', 'shop', 'pickup', 'office']);
  const sanitizeRestoreKey = (value, fallback = '') => {
    const next = String(value || '').trim();
    return /^[a-zA-Z0-9:_-]{1,40}$/.test(next) ? next : fallback;
  };
  const sanitizeMapLocationModal = (value) => {
    const modal = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const key = safeMapLocationKeys.has(String(modal.key || '')) ? String(modal.key) : '';
    const open = Boolean(modal.open) && Boolean(key);
    return {
      open,
      key: open ? key : '',
      tab: sanitizeRestoreKey(modal.tab, key === 'foodMart' ? 'all' : 'tool'),
      view: safeMapLocationViews.has(String(modal.view || '')) ? String(modal.view) : 'shop',
      parkingReturnKey: sanitizeRestoreKey(modal.parkingReturnKey, '')
    };
  };
  const sanitizeShopCartByKey = (value) => {
    const cart = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return Object.entries(cart).reduce((acc, [entryKeyRaw, entryRaw]) => {
      const entry = entryRaw && typeof entryRaw === 'object' && !Array.isArray(entryRaw) ? entryRaw : {};
      const cartKey = sanitizeRestoreKey(entry.cartKey || entryKeyRaw, '');
      const itemKey = sanitizeRestoreKey(entry.itemKey || entry?.item?.key, '');
      const qty = Math.max(0, Math.floor(Number(entry.qty) || 0));
      if (!cartKey || !itemKey || qty <= 0) return acc;
      acc[cartKey] = {
        cartKey,
        itemKey,
        itemCategory: sanitizeRestoreKey(entry.itemCategory || entry?.item?.category, ''),
        qty,
        paid: Boolean(entry.paid),
        purchaseOverride: entry.purchaseOverride && typeof entry.purchaseOverride === 'object' && !Array.isArray(entry.purchaseOverride)
          ? {
              ...entry.purchaseOverride,
              price: Math.max(0, Math.floor(Number(entry.purchaseOverride.price) || 0))
            }
          : null
      };
      return acc;
    }, {});
  };
  const clampNumber = (value, min, max, fallback = min) => {
    const next = Number(value);
    if (!Number.isFinite(next)) return fallback;
    return Math.max(min, Math.min(max, next));
  };
  const sanitizeExternalMapCenter = (value) => {
    const sourceCenter = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    return {
      x: Number(clampNumber(sourceCenter.x, -60, 60, 0).toFixed(2)),
      y: Number(clampNumber(sourceCenter.y, -40, 40, 0).toFixed(2))
    };
  };
  return {
    devFastNextDay: Boolean(source.devFastNextDay),
    devAutoPageReloadEnabled: source.devAutoPageReloadEnabled !== false,
    autoSaveEnabled: source.autoSaveEnabled !== false,
    autoRestoreViewEnabled: source.autoRestoreViewEnabled !== false,
    lastActiveSaveSlot: Number.isInteger(lastActiveSaveSlotRaw) && lastActiveSaveSlotRaw >= 0 && lastActiveSaveSlotRaw < ACCOUNT_SAVE_SLOT_COUNT ? lastActiveSaveSlotRaw : null,
    lastViewState: {
      screen: String(lastViewStateSource.screen || '') === 'game' ? 'game' : 'menu',
      tab: ['farm', 'storage', 'map', 'landBank', 'warehouse', 'crew', 'shop', 'facility', 'log'].includes(String(lastViewStateSource.tab || '')) ? String(lastViewStateSource.tab) : 'farm',
      tabGroup: ['farmOps'].includes(String(lastViewStateSource.tabGroup || '')) ? String(lastViewStateSource.tabGroup) : 'farmOps',
      focusTab: ['cropStatus', 'manage', 'housing', 'landFacility', 'work', 'workOrder'].includes(String(lastViewStateSource.focusTab || '')) ? String(lastViewStateSource.focusTab) : 'manage',
      warehouseTab: sanitizeRestoreKey(lastViewStateSource.warehouseTab, 'all'),
      shopTab: sanitizeRestoreKey(lastViewStateSource.shopTab, 'machine'),
      landFacilityMainTab: ['types', 'warehouse', 'parking', 'control'].includes(String(lastViewStateSource.landFacilityMainTab || '')) ? String(lastViewStateSource.landFacilityMainTab) : 'types',
      landFacilitySubTab: sanitizeRestoreKey(lastViewStateSource.landFacilitySubTab, 'land'),
      housingViewMode: ['list', 'detail'].includes(String(lastViewStateSource.housingViewMode || '')) ? String(lastViewStateSource.housingViewMode) : 'list',
      housingViewSelectedFacilityKey: sanitizeRestoreKey(lastViewStateSource.housingViewSelectedFacilityKey, ''),
      housingInteriorFacilityKey: sanitizeRestoreKey(lastViewStateSource.housingInteriorFacilityKey, ''),
      housingInteriorPendingObjectKey: safeHousingObjects.has(String(lastViewStateSource.housingInteriorPendingObjectKey || '')) ? String(lastViewStateSource.housingInteriorPendingObjectKey) : '',
      externalMapOpen: Boolean(lastViewStateSource.externalMapOpen),
      externalMapLocationContext: String(lastViewStateSource.externalMapLocationContext || '') === 'town' ? 'town' : 'field',
      externalMapFieldSelectMode: Boolean(lastViewStateSource.externalMapFieldSelectMode),
      externalMapZoom: Number(clampNumber(lastViewStateSource.externalMapZoom, 0.25, 10, 0.5).toFixed(2)),
      externalMapCenter: sanitizeExternalMapCenter(lastViewStateSource.externalMapCenter),
      externalMapVillageMarkersVisible: lastViewStateSource.externalMapVillageMarkersVisible !== false,
      externalMapCityMarkersVisible: lastViewStateSource.externalMapCityMarkersVisible !== false,
      externalMapFieldMarkersVisible: lastViewStateSource.externalMapFieldMarkersVisible !== false,
      externalMapLandAreasVisible: lastViewStateSource.externalMapLandAreasVisible !== false,
      mapLocationModal: sanitizeMapLocationModal(lastViewStateSource.mapLocationModal),
      quickDrawerOpen: Boolean(lastViewStateSource.quickDrawerOpen),
      phoneUnlocked: Boolean(lastViewStateSource.phoneUnlocked),
      phoneOpenedApp: safePhoneApps.has(String(lastViewStateSource.phoneOpenedApp || '')) ? String(lastViewStateSource.phoneOpenedApp) : ''
    },
    shopCartByKey: sanitizeShopCartByKey(source.shopCartByKey),
    phoneHelperChatMessages: source.phoneHelperChatMessages && typeof source.phoneHelperChatMessages === 'object' && !Array.isArray(source.phoneHelperChatMessages)
      ? source.phoneHelperChatMessages
      : {},
    housingEntryButtonPosition: {
      xPercent: Math.max(12, Math.min(88, Number(housingEntryButtonPositionRaw.xPercent) || 67)),
      yPercent: Math.max(18, Math.min(90, Number(housingEntryButtonPositionRaw.yPercent) || 78)),
    },
    housingEntryButtonDragEnabled: Boolean(source.housingEntryButtonDragEnabled),
    townMarkerPositions,
    townMarkerCoordsLocked: source.townMarkerCoordsLocked !== false,
    townMarkerLayoutSavedAtDay: Math.max(0, Math.floor(Number(source.townMarkerLayoutSavedAtDay) || 0)),
  };
};
const sanitizeChatText = (value) => String(value || '')
  .replace(/\r/g, '')
  .split('\n')
  .map((line) => line.trim())
  .join('\n')
  .trim()
  .slice(0, CHAT_MAX_MESSAGE_LENGTH);
const sanitizeLogAccountName = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return 'anonymous';
  const safe = normalized.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').replace(/\s+/g, '_').slice(0, 64);
  return safe || 'anonymous';
};
const readJsonLineEntries = async (filePath, limit = 120) => {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const rows = String(raw || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter((entry) => entry && typeof entry === 'object');
    return rows.slice(-Math.max(1, Math.floor(Number(limit) || 120))).reverse();
  } catch (error) {
    if (error?.code === 'ENOENT') return [];
    throw error;
  }
};
const invalidateSession = (token) => {
  const safeToken = String(token || '').trim();
  if (!safeToken) return;
  const session = accountSessionByToken.get(safeToken) || null;
  accountSessionByToken.delete(safeToken);
  if (session?.userId && accountActiveTokenByUserId.get(session.userId) === safeToken) {
    accountActiveTokenByUserId.delete(session.userId);
  }
  persistAuthSessionStore();
};
const createSession = (account) => {
  const userId = String(account?.id || '');
  const previousToken = accountActiveTokenByUserId.get(userId);
  if (previousToken) invalidateSession(previousToken);
  const token = randomBytes(24).toString('hex');
  const session = {
    token,
    userId,
    username: String(account.username || ''),
    createdAt: Date.now()
  };
  accountSessionByToken.set(token, session);
  accountActiveTokenByUserId.set(userId, token);
  persistAuthSessionStore();
  return session;
};
const parseCookies = (cookieHeader) => String(cookieHeader || '')
  .split(';')
  .map((part) => part.trim())
  .filter(Boolean)
  .reduce((acc, part) => {
    const eqIndex = part.indexOf('=');
    if (eqIndex <= 0) return acc;
    const key = part.slice(0, eqIndex).trim();
    const value = part.slice(eqIndex + 1).trim();
    if (key) acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
const authCookieHeaderOfToken = (token) => (
  `${AUTH_COOKIE_NAME}=${encodeURIComponent(String(token || '').trim())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE_SECONDS}`
);
const expiredAuthCookieHeader = () => (
  `${AUTH_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
);
const getExplicitAuthTokenFromRequest = (req) => {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const tokenFromQuery = requestUrl.searchParams.get('token');
  const tokenFromBody = req.__body?.token;
  const authHeader = String(req?.headers?.authorization || '');
  const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  return String(tokenFromQuery || tokenFromBody || tokenFromHeader || '').trim();
};
const getSessionFromRequest = (req) => {
  pruneExpiredAuthSessions();
  const cookieToken = parseCookies(req?.headers?.cookie || '')?.[AUTH_COOKIE_NAME] || '';
  const token = String(getExplicitAuthTokenFromRequest(req) || cookieToken || '').trim();
  if (!token) return null;
  return accountSessionByToken.get(token) || null;
};
const readAccountSaveState = async (session) => {
  const filePath = accountSaveFileOf(session?.userId);
  const loaded = await readJsonFile(filePath, {
    userId: session?.userId || '',
    username: session?.username || '',
    slots: {},
    preferences: {}
  });
  return {
    userId: String(session?.userId || ''),
    username: String(session?.username || ''),
    slots: loaded?.slots && typeof loaded.slots === 'object' ? loaded.slots : {},
    preferences: sanitizeAccountPreferences(loaded?.preferences)
  };
};

const escapeTemplateLiteral = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/`/g, '\\`')
  .replace(/\$\{/g, '\\${');

const stripOuterCodeFence = (value) => {
  const raw = String(value || '').replace(/^\uFEFF/, '');
  const fencedMatch = raw.match(/^\s*```[A-Za-z0-9_-]*\r?\n([\s\S]*?)\r?\n```\s*$/);
  return fencedMatch ? fencedMatch[1] : raw;
};

const escapeSingleQuotedString = (value) => String(value || '')
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'");

const toAnimationLabPresetConstName = (presetKey) => {
  const normalized = String(presetKey || '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
  return normalized ? `ANIMATION_LAB_${normalized}_HTML` : '';
};

const appendAnimationLabPreset = (source, { presetKey, label, constName, html }) => {
  const optionsMarker = 'export const ANIMATION_LAB_PRESET_OPTIONS = [';
  const optionsStart = source.indexOf(optionsMarker);
  if (optionsStart < 0) return null;
  const optionsEnd = source.indexOf('\n];', optionsStart);
  if (optionsEnd < 0) return null;
  const constBlock = `export const ${constName} = \`${escapeTemplateLiteral(html)}\`;\n\n`;
  const optionEntry = `  { key: '${escapeSingleQuotedString(presetKey)}', label: '${escapeSingleQuotedString(label)}', html: ${constName}, saveTarget: { type: 'inline', constName: '${constName}' } },\n`;
  const optionsBody = source.slice(optionsStart, optionsEnd);
  const normalizedOptionsBody = /,\s*$/.test(optionsBody)
    ? optionsBody
    : `${optionsBody},`;
  return `${source.slice(0, optionsStart)}${constBlock}${normalizedOptionsBody}\n${optionEntry}${source.slice(optionsEnd)}`;
};

const resolveAnimationLabRawFile = (sourceFile) => {
  const rawPath = path.resolve(process.cwd(), String(sourceFile || ''));
  const relativePath = path.relative(ANIMATION_LAB_DATA_DIR, rawPath);
  if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }
  return rawPath;
};

const findTemplateLiteralEnd = (source, startIndex) => {
  for (let i = startIndex; i < source.length; i += 1) {
    if (source[i] !== '`') continue;
    let backslashCount = 0;
    for (let j = i - 1; j >= startIndex && source[j] === '\\'; j -= 1) {
      backslashCount += 1;
    }
    if (backslashCount % 2 === 1) continue;
    if (source[i + 1] === ';') {
      return i;
    }
  }
  return -1;
};

const replacePresetTemplateLiteral = (source, constName, nextHtml) => {
  const normalizedConstName = String(constName || '').trim();
  if (!normalizedConstName) return null;
  const replacementBody = escapeTemplateLiteral(nextHtml);
  const prefixes = [
    `export const ${normalizedConstName} = String.raw\``,
    `export const ${normalizedConstName} = \``,
    `const ${normalizedConstName} = String.raw\``,
    `const ${normalizedConstName} = \``
  ];
  for (const prefix of prefixes) {
    const startIndex = source.indexOf(prefix);
    if (startIndex < 0) continue;
    const bodyStartIndex = startIndex + prefix.length;
    const bodyEndIndex = findTemplateLiteralEnd(source, bodyStartIndex);
    if (bodyEndIndex < 0) continue;
    return `${source.slice(0, bodyStartIndex)}${replacementBody}${source.slice(bodyEndIndex)}`;
  }
  return null;
};

const replaceAnimationLabPresetLabel = (source, presetKey, nextLabel) => {
  const escapedKey = String(presetKey || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(\\{\\s*key:\\s*'${escapedKey}',\\s*label:\\s*')([^']*)(')`);
  if (!pattern.test(source)) return null;
  return source.replace(pattern, (_, start, _label, end) => `${start}${escapeSingleQuotedString(nextLabel)}${end}`);
};

const animationLabPresetKeyExists = (source, presetKey) => {
  const escapedKey = String(presetKey || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`key:\\s*'${escapedKey}'`).test(source);
};

const findAnimationLabPresetConstNameByKey = (source, presetKey) => {
  const escapedKey = String(presetKey || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escapedKey) return '';
  const saveTargetPattern = new RegExp(`\\{\\s*key:\\s*'${escapedKey}'[\\s\\S]*?saveTarget:\\s*\\{[\\s\\S]*?constName:\\s*'([^']+)'`, 'm');
  const saveTargetMatch = source.match(saveTargetPattern);
  if (saveTargetMatch?.[1]) return String(saveTargetMatch[1]).trim();
  const htmlConstPattern = new RegExp(`\\{\\s*key:\\s*'${escapedKey}'[\\s\\S]*?html:\\s*([A-Z0-9_]+)`, 'm');
  const htmlConstMatch = source.match(htmlConstPattern);
  return htmlConstMatch?.[1] ? String(htmlConstMatch[1]).trim() : '';
};

const staticAssetRequestInfoOf = (req) => {
  const rawUrl = String(req?.url || '');
  const pathname = (() => {
    try {
      return new URL(rawUrl, 'http://localhost').pathname;
    } catch {
      return rawUrl.split('?')[0] || '';
    }
  })();
  const normalizedPathname = decodeURIComponent(String(pathname || '')).replace(/\\/g, '/');
  if (!normalizedPathname || normalizedPathname.startsWith('/__')) return null;
  const extension = path.extname(normalizedPathname).toLowerCase();
  if (!STATIC_ASSET_CACHE_EXTENSIONS.has(extension)) return null;
  const fileBaseName = path.basename(normalizedPathname);
  const isHashedBuildAsset = /^.+-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$/.test(fileBaseName);
  return { normalizedPathname, extension, isHashedBuildAsset };
};

const applyStaticAssetCacheHeaders = (res, cacheControl) => {
  if (!cacheControl) return;
  res.setHeader('Cache-Control', cacheControl);
  res.setHeader('Vary', 'Accept-Encoding');
};

const staticAssetCacheMiddleware = (mode = 'dev') => (req, res, next) => {
  const assetInfo = staticAssetRequestInfoOf(req);
  if (!assetInfo) {
    next();
    return;
  }
  const cacheControl = mode === 'preview'
    ? (assetInfo.isHashedBuildAsset ? PREVIEW_HASHED_ASSET_CACHE_CONTROL : PREVIEW_STATIC_ASSET_CACHE_CONTROL)
    : DEV_STATIC_ASSET_CACHE_CONTROL;
  applyStaticAssetCacheHeaders(res, cacheControl);
  next();
};

const animationLabPresetSavePlugin = () => ({
  name: 'animation-lab-preset-save',
  configureServer(server) {
    server.middlewares.use(staticAssetCacheMiddleware('dev'));

    server.middlewares.use('/__presence/heartbeat', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        req.__body = payload;
        const viewerId = String(payload?.viewerId || '').trim().slice(0, 120);
        const tokenProvided = String(payload?.token || '').trim();

        if (!viewerId) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'viewer_id_required' }));
          return;
        }

        const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
        const remoteAddress = forwardedFor || req.socket?.remoteAddress || '';
        const session = getSessionFromRequest(req);
        if (tokenProvided && !session) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(buildInvalidSessionPayload(tokenProvided)));
          return;
        }
        livePresenceByViewerId.set(viewerId, {
          viewerId,
          lastSeenAt: Date.now(),
          host: String(req.headers.host || ''),
          path: String(payload?.path || ''),
          userAgent: String(req.headers['user-agent'] || ''),
          remoteAddress: String(remoteAddress || ''),
          userId: String(session?.userId || ''),
          username: String(session?.username || '')
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(buildPresenceSummary()));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'presence_write_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    server.middlewares.use('/__presence/summary', (_req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(buildPresenceSummary()));
    });

    server.ws.on(CHAT_EVENT_SEND, async (payload, client) => {
      try {
        const token = String(payload?.token || '').trim();
        const session = token ? (accountSessionByToken.get(token) || null) : null;
        if (!session) {
          client.send(CHAT_EVENT_ERROR, { code: 'invalid_session', reason: buildInvalidSessionPayload(token).reason });
          return;
        }
        const text = sanitizeChatText(payload?.text);
        if (!text) {
          client.send(CHAT_EVENT_ERROR, { code: 'empty_message' });
          return;
        }
        await ensureChatMessagesLoaded();
        const message = {
          id: `chat_${Date.now()}_${randomBytes(4).toString('hex')}`,
          username: String(session.username || ''),
          text,
          createdAt: new Date().toISOString()
        };
        await appendChatMessage(message);
        server.ws.send(CHAT_EVENT_MESSAGE, { message });
      } catch (error) {
        client.send(CHAT_EVENT_ERROR, {
          code: 'send_failed',
          detail: error instanceof Error ? error.message : String(error)
        });
      }
    });

    server.middlewares.use(async (req, res, next) => {
      const requestUrl = new URL(req.url || '/', 'http://localhost');
      const routePath = requestUrl.pathname;
      if (!routePath.startsWith('/__chat/')) {
        next();
        return;
      }

      const sendJson = (statusCode, payload) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(payload));
      };

      try {
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          req.__body = raw ? JSON.parse(raw) : {};
        } else {
          req.__body = {};
        }

        if (routePath === '/__chat/messages') {
          const messages = await ensureChatMessagesLoaded();
          sendJson(200, { ok: true, messages });
          return;
        }

        if (routePath === '/__chat/delete') {
          if (req.method !== 'POST') {
            sendJson(405, { ok: false, error: 'method_not_allowed' });
            return;
          }
          const token = String(req.__body?.token || '').trim();
          const session = token ? (accountSessionByToken.get(token) || null) : null;
          if (!session) {
            sendJson(401, { ok: false, error: 'invalid_session', reason: buildInvalidSessionPayload(token).reason });
            return;
          }
          if (!isUpdatePlanAdminSession(session)) {
            sendJson(403, { ok: false, error: 'forbidden', detail: 'admin_only' });
            return;
          }
          const messageId = String(req.__body?.messageId || '').trim();
          if (!messageId) {
            sendJson(400, { ok: false, error: 'invalid_message_id' });
            return;
          }
          const deleted = await deleteChatMessageById(messageId);
          if (!deleted) {
            sendJson(404, { ok: false, error: 'message_not_found' });
            return;
          }
          server.ws.send(CHAT_EVENT_DELETE, { messageId });
          sendJson(200, { ok: true, messageId });
          return;
        }

        sendJson(404, { ok: false, error: 'not_found' });
      } catch (error) {
        sendJson(500, {
          ok: false,
          error: 'chat_request_failed',
          detail: error instanceof Error ? error.message : String(error)
        });
      }
    });

    server.middlewares.use('/__apple-helper/chat', async (req, res) => {
      const sendJson = (statusCode, payload) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(payload));
      };

      if (req.method !== 'POST') {
        sendJson(405, { ok: false, error: 'method_not_allowed' });
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const requestedModel = String(payload?.model || '').trim();
        const messages = Array.isArray(payload?.messages) ? payload.messages : [];
        const temperature = Number(payload?.temperature);
        const maxTokens = Math.max(1, Math.floor(Number(payload?.max_tokens) || 0));
        const useStream = Boolean(payload?.stream);

        if (!requestedModel || !messages.length) {
          sendJson(400, {
            ok: false,
            error: 'invalid_request',
            detail: 'LM Studio 요청에 필요한 model/messages가 없습니다.'
          });
          return;
        }

        const {
          modelId: resolvedModel,
          reasoningOffSupported
        } = await resolveLmStudioPhoneHelperModel(requestedModel);

        const nativeChatInput = messages
          .map((entry) => {
            const role = String(entry?.role || '').trim();
            const content = String(entry?.content || '').trim();
            if (!content) return '';
            if (role === 'system') return '';
            return `${role === 'assistant' ? '상담사' : '사용자'}: ${content}`;
          })
          .filter(Boolean)
          .join('\n');

        const systemPrompt = String(
          messages.find((entry) => String(entry?.role || '').trim() === 'system')?.content || ''
        ).trim();
        const requestLmStudioChat = async ({ extraSystemPrompt = '' } = {}) => {
          const response = await fetch(LM_STUDIO_NATIVE_CHAT_API_URL, {
            method: 'POST',
            headers: buildLmStudioRequestHeaders({
              'Content-Type': 'application/json'
            }),
            body: JSON.stringify({
              model: resolvedModel,
              input: nativeChatInput,
              system_prompt: `${systemPrompt}${extraSystemPrompt ? `\n\n${extraSystemPrompt}` : ''}`.trim(),
              temperature: Number.isFinite(temperature) ? temperature : 0.5,
              max_output_tokens: maxTokens > 0 ? maxTokens : 420,
              store: false,
              integrations: [],
              reasoning: 'off'
            })
          });
          const responseText = await response.text();
          let responsePayload = null;
          try {
            responsePayload = responseText ? JSON.parse(responseText) : null;
          } catch {
            responsePayload = null;
          }
          return { response, responseText, responsePayload };
        };

        let {
          response: lmResponse,
          responseText: lmText,
          responsePayload: lmPayload
        } = await requestLmStudioChat();

        if (!lmResponse.ok) {
          sendJson(lmResponse.status, {
            ok: false,
            error: `lm_studio_http_${lmResponse.status}`,
            detail: lmStudioErrorDetailTextOf(lmPayload?.error)
              || lmStudioErrorDetailTextOf(lmPayload?.message)
              || lmStudioErrorDetailTextOf(lmPayload)
              || String(lmText || `lm_studio_http_${lmResponse.status}`).trim()
          });
          return;
        }

        const actualModelInstanceId = String(lmPayload?.model_instance_id || '').trim();
        const effectiveModelId = actualModelInstanceId || resolvedModel;
        console.info(
          `[apple-helper] requestedModel=${requestedModel} resolvedModel=${resolvedModel} actualModel=${effectiveModelId}`
        );

        let normalizedReplyText = extractLmStudioChatMessageText(lmPayload);
        if (!normalizedReplyText) {
          const fallbackContext = buildLmStudioToolFallbackContext(lmPayload);
          const directFallbackReply = buildLmStudioDirectFallbackReply(lmPayload);
          const outputTypes = (Array.isArray(lmPayload?.output) ? lmPayload.output : [])
            .map((entry) => String(entry?.type || '').trim())
            .filter(Boolean);
          console.warn(
            `[apple-helper] empty final message from LM Studio. outputTypes=${outputTypes.join(', ') || 'none'}`
          );
          if (fallbackContext) {
            const retryResult = await requestLmStudioChat({
              extraSystemPrompt: [
                '방금 도구 또는 중간 추론만 있고 최종 사용자 답변이 빠졌다.',
                '아래 참고 내용을 바탕으로 사용자에게 보일 최종 답변만 한국어로 2~5문장 안에 정리해라.',
                '도구 이름, 내부 추론, 시스템 메시지 존재를 드러내지 마라.',
                '깊게 추론하지 말고 바로 결론부터 짧게 말해라.',
                'thinking process, 분석 단계, 추론 단계 같은 중간 사고를 쓰지 마라.',
                '[참고 내용]',
                fallbackContext
              ].join('\n')
            });
            if (retryResult.response.ok) {
              lmResponse = retryResult.response;
              lmText = retryResult.responseText;
              lmPayload = retryResult.responsePayload;
              normalizedReplyText = extractLmStudioChatMessageText(lmPayload);
            }
          }
          if (!normalizedReplyText && directFallbackReply) {
            console.warn('[apple-helper] using direct fallback reply from LM Studio tool/reasoning output');
            normalizedReplyText = directFallbackReply;
          }
        }
        if (!normalizedReplyText) {
          normalizedReplyText = '지금 답변을 정리하다가 중간에서 끊겼습니다. 같은 질문을 한 번만 다시 보내 주세요.';
        }

        if (useStream) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');
          res.setHeader('X-LM-Studio-Requested-Model', requestedModel);
          res.setHeader('X-LM-Studio-Resolved-Model', resolvedModel);
          res.setHeader('X-LM-Studio-Actual-Model', effectiveModelId);
          writePhoneHelperOpenAiStream(res, normalizedReplyText);
          return;
        }

        sendJson(200, {
          ok: true,
          requested_model: requestedModel,
          selected_model: resolvedModel,
          actual_model: effectiveModelId,
          reply: normalizedReplyText,
          output: Array.isArray(lmPayload?.output) ? lmPayload.output : []
        });
      } catch (error) {
        sendJson(502, {
          ok: false,
          error: 'lm_proxy_failed',
          detail: error instanceof Error
            ? (lmStudioErrorDetailTextOf(error.message) || lmStudioErrorDetailTextOf(error.cause) || error.message)
            : lmStudioErrorDetailTextOf(error)
        });
      }
    });

    server.middlewares.use('/__lm-studio/models', async (req, res) => {
      const sendJson = (statusCode, payload) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(payload));
      };

      if (req.method !== 'GET') {
        sendJson(405, { ok: false, error: 'method_not_allowed' });
        return;
      }

      try {
        const modelIds = await readLmStudioLoadedModelIds();
        sendJson(200, {
          ok: true,
          models: modelIds.map((id) => ({ id, loaded: true }))
        });
      } catch (error) {
        sendJson(502, {
          ok: false,
          error: 'lm_studio_models_failed',
          detail: error instanceof Error ? error.message : String(error)
        });
      }
    });

    server.middlewares.use(async (req, res, next) => {
      const requestUrl = new URL(req.url || '/', 'http://localhost');
      const routePath = requestUrl.pathname;
      if (!routePath.startsWith('/__auth/')) {
        next();
        return;
      }

      const sendJson = (statusCode, payload) => {
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(payload));
      };

      try {
        if (req.method === 'POST') {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const raw = Buffer.concat(chunks).toString('utf8');
          req.__body = raw ? JSON.parse(raw) : {};
        } else {
          req.__body = {};
        }

        if (routePath === '/__auth/register') {
          if (req.method !== 'POST') {
            sendJson(405, { ok: false, error: 'method_not_allowed' });
            return;
          }
          const username = normalizeUsername(req.__body?.username);
          const password = String(req.__body?.password || '');
          if (!isValidUsername(username)) {
            sendJson(400, { ok: false, error: 'invalid_username', detail: '아이디는 3~24자의 영문/숫자/한글/_/- 조합이어야 합니다.' });
            return;
          }
          if (password.length < 4) {
            sendJson(400, { ok: false, error: 'weak_password', detail: '비밀번호는 4자 이상이어야 합니다.' });
            return;
          }
          const accounts = await readJsonFile(ACCOUNTS_FILE, []);
          if (accounts.some((entry) => String(entry?.username || '').toLowerCase() === username.toLowerCase())) {
            await writeAuthLoginLog(req, {
              event: 'register',
              result: 'username_taken',
              username,
              detail: 'duplicate_username'
            });
            sendJson(409, { ok: false, error: 'username_taken' });
            return;
          }
          const passwordRecord = createPasswordRecord(password);
          const account = {
            id: `acct_${Date.now()}_${randomBytes(6).toString('hex')}`,
            username,
            ...passwordRecord,
            createdAt: new Date().toISOString()
          };
          await writeJsonFile(ACCOUNTS_FILE, [...accounts, account]);
          const session = createSession(account);
          await writeJsonFile(accountSaveFileOf(account.id), {
            userId: account.id,
            username,
            updatedAt: new Date().toISOString(),
            slots: {},
            preferences: sanitizeAccountPreferences({})
          });
          await writeAuthLoginLog(req, {
            event: 'register',
            result: 'success',
            username,
            userId: account.id
          });
          res.setHeader('Set-Cookie', authCookieHeaderOfToken(session.token));
          sendJson(200, {
            ok: true,
            session,
            slots: {},
            preferences: sanitizeAccountPreferences({})
          });
          return;
        }

        if (routePath === '/__auth/login') {
          if (req.method !== 'POST') {
            sendJson(405, { ok: false, error: 'method_not_allowed' });
            return;
          }
          const username = normalizeUsername(req.__body?.username);
          const password = String(req.__body?.password || '');
          const accounts = await readJsonFile(ACCOUNTS_FILE, []);
          const account = accounts.find((entry) => String(entry?.username || '').toLowerCase() === username.toLowerCase());
          if (!account || !verifyPassword(password, account)) {
            await writeAuthLoginLog(req, {
              event: 'login',
              result: 'invalid_credentials',
              username,
              userId: String(account?.id || ''),
              detail: 'login_failed'
            });
            sendJson(401, { ok: false, error: 'invalid_credentials' });
            return;
          }
          let session = null;
          try {
            session = createSession(account);
          } catch (error) {
            await writeAuthLoginLog(req, {
              event: 'login',
              result: 'session_create_failed',
              username,
              userId: String(account?.id || ''),
              detail: String(error?.message || error || '')
            });
            sendJson(500, {
              ok: false,
              error: 'session_create_failed',
              detail: String(error?.message || error || '')
            });
            return;
          }
          let saveState = null;
          try {
            saveState = await readAccountSaveState(session);
          } catch (error) {
            await writeAuthLoginLog(req, {
              event: 'login',
              result: 'account_save_read_failed',
              username,
              userId: String(account?.id || ''),
              detail: String(error?.message || error || '')
            });
            sendJson(500, {
              ok: false,
              error: 'account_save_read_failed',
              detail: String(error?.message || error || '')
            });
            return;
          }
          await writeAuthLoginLog(req, {
            event: 'login',
            result: 'success',
            username,
            userId: String(account?.id || '')
          });
          res.setHeader('Set-Cookie', authCookieHeaderOfToken(session.token));
          sendJson(200, {
            ok: true,
            session,
            slots: saveState.slots,
            preferences: saveState.preferences
          });
          return;
        }

        if (routePath === '/__auth/session') {
          const token = getExplicitAuthTokenFromRequest(req);
          pruneExpiredAuthSessions();
          const session = token ? (accountSessionByToken.get(token) || null) : null;
          if (!session) {
            res.setHeader('Set-Cookie', expiredAuthCookieHeader());
            sendJson(401, buildInvalidSessionPayload(token));
            return;
          }
          const saveState = await readAccountSaveState(session);
          sendJson(200, {
            ok: true,
            session,
            slots: saveState.slots,
            preferences: saveState.preferences
          });
          return;
        }

        if (routePath === '/__auth/logout') {
          const session = getSessionFromRequest(req);
          if (session?.token) invalidateSession(session.token);
          await writeAuthLoginLog(req, {
            event: 'logout',
            result: session?.token ? 'success' : 'invalid_session',
            username: String(session?.username || ''),
            userId: String(session?.userId || '')
          });
          res.setHeader('Set-Cookie', expiredAuthCookieHeader());
          sendJson(200, { ok: true });
          return;
        }

        if (routePath === '/__auth/save-slot') {
          if (req.method !== 'POST') {
            sendJson(405, { ok: false, error: 'method_not_allowed' });
            return;
          }
          const session = getSessionFromRequest(req);
          if (!session) {
            sendJson(401, buildInvalidSessionPayload(req.__body?.token));
            return;
          }
          const slotKey = String(req.__body?.slotKey || '').trim();
          const game = sanitizeGamePayload(req.__body?.game);
          if (!slotKey || !game) {
            sendJson(400, { ok: false, error: 'invalid_payload' });
            return;
          }
          const saveState = await readAccountSaveState(session);
          saveState.slots[slotKey] = game;
          await writeJsonFile(accountSaveFileOf(session.userId), {
            userId: session.userId,
            username: session.username,
            updatedAt: new Date().toISOString(),
            slots: saveState.slots,
            preferences: saveState.preferences
          });
          sendJson(200, { ok: true });
          return;
        }

        if (routePath === '/__auth/preferences') {
          if (req.method !== 'POST') {
            sendJson(405, { ok: false, error: 'method_not_allowed' });
            return;
          }
          const session = getSessionFromRequest(req);
          if (!session) {
            sendJson(401, buildInvalidSessionPayload(req.__body?.token));
            return;
          }
          const saveState = await readAccountSaveState(session);
          saveState.preferences = sanitizeAccountPreferences({
            ...saveState.preferences,
            ...(req.__body?.preferences && typeof req.__body.preferences === 'object' ? req.__body.preferences : {})
          });
          await writeJsonFile(accountSaveFileOf(session.userId), {
            userId: session.userId,
            username: session.username,
            updatedAt: new Date().toISOString(),
            slots: saveState.slots,
            preferences: saveState.preferences
          });
          sendJson(200, { ok: true, preferences: saveState.preferences });
          return;
        }

        if (routePath === '/__auth/delete-slot') {
          if (req.method !== 'POST') {
            sendJson(405, { ok: false, error: 'method_not_allowed' });
            return;
          }
          const session = getSessionFromRequest(req);
          if (!session) {
            sendJson(401, buildInvalidSessionPayload(req.__body?.token));
            return;
          }
          const slotKey = String(req.__body?.slotKey || '').trim();
          if (!slotKey) {
            sendJson(400, { ok: false, error: 'invalid_payload' });
            return;
          }
          const saveState = await readAccountSaveState(session);
          delete saveState.slots[slotKey];
          await writeJsonFile(accountSaveFileOf(session.userId), {
            userId: session.userId,
            username: session.username,
            updatedAt: new Date().toISOString(),
            slots: saveState.slots,
            preferences: saveState.preferences
          });
          sendJson(200, { ok: true });
          return;
        }

        sendJson(404, { ok: false, error: 'not_found' });
      } catch (error) {
        sendJson(500, {
          ok: false,
          error: 'auth_request_failed',
          detail: error instanceof Error ? error.message : String(error)
        });
      }
    });

    server.middlewares.use('/__bug-report', async (req, res) => {
      if (req.method === 'GET') {
        try {
          const session = getSessionFromRequest(req);
          if (!session) {
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(buildInvalidSessionPayload()));
            return;
          }
          if (!isUpdatePlanAdminSession(session)) {
            res.statusCode = 403;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: 'forbidden', detail: 'admin_only' }));
            return;
          }
          const entries = await readJsonLineEntries(BUG_REPORT_FILE, 160);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, entries, canRead: true }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: false,
            error: 'bug_report_read_failed',
            detail: error instanceof Error ? error.message : String(error)
          }));
        }
        return;
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const message = String(payload?.message || '').trim();
        if (!message) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'message_required' }));
          return;
        }

        const forwardedFor = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
        const remoteAddress = forwardedFor || req.socket?.remoteAddress || '';
        const reportRow = {
          createdAt: new Date().toISOString(),
          host: String(req.headers.host || ''),
          remoteAddress: String(remoteAddress || ''),
          userAgent: String(req.headers['user-agent'] || ''),
          message,
          metadata: payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}
        };

        await fs.mkdir(path.dirname(BUG_REPORT_FILE), { recursive: true });
        await fs.appendFile(BUG_REPORT_FILE, `${JSON.stringify(reportRow)}\n`, 'utf8');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, savedTo: BUG_REPORT_FILE }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'bug_report_write_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    server.middlewares.use('/__game-action-log', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const action = String(payload?.action || '').trim();
        if (!action) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'action_required' }));
          return;
        }

        const metadata = payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};
        const accountUsername = sanitizeLogAccountName(metadata?.accountUsername || payload?.accountUsername || '');
        const logRow = {
          createdAt: new Date().toISOString(),
          host: String(req.headers.host || ''),
          userAgent: String(req.headers['user-agent'] || ''),
          action,
          result: String(payload?.result || '').trim() || 'info',
          metadata
        };
        const logFilePath = path.join(GAME_ACTION_LOG_DIR, `${accountUsername}.jsonl`);
        await fs.mkdir(path.dirname(logFilePath), { recursive: true });
        await fs.appendFile(logFilePath, `${JSON.stringify(logRow)}\n`, 'utf8');

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, savedTo: logFilePath }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'game_action_log_write_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    server.middlewares.use('/__dev-modal-layout', async (req, res) => {
      const resolveLayoutFilePath = (username) => {
        const normalized = String(username || '').trim().toLowerCase();
        return path.join(DEV_MODAL_LAYOUT_DIR, `${normalized}.json`);
      };

      if (req.method === 'GET') {
        try {
          const requestUrl = new URL(req.url || '', 'http://localhost');
          const username = String(requestUrl.searchParams.get('username') || '').trim();
          const layoutFilePath = resolveLayoutFilePath(username);
          if (!layoutFilePath) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: true, layouts: {} }));
            return;
          }
          const raw = await fs.readFile(layoutFilePath, 'utf8').catch(() => '');
          const loaded = raw ? JSON.parse(raw) : {};
          const envelope = (
            loaded && typeof loaded === 'object' && loaded.layouts && typeof loaded.layouts === 'object'
              ? loaded
              : { layouts: loaded, saveName: '', savedAt: '' }
          );
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: true,
            layouts: envelope.layouts,
            saveName: envelope.saveName || '',
            savedAt: envelope.savedAt || '',
            layoutManifest: envelope.layoutManifest || []
          }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: false,
            error: 'dev_modal_layout_read_failed',
            detail: error instanceof Error ? error.message : String(error)
          }));
        }
        return;
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const username = String(payload?.username || '').trim();
        const layoutFilePath = resolveLayoutFilePath(username);
        if (!layoutFilePath) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, skipped: true }));
          return;
        }
        const layouts = payload?.layouts && typeof payload.layouts === 'object' ? payload.layouts : {};
        const saveName = String(payload?.saveName || '').trim();
        const savedAt = String(payload?.savedAt || '').trim();
        const layoutManifest = payload?.layoutManifest && Array.isArray(payload.layoutManifest) ? payload.layoutManifest : [];
        await writeJsonFile(layoutFilePath, { layouts, saveName, savedAt, layoutManifest });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, savedTo: layoutFilePath }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'dev_modal_layout_write_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    server.middlewares.use('/__update-plan', async (req, res) => {
      if (req.method === 'GET') {
        try {
          const entries = sanitizeUpdatePlanEntries(await readJsonFile(UPDATE_PLAN_FILE, []));
          const session = getSessionFromRequest(req);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: true, entries, canEdit: isUpdatePlanAdminSession(session) }));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: false,
            error: 'update_plan_read_failed',
            detail: error instanceof Error ? error.message : String(error)
          }));
        }
        return;
      }

      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        req.__body = payload;
        const session = getSessionFromRequest(req);
        if (!session) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(buildInvalidSessionPayload(payload?.token)));
          return;
        }
        if (!isUpdatePlanAdminSession(session)) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'forbidden', detail: 'admin_only' }));
          return;
        }
        const entries = sanitizeUpdatePlanEntries(payload?.entries);
        await writeJsonFile(UPDATE_PLAN_FILE, entries);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: true, entries, savedTo: UPDATE_PLAN_FILE, canEdit: true }));
      } catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'update_plan_write_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });

    server.middlewares.use('/__animation-lab/save-preset', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const presetKey = String(payload?.presetKey || '').trim();
        const label = String(payload?.label || '').trim();
        const saveTarget = payload?.saveTarget && typeof payload.saveTarget === 'object'
          ? payload.saveTarget
          : null;
        const targetType = String(saveTarget?.type || '').trim();
        const constName = String(payload?.constName || '').trim();
        const sourceFile = String(saveTarget?.sourceFile || '').trim();
        const html = stripOuterCodeFence(payload?.html);

        if (!html) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'invalid_payload' }));
          return;
        }

        if (targetType === 'raw') {
          const rawFilePath = resolveAnimationLabRawFile(sourceFile);
          if (!rawFilePath) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: 'invalid_source_file' }));
            return;
          }
          await fs.writeFile(rawFilePath, html, 'utf8');
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({
            ok: true,
            preset: {
              key: presetKey,
              label,
              html,
              saveTarget: {
                type: 'raw',
                sourceFile
              }
            }
          }));
          return;
        }

        const source = await fs.readFile(ANIMATION_LAB_PRESET_FILE, 'utf8');
        const existingKey = presetKey ? animationLabPresetKeyExists(source, presetKey) : false;
        let resolvedConstName = String(constName || '').trim();
        if (!resolvedConstName && presetKey) {
          resolvedConstName = findAnimationLabPresetConstNameByKey(source, presetKey);
        }
        if (!resolvedConstName && existingKey) {
          resolvedConstName = toAnimationLabPresetConstName(presetKey);
        }
        let nextSource = resolvedConstName ? replacePresetTemplateLiteral(source, resolvedConstName, html) : null;
        if (!nextSource && existingKey) {
          const fallbackConstName = findAnimationLabPresetConstNameByKey(source, presetKey) || toAnimationLabPresetConstName(presetKey);
          if (fallbackConstName) {
            resolvedConstName = fallbackConstName;
            nextSource = replacePresetTemplateLiteral(source, resolvedConstName, html);
          }
        }
        if (!nextSource) {
          if (!presetKey || !label) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: 'preset_not_found' }));
            return;
          }
          if (existingKey) {
            res.statusCode = 409;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({
              ok: false,
              error: 'preset_update_failed',
              detail: `preset_update_failed:${presetKey}:${resolvedConstName || 'no_const'}`
            }));
            return;
          }
          resolvedConstName = toAnimationLabPresetConstName(presetKey);
          if (!resolvedConstName) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: 'invalid_preset_key' }));
            return;
          }
          nextSource = appendAnimationLabPreset(source, {
            presetKey,
            label,
            constName: resolvedConstName,
            html
          });
          if (!nextSource) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: false, error: 'preset_append_failed' }));
            return;
          }
        }

        if (nextSource !== source) {
          SUPPRESSED_HOT_UPDATES.add(ANIMATION_LAB_PRESET_FILE_KEY);
          await fs.writeFile(ANIMATION_LAB_PRESET_FILE, nextSource, 'utf8');
          setTimeout(() => {
            SUPPRESSED_HOT_UPDATES.delete(ANIMATION_LAB_PRESET_FILE_KEY);
          }, 1500);
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          preset: {
            key: presetKey,
            label,
            html,
            saveTarget: {
              type: 'inline',
              constName: resolvedConstName
            }
          }
        }));
      } catch (error) {
        SUPPRESSED_HOT_UPDATES.delete(ANIMATION_LAB_PRESET_FILE_KEY);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'write_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });
    server.middlewares.use('/__animation-lab/rename-preset', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const presetKey = String(payload?.presetKey || '').trim();
        const label = String(payload?.label || '').trim();
        if (!presetKey || !label) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'preset_key_and_label_required' }));
          return;
        }
        const source = await fs.readFile(ANIMATION_LAB_PRESET_FILE, 'utf8');
        const nextSource = replaceAnimationLabPresetLabel(source, presetKey, label);
        if (!nextSource) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'preset_not_found' }));
          return;
        }
        if (nextSource !== source) {
          ANIMATION_LAB_SUPPRESSED_HOT_UPDATES.add(ANIMATION_LAB_PRESET_FILE_KEY);
          await fs.writeFile(ANIMATION_LAB_PRESET_FILE, nextSource, 'utf8');
          setTimeout(() => {
            ANIMATION_LAB_SUPPRESSED_HOT_UPDATES.delete(ANIMATION_LAB_PRESET_FILE_KEY);
          }, 1500);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          preset: {
            key: presetKey,
            label
          }
        }));
      } catch (error) {
        ANIMATION_LAB_SUPPRESSED_HOT_UPDATES.delete(ANIMATION_LAB_PRESET_FILE_KEY);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'rename_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });
    server.middlewares.use('/__field-map-300/save-preset', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const objects = Array.isArray(payload?.objects) ? payload.objects : [];
        const itemTuningByKey = payload?.itemTuningByKey && typeof payload.itemTuningByKey === 'object'
          ? payload.itemTuningByKey
          : {};
        const treeTuningByKey = payload?.treeTuningByKey && typeof payload.treeTuningByKey === 'object'
          ? payload.treeTuningByKey
          : {};
        const nextPayload = {
          version: 1,
          grid: {
            cols: Number(payload?.grid?.cols) || 60,
            rows: Number(payload?.grid?.rows) || 30
          },
          facilityInstanceSeed: Math.max(1, Number(payload?.facilityInstanceSeed) || 1),
          orchardBounds: payload?.orchardBounds && typeof payload.orchardBounds === 'object'
            ? payload.orchardBounds
            : null,
          utilityBounds: payload?.utilityBounds && typeof payload.utilityBounds === 'object'
            ? payload.utilityBounds
            : null,
          objects,
          itemTuningByKey,
          treeTuningByKey
        };

        SUPPRESSED_HOT_UPDATES.add(FIELD_MAP_300_SAVED_PRESET_FILE_KEY);
        await fs.mkdir(path.dirname(FIELD_MAP_300_SAVED_PRESET_FILE), { recursive: true });
        await fs.writeFile(
          FIELD_MAP_300_SAVED_PRESET_FILE,
          `${JSON.stringify(nextPayload, null, 2)}\n`,
          'utf8'
        );
        setTimeout(() => {
          SUPPRESSED_HOT_UPDATES.delete(FIELD_MAP_300_SAVED_PRESET_FILE_KEY);
        }, 1500);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          savedTo: FIELD_MAP_300_SAVED_PRESET_FILE,
          objectCount: objects.length
        }));
      } catch (error) {
        SUPPRESSED_HOT_UPDATES.delete(FIELD_MAP_300_SAVED_PRESET_FILE_KEY);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'field_map_300_save_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });
    server.middlewares.use('/__external-map/save-preset', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        req.__body = payload;
        const session = getSessionFromRequest(req);
        if (!session) {
          res.statusCode = 401;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(buildInvalidSessionPayload(payload?.token)));
          return;
        }
        if (!isUpdatePlanAdminSession(session)) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'forbidden', detail: 'admin_only' }));
          return;
        }

        const nextPayload = {
          meta: payload?.meta && typeof payload.meta === 'object'
            ? payload.meta
            : {},
          lands: Array.isArray(payload?.lands) ? payload.lands : (Array.isArray(payload?.contours) ? payload.contours : []),
          roads: Array.isArray(payload?.roads) ? payload.roads : [],
          rivers: Array.isArray(payload?.rivers) ? payload.rivers : [],
          markers: Array.isArray(payload?.markers) ? payload.markers : [],
          fieldMarkers: Array.isArray(payload?.fieldMarkers) ? payload.fieldMarkers : []
        };

        SUPPRESSED_HOT_UPDATES.add(EXTERNAL_MAP_DATA_FILE_KEY);
        await writeJsonFile(EXTERNAL_MAP_DATA_FILE, nextPayload);
        setTimeout(() => {
          SUPPRESSED_HOT_UPDATES.delete(EXTERNAL_MAP_DATA_FILE_KEY);
        }, 1500);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          savedTo: EXTERNAL_MAP_DATA_FILE
        }));
      } catch (error) {
        SUPPRESSED_HOT_UPDATES.delete(EXTERNAL_MAP_DATA_FILE_KEY);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'external_map_save_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });
    server.middlewares.use('/__field-map-300/save-facility-catalog', async (req, res) => {
      if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
        return;
      }

      try {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString('utf8');
        const payload = raw ? JSON.parse(raw) : {};
        const item = payload?.item && typeof payload.item === 'object' ? payload.item : null;
        const key = String(item?.key || '').trim();

        if (!item || !key) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ ok: false, error: 'facility_item_required' }));
          return;
        }

        const currentCatalog = await readJsonFile(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE, {
          version: 1,
          items: []
        });
        const nextItems = Array.isArray(currentCatalog?.items) ? [...currentCatalog.items] : [];
        const nextItem = {
          ...item,
          key,
          name: String(item?.name || '').trim() || key,
          width: Math.max(1, Number(item?.width) || 1),
          height: Math.max(1, Number(item?.height) || 1),
          occupyPy: Math.max(0, Number(item?.occupyPy) || 0),
          hint: String(item?.hint || ''),
          type: String(item?.type || 'facility'),
          placementMode: String(item?.placementMode || ''),
          previewSkin: String(item?.previewSkin || 'facility'),
          previewTone: String(item?.previewTone || 'summer'),
          previewImageKey: String(item?.previewImageKey || ''),
          previewImageName: String(item?.previewImageName || ''),
          installGroup: String(item?.installGroup || 'general'),
          placementKind: String(item?.placementKind || (item?.placementMode ? 'paint' : 'area')),
          fixedFootprint: Boolean(item?.fixedFootprint),
          treeAge: Math.max(1, Math.min(6, Number(item?.treeAge) || 1)),
          category: String(item?.category || (item?.placementMode ? 'painter' : 'facility'))
        };

        const existingIndex = nextItems.findIndex((entry) => String(entry?.key || '') === key);
        if (existingIndex >= 0) nextItems[existingIndex] = nextItem;
        else nextItems.push(nextItem);

        const nextPayload = {
          version: 1,
          items: nextItems
        };

        SUPPRESSED_HOT_UPDATES.add(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE_KEY);
        await fs.mkdir(path.dirname(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE), { recursive: true });
        await fs.writeFile(
          FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE,
          `${JSON.stringify(nextPayload, null, 2)}\n`,
          'utf8'
        );
        setTimeout(() => {
          SUPPRESSED_HOT_UPDATES.delete(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE_KEY);
        }, 1500);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: true,
          savedTo: FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE,
          key
        }));
      } catch (error) {
        SUPPRESSED_HOT_UPDATES.delete(FIELD_MAP_300_FACILITY_CATALOG_OVERRIDE_FILE_KEY);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({
          ok: false,
          error: 'field_map_300_catalog_save_failed',
          detail: error instanceof Error ? error.message : String(error)
        }));
      }
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use(staticAssetCacheMiddleware('preview'));
  },
  handleHotUpdate(ctx) {
    const fileKey = normalizeWatchFilePath(ctx.file);
    if (SUPPRESSED_HOT_UPDATES.has(fileKey)) {
      SUPPRESSED_HOT_UPDATES.delete(fileKey);
      return [];
    }
    return undefined;
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  LM_STUDIO_BASE_URL = String(env.LM_STUDIO_BASE_URL || DEFAULT_LM_STUDIO_BASE_URL).trim() || DEFAULT_LM_STUDIO_BASE_URL;
  LM_STUDIO_CHAT_API_URL = `${LM_STUDIO_BASE_URL}/v1/chat/completions`;
  LM_STUDIO_MODELS_API_URL = `${LM_STUDIO_BASE_URL}/v1/models`;
  LM_STUDIO_NATIVE_CHAT_API_URL = `${LM_STUDIO_BASE_URL}/api/v1/chat`;
  LM_STUDIO_API_AUTH_TOKEN = String(env.LM_STUDIO_API_TOKEN || '').trim();

  return {
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      watch: {
        usePolling: true,
        interval: 300
      }
    },
    plugins: [animationLabPresetSavePlugin()]
  };
});
