import React from 'react';
import {ZoomIn,ZoomOut,Maximize,Hand} from 'lucide-react';

export default function CadastreMapToolbar({viewport,label='지도',panMode,onPanModeChange}){
 return <div className="cadastre-editor__map-toolbar" role="toolbar" aria-label={`${label} 보기`}>
  <button type="button" title="축소" aria-label={`${label} 축소`} disabled={viewport.zoomPercent<=50} onClick={viewport.zoomOut}><ZoomOut size={18}/></button>
  <output aria-label={`${label} 배율`}>{viewport.zoomPercent}%</output>
  <button type="button" title="확대" aria-label={`${label} 확대`} disabled={viewport.zoomPercent>=800} onClick={viewport.zoomIn}><ZoomIn size={18}/></button>
  <button type="button" title="화면 맞춤" aria-label={`${label} 화면 맞춤`} onClick={viewport.reset}><Maximize size={18}/></button>
  {onPanModeChange&&<button type="button" title="지도 이동" aria-label={`${label} 이동 모드`} aria-pressed={panMode} onClick={()=>onPanModeChange(!panMode)}><Hand size={18}/></button>}
 </div>;
}
export const cadastreViewportEvents=viewport=>({
 onPointerDownCapture:viewport.onPointerDownCapture,
 onPointerMoveCapture:viewport.onPointerMoveCapture,
 onPointerDown:viewport.onPointerDown,
 onPointerMove:viewport.onPointerMove,
 onPointerUpCapture:viewport.endPointer,
 onPointerCancelCapture:viewport.endPointer,
 onLostPointerCapture:event=>{if(event.target===event.currentTarget)viewport.endPointer(event);},
 onClickCapture:viewport.onClickCapture
});
