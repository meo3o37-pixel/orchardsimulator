import React, { useContext } from 'react';
import { Layers3, Sprout } from 'lucide-react';
import { CadastreGroundDisplayContext } from './CadastreGround';

export default function CadastreDisplayControls() {
  const { showSoil, setShowSoil, showGrass, setShowGrass } = useContext(CadastreGroundDisplayContext);
  return <div className="cadastre-design-display" role="group" aria-label="설계 지도 바닥 표시">
    <span>지도 표시</span>
    <button type="button" aria-pressed={showSoil} onClick={() => setShowSoil(value => !value)}><Layers3 size={16} aria-hidden="true" />땅 색 <small>{showSoil ? '켜짐' : '꺼짐'}</small></button>
    <button type="button" aria-pressed={showGrass} onClick={() => setShowGrass(value => !value)}><Sprout size={16} aria-hidden="true" />풀 <small>{showGrass ? '켜짐' : '꺼짐'}</small></button>
  </div>;
}
