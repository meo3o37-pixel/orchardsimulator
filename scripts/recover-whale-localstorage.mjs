import fs from 'node:fs';
import path from 'node:path';

const LEVELDB_DIR = process.argv[2];
const ORIGIN = process.argv[3] || 'http://192.168.0.4:5173';

if (!LEVELDB_DIR) {
  console.error('Usage: node scripts/recover-whale-localstorage.mjs <leveldb-dir> [origin]');
  process.exit(1);
}

const TABLE_MAGIC = Buffer.from([0x57, 0xfb, 0x80, 0x8b, 0x24, 0x75, 0x47, 0xdb]);

const readVarint = (buffer, start) => {
  let result = 0;
  let shift = 0;
  let offset = start;
  while (offset < buffer.length) {
    const byte = buffer[offset++];
    result += (byte & 0x7f) * 2 ** shift;
    if ((byte & 0x80) === 0) return { value: result, offset };
    shift += 7;
  }
  throw new Error(`Unterminated varint at ${start}`);
};

const decodeBlockHandle = (buffer, start = 0) => {
  const first = readVarint(buffer, start);
  const second = readVarint(buffer, first.offset);
  return { offset: first.value, size: second.value, nextOffset: second.offset };
};

const readUInt32LE = (buffer, offset) =>
  buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16) + (buffer[offset + 3] << 24 >>> 0);

const snappyDecode = (input) => {
  let cursor = 0;
  const preamble = readVarint(input, cursor);
  const output = Buffer.allocUnsafe(preamble.value);
  cursor = preamble.offset;
  let out = 0;

  const copyFromOutput = (offset, length) => {
    if (offset <= 0 || offset > out) throw new Error(`Invalid snappy offset ${offset}`);
    for (let i = 0; i < length; i += 1) {
      output[out] = output[out - offset];
      out += 1;
    }
  };

  while (cursor < input.length && out < output.length) {
    const tag = input[cursor++];
    const type = tag & 0x03;
    if (type === 0) {
      let length = tag >>> 2;
      if (length < 60) {
        length += 1;
      } else {
        const extraBytes = length - 59;
        length = 1;
        for (let i = 0; i < extraBytes; i += 1) {
          length += input[cursor++] << (8 * i);
        }
      }
      input.copy(output, out, cursor, cursor + length);
      cursor += length;
      out += length;
      continue;
    }
    if (type === 1) {
      const length = 4 + ((tag >>> 2) & 0x07);
      const offset = input[cursor++] + ((tag & 0xe0) << 3);
      copyFromOutput(offset, length);
      continue;
    }
    if (type === 2) {
      const length = 1 + (tag >>> 2);
      const offset = input[cursor] + (input[cursor + 1] << 8);
      cursor += 2;
      copyFromOutput(offset, length);
      continue;
    }
    if (type === 3) {
      const length = 1 + (tag >>> 2);
      const offset =
        input[cursor] +
        (input[cursor + 1] << 8) +
        (input[cursor + 2] << 16) +
        (input[cursor + 3] << 24 >>> 0);
      cursor += 4;
      copyFromOutput(offset, length);
    }
  }

  return output.subarray(0, out);
};

const readBlock = (fileBuffer, handle) => {
  const start = handle.offset;
  const end = start + handle.size;
  if (end + 5 > fileBuffer.length) throw new Error(`Block outside file at ${start}`);
  const raw = fileBuffer.subarray(start, end);
  const compressionType = fileBuffer[end];
  if (compressionType === 0) return raw;
  if (compressionType === 1) return snappyDecode(raw);
  throw new Error(`Unsupported compression type ${compressionType}`);
};

const parseDataBlock = (blockBuffer) => {
  if (blockBuffer.length < 4) return [];
  const restartCount = readUInt32LE(blockBuffer, blockBuffer.length - 4);
  const restartOffset = blockBuffer.length - 4 - restartCount * 4;
  if (restartOffset < 0) return [];

  const entries = [];
  let cursor = 0;
  let previousKey = Buffer.alloc(0);
  while (cursor < restartOffset) {
    const sharedInfo = readVarint(blockBuffer, cursor);
    const nonSharedInfo = readVarint(blockBuffer, sharedInfo.offset);
    const valueLenInfo = readVarint(blockBuffer, nonSharedInfo.offset);
    cursor = valueLenInfo.offset;
    const shared = sharedInfo.value;
    const nonShared = nonSharedInfo.value;
    const valueLength = valueLenInfo.value;
    const keySuffix = blockBuffer.subarray(cursor, cursor + nonShared);
    cursor += nonShared;
    const value = blockBuffer.subarray(cursor, cursor + valueLength);
    cursor += valueLength;
    const key = Buffer.concat([previousKey.subarray(0, shared), keySuffix]);
    previousKey = key;
    entries.push({ key, value });
  }
  return entries;
};

const parseTableFile = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  if (fileBuffer.length < 48) throw new Error('File too small');
  const footer = fileBuffer.subarray(fileBuffer.length - 48);
  if (!footer.subarray(40, 48).equals(TABLE_MAGIC)) {
    throw new Error('Bad table magic');
  }
  const metaHandle = decodeBlockHandle(footer, 0);
  const indexHandle = decodeBlockHandle(footer, metaHandle.nextOffset);
  const indexBlock = readBlock(fileBuffer, indexHandle);
  const indexEntries = parseDataBlock(indexBlock);
  const rows = [];
  for (const entry of indexEntries) {
    try {
      const handle = decodeBlockHandle(entry.value, 0);
      const dataBlock = readBlock(fileBuffer, handle);
      rows.push(...parseDataBlock(dataBlock));
    } catch {
      // Skip malformed data blocks.
    }
  }
  return rows;
};

const cleanUtf8 = (buffer) => {
  const text = buffer.toString('utf8');
  return text.replace(/\u0000/g, '');
};

const toUserKey = (internalKey) => {
  if (internalKey.length <= 8) return internalKey;
  return internalKey.subarray(0, internalKey.length - 8);
};

const files = fs
  .readdirSync(LEVELDB_DIR)
  .filter((name) => name.endsWith('.ldb'))
  .sort((a, b) => a.localeCompare(b));

const hits = [];
for (const name of files) {
  const filePath = path.join(LEVELDB_DIR, name);
  try {
    const rows = parseTableFile(filePath);
    for (const row of rows) {
      const userKey = cleanUtf8(toUserKey(row.key));
      if (!userKey.includes(ORIGIN) || !userKey.includes('orchard_slot_')) continue;
      hits.push({
        file: name,
        key: userKey,
        value: cleanUtf8(row.value)
      });
    }
  } catch (error) {
    console.error(`SKIP ${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(JSON.stringify(hits, null, 2));
