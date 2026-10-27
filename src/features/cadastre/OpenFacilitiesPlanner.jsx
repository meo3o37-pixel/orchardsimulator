import React,{useState}from'react';
import OpenParkingPlanner from'./OpenParkingPlanner';
import OpenYardPlanner from'./OpenYardPlanner';
import './OpenFacilitiesPlanner.css';
export default function OpenFacilitiesPlanner(props){
 const[tab,setTab]=useState('parking');
 return<div className="open-facilities-planner">
  <nav className="open-facilities-planner__tabs" aria-label="노지 시설 종류">
   <button type="button" aria-pressed={tab==='parking'} onClick={()=>setTab('parking')}>노지 주차장</button>
   <button type="button" aria-pressed={tab==='yard'} onClick={()=>setTab('yard')}>노지 야적창고</button>
  </nav>
  <div hidden={tab!=='parking'}><OpenParkingPlanner {...props}/></div>
  <div hidden={tab!=='yard'}><OpenYardPlanner {...props}/></div>
 </div>;
}
