import React from 'react';

export default function SprayMixOptionCard({
  itemKey,
  game,
  sprayMixDraft,
  setSprayMixDraft,
  pesticideItemMap,
  pesticideDilutionRatioByKey,
  bordeauxCardKeys,
  bordeauxCardCopperKey,
  bordeauxCardLimeKey,
  bordeauxMixRecipe,
  bordeauxMaterialPackKgByKey
}) {
  const isBordeauxMaterial = bordeauxCardKeys.includes(itemKey);
  const mixKey = isBordeauxMaterial ? bordeauxMixRecipe.pesticideKey : itemKey;
  const item = isBordeauxMaterial
    ? { name: itemKey === bordeauxCardCopperKey ? '황산동' : '석회', unit: '포' }
    : pesticideItemMap[itemKey];
  const qty = Number(game?.inventory?.[mixKey]) || 0;
  const openRemain = Number(game?.pesticideOpenRemain?.[mixKey]) || 0;
  const unitLabel = item?.unit || '개';
  const dilution = Number(pesticideDilutionRatioByKey[mixKey]) || 0;
  const isBordeaux = isBordeauxMaterial;
  const copperStock = Math.max(0, Number(game?.inventory?.[bordeauxMixRecipe.copperSulfateKey]) || 0);
  const limeStock = Math.max(0, Number(game?.inventory?.[bordeauxMixRecipe.hydratedLimeKey]) || 0);
  const copperPackKg = Number(bordeauxMaterialPackKgByKey[bordeauxMixRecipe.copperSulfateKey]) || 1;
  const limePackKg = Number(bordeauxMaterialPackKgByKey[bordeauxMixRecipe.hydratedLimeKey]) || 1;
  const copperKg = copperStock * copperPackKg;
  const limeKg = limeStock * limePackKg;
  const fmtQty = (value) => (Number.isInteger(value) ? `${value}` : Number(value.toFixed(2)).toString());
  const bordeauxCopperSelected = Boolean(sprayMixDraft?.bordeauxCopperSelected);
  const bordeauxLimeSelected = Boolean(sprayMixDraft?.bordeauxLimeSelected);
  const metaLabel = isBordeaux
    ? `황산동 ${fmtQty(copperStock)}포(${fmtQty(copperKg)}kg) / 석회 ${fmtQty(limeStock)}포(${fmtQty(limeKg)}kg)${dilution > 0 ? ` / ${dilution}배` : ''}`
    : `${qty}${unitLabel} / 잔량 ${Math.floor(openRemain)}L${dilution > 0 ? ' / ' : ''}${dilution > 0 ? dilution : ''}${dilution > 0 ? '배' : ''}`;
  const selected = isBordeaux
    ? (itemKey === bordeauxCardCopperKey ? bordeauxCopperSelected : bordeauxLimeSelected)
    : (Number(sprayMixDraft?.mixRatioByKey?.[itemKey]) || 0) > 0;
  return (
    <div
      key={itemKey}
      className={`focus-tab focus-tab--spray-mix ${selected ? 'focus-tab--active' : ''}`}
      style={{ cursor: 'default' }}
    >
      <label className="spray-mix-row">
        <span className="spray-mix-row__top">
          <span className="spray-mix-row__title">
            {isBordeaux ? (
              <>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const checked = Boolean(e.target.checked);
                    setSprayMixDraft((prev) => {
                      const next = { ...(prev?.mixRatioByKey || {}) };
                      const nextCopper = itemKey === bordeauxCardCopperKey ? checked : Boolean(prev?.bordeauxCopperSelected);
                      const nextLime = itemKey === bordeauxCardLimeKey ? checked : Boolean(prev?.bordeauxLimeSelected);
                      if (nextCopper && nextLime) {
                        next[bordeauxMixRecipe.pesticideKey] = Math.max(0.1, Number(next[bordeauxMixRecipe.pesticideKey]) || 1);
                      } else {
                        delete next[bordeauxMixRecipe.pesticideKey];
                      }
                      return {
                        ...(prev || {}),
                        mixRatioByKey: next,
                        bordeauxCopperSelected: nextCopper,
                        bordeauxLimeSelected: nextLime
                      };
                    });
                  }}
                />
                <span className="spray-mix-tab__name">{item?.name || itemKey}</span>
              </>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={(e) => {
                    const checked = Boolean(e.target.checked);
                    setSprayMixDraft((prev) => {
                      const next = { ...(prev?.mixRatioByKey || {}) };
                      if (checked) {
                        next[itemKey] = Math.max(0.1, Number(next[itemKey]) || 1);
                      } else {
                        delete next[itemKey];
                      }
                      return { ...(prev || {}), mixRatioByKey: next };
                    });
                  }}
                />
                <span className="spray-mix-tab__name">{item?.name || itemKey}</span>
              </>
            )}
          </span>
        </span>
        <span className="spray-mix-tab__meta">
          {metaLabel}
        </span>
      </label>
    </div>
  );
}
