const fs = require('fs');
const path = require('path');
const app = fs.readFileSync(path.join(process.cwd(),'src','App.jsx'),'utf8');
const gameData = fs.readFileSync(path.join(process.cwd(),'src','gameData.js'),'utf8');
const simData = fs.readFileSync(path.join(process.cwd(),'src','config','simData.js'),'utf8');

function extractTaskKeysFromGameData(text){
  const m = text.match(/tasks:\s*\{([\s\S]*?)\n\s*\},\n\s*monthTaskText:/m);
  if(!m) return [];
  const body = m[1];
  const keys = new Set();
  const re = /\n\s*([a-zA-Z0-9_]+)\s*:\s*\{[^\n]*?key:\s*'([^']+)'/g;
  for (const match of body.matchAll(re)) {
    const k = match[1];
    const key = match[2];
    keys.add(k);
    if(k !== key) {
      keys.add(`alias:${k}->${key}`);
    }
  }
  return Array.from(keys).filter(k=>!k.startsWith('alias:'));
}

function extractSet(name, text){
  const regex = new RegExp(name + "\\s*=\\s*(?:new Set|\[)?([^;]+?);", 'm');
  const m = text.match(regex);
  if(!m) return [];
  const body = m[1];
  const arr = [...body.matchAll(/'([^']+)'/g)].map(x=>x[1]);
  return arr;
}

const taskKeys = extractTaskKeysFromGameData(gameData);
const monthTextMatch = gameData.match(/monthTaskText:\s*\{([\s\S]*?)\n\s*\},\n\s*monthLaborLoad:/m);
const monthText = monthTextMatch ? monthTextMatch[1] : '';

function extractMonthTextTasks(text){
  const months = {};
  if(!text) return months;
  const re = /\n\s*(\d+)\s*:\s*'([^']*)'/g;
  let mm;
  while ((mm = re.exec(text))) {
    months[mm[1]] = mm[2];
  }
  return months;
}

const monthTasks = extractMonthTextTasks(monthText);

const appStageRefs = {
  pollination: extractSet('POLLINATION_STAGE_ONLY_TASK_KEYS', app),
  flowerThin: extractSet('FLOWER_THINNING_STAGE_ONLY_TASK_KEYS', app),
  fruitThin: extractSet('FRUIT_THINNING_STAGE_TASK_KEYS', app),
  foliar: extractSet('FOLIAR_FERTILIZATION_STAGE_TASK_KEYS', app),
  leaf: extractSet('LEAF_PLUCKING_STAGE_TASK_KEYS', app),
  reflective: extractSet('REFLECTIVE_FILM_STAGE_ONLY_TASK_KEYS', app),
};

const simImportSets = {
  pollinationAllowed: extractSet('POLLINATION_ALLOWED_STAGES', simData),
  flowerAllowed: extractSet('FLOWER_THINNING_ALLOWED_STAGES', simData),
  foliarAllowed: extractSet('FOLIAR_FERTILIZATION_ALLOWED_STAGES', app),
  leafAllowed: extractSet('LEAF_PLUCKING_ALLOWED_STAGES', app),
  reflectiveAllowed: extractSet('REFLECTIVE_FIL림_ALLOWED_STAGES', app),
  canopyAllowed: extractSet('CANOPY_TRAINING_ALLOWED_STAGES', app),
};

const allRefTaskKeys = Array.from(new Set(Object.values(appStageRefs).flat().filter(Boolean)));
const missingInTasks = allRefTaskKeys.filter(k => !taskKeys.includes(k));
const definedButUnused = taskKeys.filter(k => !['POLLINATION','FLOWER','FRUIT','FOLIAR','LEAF','REFLECTIVE'].some(_=>false) && false);

console.log('=== TASKS 키 개수 ===', taskKeys.length);
console.log('TASKS 키 목록:', taskKeys.join(', '));
console.log('\n=== 앱에서 stage-only로 참조되는 키 ===');
for(const [k,v] of Object.entries(appStageRefs)){
  console.log(`${k}: ${v.join(', ')||'(empty)'}`);
}
console.log('\n=== 미정의 참조 키 (TASKS에 없음) ===', missingInTasks.join(', ') || '(none)');

const allMonthTextTaskNames = Object.values(monthTasks).join(' / ');
const monthMentionSet = new Set((allMonthTextTaskNames.match(/[가-힣A-Za-z0-9]+/g)||[]));
console.log('\n=== 월간 작업표 텍스트 키워드 추정(분해) 수 ===', monthMentionSet.size);
consolen
const taskLabelCheck = {
  pollination: taskKeys.includes('pollination'),
  flowerThinning: taskKeys.includes('flowerThinning'),
  canopyTraining: taskKeys.includes('canopyTraining'),
  thinning1: taskKeys.includes('thinning1'),
  thinning2: taskKeys.includes('thinning2'),
  thinning3: taskKeys.includes('thinning3'),
  leafPlucking: taskKeys.includes('leafPlucking'),
  reflectiveFilm: taskKeys.includes('reflectiveFilm')
};
console.log('\n=== 핵심 키 존재 확인 ===');
Object.entries(taskLabelCheck).forEach(([k,v])=>console.log(`${k}: ${v?'OK':'MISSING'}`));

if(simData.includes("FLOWER_THINNING_ALLOWED_STAGES")) {
  console.log('\n=== simData에서 FLOWER_THINNING_ALLOWED_STAGES 라인 존재 ===', /FLOWER_THINNING_ALLOWED_STAGES\s*=/.test(simData));
}

console.log('\n=== 월별 텍스트 샘플 ===');
for(const m of [1,3,4,5,6,7,8,9,10,11,12]){
  console.log(`${m}월: ${monthTasks[m]}`);
}

if (missingInTasks.length) {
  console.log('\n[경고] TASKS에 없는 키가 앱에서 참조되고 있습니다.');
} else {
  console.log('\n[정상] stage-only 참조 키는 모두 TASKS에 존재합니다.');
}
