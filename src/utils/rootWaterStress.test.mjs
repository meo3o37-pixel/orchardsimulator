import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { advanceRootWaterStress, normalizeRootWaterStress, rootWaterStressEffects, enforceRootVigorPenalty } from './rootWaterStress.js';
import { soilDailyWaterLoss, SOIL_TYPES } from './soil.js';
import { applyDailyDrainage, drainageLength } from '../features/cadastre/drainage.js';

const loadBundle = async (file, plugins = []) => {
 const output = await build({entryPoints:[fileURLToPath(file)],bundle:true,write:false,platform:'node',format:'esm',plugins});
 return import('data:text/javascript;base64,'+Buffer.from(output.outputFiles[0].text).toString('base64'));
};
const dynamics = await loadBundle(new URL('./fieldDynamics.js',import.meta.url));
const soil = key => Object.fromEntries(SOIL_TYPES.map(t=>[t.key,t.key===key?100:0]));
const field = (key='clay') => ({id:0,cropId:'fuji',trees:200,water:80,quality:80,vigor:50,py:300,slopeDeg:0,soilComposition:soil(key)});
const stepStress = (f,water,day) => ({...f,water,rootWaterStress:advanceRootWaterStress(f,water,day)});

test('80 water needs sustained exposure, while 90 immediately causes real damage',()=>{
 let f=stepStress(field(),80,1);assert.equal(rootWaterStressEffects(f).vigorPenalty,0);
 f=stepStress(f,80,2);assert.ok(rootWaterStressEffects(f).vigorPenalty>0);assert.ok(rootWaterStressEffects(f).qualityPenalty>0);
 const danger=stepStress(field(),90,1);assert.ok(rootWaterStressEffects(danger).vigorPenalty>.8);
 assert.equal(rootWaterStressEffects({...danger,cropId:null,trees:0}).vigorPenalty,0);
 assert.equal(rootWaterStressEffects({...danger,water:75}).qualityPenalty,0);
});

test('slow-draining textures accumulate more damage; rainfall never grants vigor in severe overwatering',()=>{
 let sand=field('sand'),clay=field('clay');
 for(let day=1;day<=6;day++){sand=stepStress(sand,95,day);clay=stepStress(clay,95,day)}
 assert.ok(rootWaterStressEffects(clay).qualityPenalty>rootWaterStressEffects(sand).qualityPenalty);
 assert.ok(rootWaterStressEffects(clay).vigorPenalty>rootWaterStressEffects(sand).vigorPenalty);
 assert.ok(dynamics.dailyVigorIncrease(7,'장마',100,95)<0);
 assert.ok(dynamics.dailyVigorIncrease(7,'장마',100,65)>0);
 const moreWet=stepStress(clay,100,7);assert.ok(rootWaterStressEffects(moreWet).vigorPenalty<=3);
});

test('save/load cannot reset accumulation; healthy moisture recovers gradually and day replay is stable',()=>{
 let f=field();for(let day=1;day<=5;day++)f=stepStress(f,95,day);
 const saved=JSON.parse(JSON.stringify(f));assert.deepEqual(normalizeRootWaterStress(saved.rootWaterStress),f.rootWaterStress);
 assert.deepEqual(advanceRootWaterStress(saved,95,5),saved.rootWaterStress);
 const healed=stepStress(saved,75,6);assert.equal(healed.rootWaterStress.wetDays,0);assert.equal(healed.rootWaterStress.load,saved.rootWaterStress.load-5);
 assert.equal(rootWaterStressEffects(healed).vigorPenalty,0);
 assert.ok(healed.rootWaterStress.load>0);
 for(let day=7;day<=20;day++)f=stepStress(day===7?healed:f,70,day);
 assert.equal(f.rootWaterStress.load,0);
 assert.equal(normalizeRootWaterStress({wetDays:-10,load:Infinity}).wetDays,0);
});

test('persistent wetness guarantees vigor loss without stacking stronger existing losses',()=>{
 const f=stepStress(field(),95,1),effect=rootWaterStressEffects(f);
 assert.ok(enforceRootVigorPenalty(f,{...f,vigor:53},effect).vigor<50);
 assert.equal(enforceRootVigorPenalty(f,{...f,vigor:40},effect).vigor,40);
 assert.equal(enforceRootVigorPenalty({...f,vigor:.1},{...f,vigor:2},effect).vigor,0);
 // Owning a plan is not an immunity buff if it failed to lower root moisture.
 assert.equal(rootWaterStressEffects({...f,drainage:{routes:[]}}).qualityPenalty,effect.qualityPenalty);
});

const p=(x,y)=>({x:x/1000,y:y/1000});
const completeDrains=()=>{
 const routes=[{id:'out',type:'main',points:[p(28,0),p(28,32)]},{id:'main',type:'pipe150',points:[p(1,28),p(28,28)],depthStart:.8,depthEnd:1}];
 for(const x of [5,10,15,20,25])routes.push({id:`branch${x}`,type:'pipe100',points:[p(x,0),p(x,28)],depthStart:.6,depthEnd:.75});
 return{version:1,bearing:90,slopeDeg:0,boundary:[p(0,0),p(30,0),p(30,30),p(0,30)],routes:routes.map(r=>({...r,work:drainageLength(r.points),blockage:0}))};
};
const simulate=(key,drainage)=>{
 let f={...field(key),drainage},loss=0,damageDays=0;
 for(let day=1;day<=10;day++){
  const base=dynamics.dailyWaterDrain(7,'소나기'),rain=dynamics.rainfallWaterGain('소나기');
  const result=applyDailyDrainage(f,Math.max(0,f.water-soilDailyWaterLoss(f,base))+rain,rain,day);
  f=stepStress({...f,drainage:result.drainage},result.water,day);
  const effects=rootWaterStressEffects(f);loss+=effects.qualityPenalty;if(effects.vigorPenalty)damageDays++;
 }
 return{water:f.water,loss,damageDays};
};
test('ten rainy days punish unprotected clay much more than sand or working drainage',t=>{
 const bare=simulate('clay'),sand=simulate('sand'),drained=simulate('clay',completeDrains());
 assert.ok(bare.loss>sand.loss*1.4);assert.ok(bare.loss>drained.loss*2);assert.ok(bare.water>drained.water+10);assert.ok(bare.damageDays>drained.damageDays);
 t.diagnostic(JSON.stringify({bareClay:bare,bareSand:sand,protectedClay:drained}));
});

// Controlled downstream growth isolates the real lifecycle integration: rain
// recovery is deliberately +2 vigor, and the legacy water loss is only .2.
const lifecycle=await loadBundle(new URL('../features/day/advanceDayFieldLifecycleUtils.js',import.meta.url),[{
 name:'controlled-growth',setup(b){b.onLoad({filter:/advanceDayField(Surface|Biology|Finalize)Utils\.js$/},args=>{
 if(args.path.includes('Surface'))return{contents:'export const buildAdvanceDayFieldSurface=()=>({nextWeed:0});'};
 if(args.path.includes('Biology'))return{contents:'export const buildAdvanceDayFieldBiology=()=>({});'};
 return{contents:'export const finalizeAdvanceDayField=(p,d)=>({nextField:{...p.field,water:p.nextWater,vigor:p.field.vigor+2,quality:p.field.quality+.1-d.dailyWaterQualityPenalty(p.nextWater)}});'};
 })}
}]);
test('real day lifecycle persists stress and passes max quality loss rather than adding it twice',()=>{
 const f=field();const result=lifecycle.processAdvanceDayFieldLifecycle({field:f,nextDay:1,nextWater:95},{surface:{},biology:{},finalize:{dailyWaterQualityPenalty:()=>.2}}).fieldFinalizationResult.nextField;
 const effects=rootWaterStressEffects(result);
 assert.equal(result.rootWaterStress.wetDays,1);assert.ok(result.vigor<50);
 assert.ok(Math.abs(result.quality-(80.1-effects.qualityPenalty))<1e-8);
 const dry=lifecycle.processAdvanceDayFieldLifecycle({field:f,nextDay:1,nextWater:60},{surface:{},biology:{},finalize:{dailyWaterQualityPenalty:()=>0}}).fieldFinalizationResult.nextField;
 assert.equal(dry.vigor,52);assert.equal(dry.rootWaterStress.load,0);
});
