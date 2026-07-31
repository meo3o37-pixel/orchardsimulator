import fs from 'node:fs';
import path from 'node:path';

const RECOVERED_FILE = path.resolve(process.cwd(), 'data/recovered-whale-profile1.json');
const ACCOUNTS_FILE = path.resolve(process.cwd(), 'data/accounts.json');
const ACCOUNT_SAVES_DIR = path.resolve(process.cwd(), 'data/account-saves');
const targetUsername = String(process.argv[2] || 'meo3o').trim().toLowerCase();

const readJson = (filePath, fallback = null) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const sanitizeJsonText = (input) => {
  let out = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const code = ch.charCodeAt(0);

    if (!inString) {
      out += ch;
      if (ch === '"') inString = true;
      continue;
    }

    if (escaped) {
      if ('\\"/bfnrtu'.includes(ch)) {
        out += ch;
      } else {
        out += `\\${ch}`;
      }
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      out += '\\';
      escaped = true;
      continue;
    }

    if (ch === '"') {
      out += '"';
      inString = false;
      continue;
    }

    if (code < 32) {
      out += `\\u${code.toString(16).padStart(4, '0')}`;
      continue;
    }

    out += ch;
  }

  return out;
};

const recoveredItems = readJson(RECOVERED_FILE, []);
const accounts = readJson(ACCOUNTS_FILE, []);
const account = accounts.find((entry) => String(entry?.username || '').toLowerCase() === targetUsername);

if (!account) {
  console.error(`ACCOUNT_NOT_FOUND:${targetUsername}`);
  process.exit(1);
}

const targetFile = path.join(ACCOUNT_SAVES_DIR, `${account.id}.json`);
const currentSave = readJson(targetFile, {
  userId: account.id,
  username: account.username,
  updatedAt: new Date().toISOString(),
  slots: {}
});

const imported = [];
const nextSlots = { ...(currentSave.slots || {}) };
const bestBySlot = new Map();

for (const item of recoveredItems) {
  const slotKey = String(item?.key || '').match(/orchard_slot_\d+/)?.[0];
  if (!slotKey || typeof item?.value !== 'string') continue;
  try {
    const parsed = JSON.parse(sanitizeJsonText(item.value));
    const current = bestBySlot.get(slotKey);
    if (!current || String(item.file || '') > String(current.file || '')) {
      bestBySlot.set(slotKey, { file: item.file, data: parsed });
    }
  } catch {
    // Ignore broken snapshots and keep scanning older/newer ones.
  }
}

for (const [slotKey, entry] of [...bestBySlot.entries()].sort()) {
  nextSlots[slotKey] = entry.data;
  imported.push({
    slotKey,
    file: entry.file,
    farmName: entry.data?.farmName,
    day: entry.data?.day,
    money: entry.data?.money
  });
}

fs.mkdirSync(ACCOUNT_SAVES_DIR, { recursive: true });
fs.writeFileSync(
  targetFile,
  `${JSON.stringify(
    {
      userId: account.id,
      username: account.username,
      updatedAt: new Date().toISOString(),
      slots: nextSlots
    },
    null,
    2
  )}\n`,
  'utf8'
);

console.log(JSON.stringify({ ok: true, targetFile, imported }, null, 2));
