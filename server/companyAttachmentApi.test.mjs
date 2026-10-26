import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCompanyAttachmentStore, registerCompanyAttachmentApi, sanitizeAttachments, MAX_ATTACHMENT_SIZE } from './companyAttachmentApi.mjs';

test('private attachments: upload, validation, ownership, download and membership revocation', async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'orchard-attachments-test-'));
  try {
    const store = createCompanyAttachmentStore(directory);
    let handler;
    let members = ['owner', 'member'];
    const room = { entries: [] };
    registerCompanyAttachmentApi({ middlewares: { use(fn) { handler = fn; } } }, {
      store, getSessionFromRequest: (req) => req.session,
      readCompanyRoomData: async () => room,
      isCompanyRoomMemberSession: (session) => members.includes(session.username)
    });
    const call = async (username, method, url, name, body = Buffer.from('첨부 테스트'), extraHeaders = {}) => {
      const req = { method, url, session: username ? { username } : null, headers: { 'x-file-name': encodeURIComponent(name || '검토.txt'), ...extraHeaders }, async *[Symbol.asyncIterator]() { yield body; } };
      let output;
      const headers = {};
      const res = { statusCode: 200, setHeader(key, value) { headers[key] = value; }, end(value) { output = value; } };
      await handler(req, res, () => { throw new Error('unexpected middleware fallthrough'); });
      return { status: res.statusCode, headers, raw: output, json: () => JSON.parse(output) };
    };
    const prefix = '/__company-founding-room/attachments';
    assert.equal((await call(null, 'POST', prefix)).status, 401);
    assert.equal((await call('outsider', 'POST', prefix)).status, 403);
    assert.equal((await call('member', 'POST', prefix, 'test.html')).status, 400);
    assert.equal((await call('member', 'POST', prefix, 'fake.png')).status, 400);
    assert.equal((await call('member', 'POST', prefix, 'big.pdf', Buffer.from('x'), { 'content-length': MAX_ATTACHMENT_SIZE + 1 })).status, 413);
    assert.equal((await call('member', 'POST', prefix, 'empty.txt', Buffer.alloc(0))).status, 400);
    const uploaded = await call('member', 'POST', prefix, '사업 계획.txt');
    assert.equal(uploaded.status, 201);
    const meta = uploaded.json().attachment;
    assert.equal(meta.name, '사업 계획.txt');
    assert.equal(meta.uploadedBy, undefined);
    assert.equal((await call('member', 'GET', `${prefix}/${meta.id}`)).status, 404);
    await assert.rejects(store.resolve([meta.id], { username: 'owner' }), { status: 403 });
    await assert.rejects(store.resolve(Array(6).fill(meta.id), { username: 'member' }), { status: 400 });
    await assert.rejects(store.resolve(['../secret'], { username: 'member' }), { status: 400 });
    const attachments = await store.resolve([meta.id], { username: 'member' });
    assert.equal(sanitizeAttachments(attachments)[0].id, meta.id);
    room.entries.push({ attachments, comments: [] });
    const downloaded = await call('owner', 'GET', `${prefix}/${meta.id}`);
    assert.equal(downloaded.status, 200);
    assert.equal(downloaded.raw.toString(), '첨부 테스트');
    assert.equal(downloaded.headers['Cache-Control'], 'private, no-store');
    assert.ok(downloaded.headers['Content-Disposition'].includes(encodeURIComponent('사업 계획.txt')));
    assert.equal((await call(null, 'GET', `${prefix}/${meta.id}`)).status, 401);
    members = ['owner'];
    assert.equal((await call('member', 'GET', `${prefix}/${meta.id}`)).status, 403);
    assert.equal((await call(null, 'GET', `/data/company-room-attachments/${meta.id}.bin`)).status, 403);
    assert.equal((await call(null, 'GET', `/@fs/C:/project/data/company-room-attachments/${meta.id}.json`)).status, 403);
    assert.equal((await call(null, 'GET', `/data%2fcompany-room-attachments%2f${meta.id}.bin`)).status, 403);
    room.entries[0] = { comments: [{ attachments }] };
    assert.equal((await call('owner', 'GET', `${prefix}/${meta.id}`)).status, 200);
    room.entries = [];
    assert.equal((await call('owner', 'GET', `${prefix}/${meta.id}`)).status, 404);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
