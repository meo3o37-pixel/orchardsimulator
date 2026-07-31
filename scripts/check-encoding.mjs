import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src', 'scripts', 'public', 'docs'];
const TARGET_FILES = [
  'package.json',
  'package-lock.json',
  'vite.config.mjs',
  'index.html',
  'phone_ui.html',
  'AGENTS.md',
  '.editorconfig',
  '.gitattributes',
  '.gitignore',
  'run-dev-server.cmd',
  'run-dev-server.ps1',
  'run-dev-server-wsl.cmd'
];
const EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx',
  '.css', '.html', '.json', '.md', '.yml', '.yaml',
  '.ps1', '.cmd', '.bat', '.txt', '.csv'
]);
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git']);
const utf8Decoder = new TextDecoder('utf-8', { fatal: true });

const suspiciousPatterns = [
  /\u00C3./g,
  /\u00C2./g,
  /\uFFFD/g,
  /(?:\u00EC|\u00EB|\u00EA|\u00ED|\u00CE|\u00CF|\u00D0|\u00D1|\u00D2|\u00D3|\u00D4|\u00D5|\u00D6|\u00D8|\u00D9|\u00DA|\u00DB|\u00DC|\u00DD|\u00DE)/g
];

function walk(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (EXTENSIONS.has(ext)) out.push(full);
  }
  return out;
}

function scanFile(filePath) {
  let raw;
  try {
    raw = utf8Decoder.decode(fs.readFileSync(filePath));
  } catch {
    return [{
      file: path.relative(ROOT, filePath),
      line: 1,
      text: '유효한 UTF-8 파일이 아닙니다.'
    }];
  }
  const lines = raw.split(/\r?\n/);
  const findings = [];
  lines.forEach((line, i) => {
    const matched = suspiciousPatterns.some((re) => {
      re.lastIndex = 0;
      return re.test(line);
    });
    if (!matched) return;
    findings.push({
      file: path.relative(ROOT, filePath),
      line: i + 1,
      text: line.trim().slice(0, 140)
    });
  });
  return findings;
}

const filesFromDirs = TARGET_DIRS.flatMap((dir) => {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) return [];
  return walk(full);
});

const filesFromRoot = TARGET_FILES
  .map((file) => path.join(ROOT, file))
  .filter((file) => fs.existsSync(file));

const files = [...new Set([...filesFromDirs, ...filesFromRoot])];

const findings = files.flatMap(scanFile);

if (findings.length > 0) {
  console.error('[encoding-check] 깨진 인코딩(모지바케) 의심 문자열을 찾았습니다.');
  findings.forEach((f) => {
    console.error(`- ${f.file}:${f.line} ${f.text}`);
  });
  process.exit(1);
}

console.log('[encoding-check] OK');
