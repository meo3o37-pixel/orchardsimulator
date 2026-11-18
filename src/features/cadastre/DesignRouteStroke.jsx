import React from 'react';
export const DRAIN_VISUAL={earth:{color:'#a86b30',width:2.5,dash:'7 4'},lined:{color:'#2b869b',width:4,dash:'9 4'},main:{color:'#667489',width:6,dash:'12 4'},pipe100:{color:'#8646bf',width:2.5,dash:'7 4'},pipe150:{color:'#653092',width:3.5,dash:'7 4'}};
export function DrainStroke({points,type,complete=false}){
 const v=DRAIN_VISUAL[type]||DRAIN_VISUAL.earth;
 return <g><polyline points={points} fill="none" stroke={v.color} strokeWidth={v.width} strokeDasharray={complete?undefined:v.dash} strokeLinecap={type==='main'?'butt':'round'} strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>{(type==='lined'||type==='main')&&<polyline points={points} fill="none" stroke={type==='main'?'#e4e9ef':'#c3edf2'} strokeWidth={type==='main'?2.5:1} strokeDasharray={complete?undefined:v.dash} strokeLinecap={type==='main'?'butt':'round'} strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>}</g>;
}

