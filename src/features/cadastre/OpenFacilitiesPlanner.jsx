import React,{useState}from'react';
import { DoorOpen, Package, ParkingSquare, Route } from 'lucide-react';
import OpenParkingPlanner from'./OpenParkingPlanner';
import OpenYardPlanner from'./OpenYardPlanner';
import RoadPlanner from './RoadPlanner';
import './OpenFacilitiesPlanner.css';
export default function OpenFacilitiesPlanner(props){
 const[tab,setTab]=useState('parking');
 return<div className="open-facilities-planner">
  <nav className="open-facilities-planner__tabs" aria-label="노지 시설 종류">
   <button type="button" aria-pressed={tab==='parking'} onClick={()=>setTab('parking')}><ParkingSquare size={17} strokeWidth={1.8} aria-hidden="true"/><span>노지 주차장 설계</span></button>
   <button type="button" aria-pressed={tab==='yard'} onClick={()=>setTab('yard')}><Package size={17} strokeWidth={1.8} aria-hidden="true"/><span>노지 야적창고 설계</span></button>
   <button type="button" aria-pressed={tab==='entrance'} onClick={()=>setTab('entrance')}><DoorOpen size={17} strokeWidth={1.8} aria-hidden="true"/><span>토지 출입구 설계</span></button>
   <button type="button" aria-pressed={tab==='road'} onClick={()=>setTab('road')}><Route size={17} strokeWidth={1.8} aria-hidden="true"/><span>도로 설계</span></button>
  </nav>
  <div hidden={tab!=='parking'}><OpenParkingPlanner {...props}/></div>
  <div hidden={tab!=='yard'}><OpenYardPlanner {...props}/></div>
  <div hidden={tab!=='entrance'}>
   <section className="action-section cadastre-panel cadastre-editor" aria-label="토지 출입구 설계">
    <h3>토지 출입구 설계</h3>
    <p>토지 경계의 출입 위치와 진입 방향을 설계하는 공간입니다. 출입구 배치·저장 기능은 아직 준비 중입니다.</p>
   </section>
  </div>
  <div hidden={tab!=='road'}><RoadPlanner {...props}/></div>
 </div>;
}
