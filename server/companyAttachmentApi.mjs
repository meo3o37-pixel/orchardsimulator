import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
export const MAX_ATTACHMENTS = 5;
const PREFIX = '/__company-founding-room/attachments';
const ID = /^[a-f0-9]{40}$/;
const TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  pdf: 'application/pdf', txt: 'text/plain', csv: 'text/csv',
  doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  hwp: 'application/x-hwp', hwpx: 'application/zip', zip: 'application/zip'
};
const fail = (status, message) => Object.assign(new Error(message), { status });
export const sanitizeAttachments = (items) => (Array.isArray(items) ? items : []).slice(0, MAX_ATTACHMENTS)
  .filter((item) => ID.test(item?.id || ''))
  .map(({ id, name, type, size }) => ({ id, name: String(name || '').slice(0, 180), type: String(type || '').slice(0, 120), size: Number(size) || 0 }));
const publicMetadata = ({ id, name, type, size }) => ({ id, name, type, size });

export function createCompanyAttachmentStore(directory) {
  const read = async (id) => {
    if (!ID.test(id || '')) throw fail(400, '첨부파일 정보가 올바르지 않습니다.');
    try { return JSON.parse(await fs.readFile(path.join(directory, `${id}.json`), 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') throw fail(404, '첨부파일을 찾을 수 없습니다.'); throw error; }
  };
  return {
    read,
    filePath: (id) => path.join(directory, `${id}.bin`),
    async resolve(ids, session) {
      if (ids == null) return [];
      if (!Array.isArray(ids) || ids.length > MAX_ATTACHMENTS || new Set(ids).size !== ids.length) throw fail(400, '첨부파일은 최대 5개까지 등록할 수 있습니다.');
      return Promise.all(ids.map(async (id) => {
        const meta = await read(id);
        if (meta.uploadedBy.toLowerCase() !== String(session.username).toLowerCase()) throw fail(403, '직접 업로드한 파일만 첨부할 수 있습니다.');
        return publicMetadata(meta);
      }));
    },
    async save(req, session) {
      let name;
      try { name = decodeURIComponent(String(req.headers['x-file-name'] || '')); }
      catch { throw fail(400, '파일 이름이 올바르지 않습니다.'); }
      name = path.basename(name.replaceAll('\\', '/')).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 180);
      const ext = name.split('.').pop().toLowerCase();
      const type = TYPES[ext];
      if (!name || !type) throw fail(400, '사진·PDF·한글·오피스·텍스트·ZIP 파일만 첨부할 수 있습니다.');
      if (Number(req.headers['content-length']) > MAX_ATTACHMENT_SIZE) throw fail(413, '파일 하나당 최대 10MB까지 첨부할 수 있습니다.');
      let size = 0;
      const chunks = [];
      for await (const chunk of req) {
        size += chunk.length;
        if (size > MAX_ATTACHMENT_SIZE) throw fail(413, '파일 하나당 최대 10MB까지 첨부할 수 있습니다.');
        chunks.push(chunk);
      }
      if (!size) throw fail(400, '빈 파일은 첨부할 수 없습니다.');
      const buffer = Buffer.concat(chunks);
      const signature = buffer.subarray(0, 12);
      const validImage = ext === 'png' ? signature.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
        : ['jpg', 'jpeg'].includes(ext) ? signature[0] === 255 && signature[1] === 216 && signature[2] === 255
          : ext === 'gif' ? /^GIF8[79]a/.test(signature.toString('ascii'))
            : ext === 'webp' ? signature.toString('ascii', 0, 4) === 'RIFF' && signature.toString('ascii', 8, 12) === 'WEBP' : true;
      if (!validImage) throw fail(400, '실제 이미지 형식과 확장자가 일치하지 않습니다.');
      const meta = { id: randomBytes(20).toString('hex'), name, type, size, uploadedBy: session.username, createdAt: new Date().toISOString() };
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(path.join(directory, `${meta.id}.bin`), buffer, { flag: 'wx' });
      await fs.writeFile(path.join(directory, `${meta.id}.json`), JSON.stringify(meta), { flag: 'wx' });
      return publicMetadata(meta);
    }
  };
}

export function registerCompanyAttachmentApi(server, { store, getSessionFromRequest, readCompanyRoomData, isCompanyRoomMemberSession }) {
  server.middlewares.use(async (req, res, next) => {
    let route;
    try { route = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname).replaceAll('\\', '/'); }
    catch { return next(); }
    // Defense in depth in addition to Vite's fs.deny (including /@fs requests).
    if (route.toLowerCase().includes('/data/company-room-attachments/')) {
      res.statusCode = 403; res.end('Forbidden'); return;
    }
    if (route !== PREFIX && !route.startsWith(`${PREFIX}/`)) return next();
    const send = (status, value) => { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      const session = getSessionFromRequest(req);
      if (!session) return send(401, { detail: '다시 로그인해주세요.' });
      const room = await readCompanyRoomData();
      if (!isCompanyRoomMemberSession(session, room)) return send(403, { detail: '승인된 멤버만 첨부파일을 열 수 있습니다.' });
      if (route === PREFIX && req.method === 'POST') return send(201, { attachment: await store.save(req, session) });
      if (route.startsWith(`${PREFIX}/`) && req.method === 'GET') {
        const id = route.slice(PREFIX.length + 1);
        const meta = await store.read(id);
        const referenced = room.entries.some((entry) => (entry.attachments || []).some((item) => item.id === id)
          || (entry.comments || []).some((comment) => (comment.attachments || []).some((item) => item.id === id)));
        if (!referenced) return send(404, { detail: '등록된 글의 첨부파일만 열 수 있습니다.' });
        const buffer = await fs.readFile(store.filePath(id));
        res.setHeader('Content-Type', meta.type);
        res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(meta.name)}`);
        res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
        res.end(buffer); return;
      }
      send(405, { detail: '지원하지 않는 요청입니다.' });
    } catch (error) { send(error.status || 500, { detail: error.status ? error.message : '첨부파일 처리 중 오류가 발생했습니다.' }); }
  });
}
