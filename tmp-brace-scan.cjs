const fs = require('fs');

const code = fs.readFileSync('src/App.jsx', 'utf8');
let line = 1;
let depth = 0;
let paren = 0;
let state = 'code';
let quote = '';
let escape = false;
const rows = [];

for (let i = 0; i < code.length; i += 1) {
  const ch = code[i];
  const next = code[i + 1];

  if (ch === '\n') {
    if (line >= 48720 && line <= 67060) rows.push([line, depth, paren]);
    line += 1;
    if (state === 'line') state = 'code';
    continue;
  }

  if (state === 'line') continue;
  if (state === 'block') {
    if (ch === '*' && next === '/') {
      state = 'code';
      i += 1;
    }
    continue;
  }
  if (state === 'string') {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === quote) {
      state = 'code';
      quote = '';
    }
    continue;
  }

  if (ch === '/' && next === '/') {
    state = 'line';
    i += 1;
    continue;
  }
  if (ch === '/' && next === '*') {
    state = 'block';
    i += 1;
    continue;
  }
  if (ch === '\'' || ch === '"' || ch === '`') {
    state = 'string';
    quote = ch;
    continue;
  }

  if (ch === '(') paren += 1;
  else if (ch === ')') paren -= 1;
  else if (ch === '{') depth += 1;
  else if (ch === '}') depth -= 1;
}

for (let i = 1; i < rows.length; i += 1) {
  const prev = rows[i - 1];
  const curr = rows[i];
  if (prev[1] !== curr[1] || prev[2] !== curr[2]) {
    console.log(`${curr[0]}: depth=${curr[1]} paren=${curr[2]}`);
  }
}
