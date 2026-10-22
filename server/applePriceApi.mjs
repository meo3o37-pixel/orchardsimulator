import path from 'node:path';
import { DEFAULT_APPLE_PRICE_TABS, validateApplePriceTabs } from '../src/features/companyFounding/applePriceData.mjs';

export function registerApplePriceApi(server, { readJsonFile, writeJsonFile, getSessionFromRequest, readCompanyRoomData, isCompanyRoomMemberSession, isCompanyRoomOwnerSession }) {
  const file = path.resolve(process.cwd(), 'data/apple-price-board.json');
  let queue = Promise.resolve();
  server.middlewares.use(async (req, res, next) => {
    const route = new URL(req.url || '/', 'http://localhost').pathname;
    if (route !== '/__apple-price-board') return next();
    const send = (status, payload) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(payload));
    };
    const previous = queue;
    let release;
    queue = new Promise((resolve) => { release = resolve; });
    await previous;
    try {
      if (!['GET', 'POST'].includes(req.method)) return send(405, { ok: false, message: '지원하지 않는 요청입니다.' });
      if (req.method === 'POST') {
        // Authenticate before reading request data; do not accept a client username as authority.
        const session = getSessionFromRequest(req);
        if (!session) return send(401, { ok: false, message: '로그인이 필요합니다.' });
        const room = await readCompanyRoomData();
        if (!isCompanyRoomMemberSession(session, room) || !isCompanyRoomOwnerSession(session)) return send(403, { ok: false, message: '가격표 저장은 방장만 할 수 있습니다.' });
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          size += chunk.length;
          if (size > 2 * 1024 * 1024) return send(413, { ok: false, message: '가격표 데이터가 너무 큽니다.' });
          chunks.push(chunk);
        }
        let payload;
        try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { return send(400, { ok: false, message: '가격표 데이터를 읽을 수 없습니다.' }); }
        const current = await readJsonFile(file, { revision: 0, tabs: DEFAULT_APPLE_PRICE_TABS });
        if (payload.revision !== current.revision) return send(409, { ok: false, message: '다른 창에서 가격표가 변경됐습니다. 작성 내용을 확인한 후 최신 자료를 다시 불러와주세요.' });
        let tabs;
        try { tabs = validateApplePriceTabs(payload.tabs); }
        catch (error) { return send(400, { ok: false, message: error.message }); }
        const updated = { revision: current.revision + 1, tabs, updatedAt: new Date().toISOString(), updatedBy: session.username };
        // Preserve the previous published table for recovery before replacing it.
        await writeJsonFile(`${file}.previous`, current);
        await writeJsonFile(file, updated);
        return send(200, { ok: true, ...updated });
      }
      const current = await readJsonFile(file, { revision: 0, tabs: DEFAULT_APPLE_PRICE_TABS });
      // The public endpoint returns only the published price table, never room membership or sessions.
      return send(200, { ok: true, revision: current.revision, tabs: validateApplePriceTabs(current.tabs), updatedAt: current.updatedAt || '' });
    } catch (error) {
      console.error('[apple-price-board]', error);
      send(500, { ok: false, message: '가격표를 처리하지 못했습니다. 잠시 후 다시 시도해주세요.' });
    } finally { release(); }
  });
}
