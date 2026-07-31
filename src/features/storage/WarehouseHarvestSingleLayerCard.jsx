import React from 'react';

export default function WarehouseHarvestSingleLayerCard({
  boxEntries = [],
  loadLabel = '',
  layerLabel = '1단',
  floorStored = false,
  showLayerBadge = true,
  layerCardClassName = '',
}) {
  const normalizedBoxEntries = boxEntries.map((boxEntry) => ({
    ...boxEntry,
    filled: Boolean(boxEntry?.filled),
    tone: boxEntry?.tone === 'green' ? 'green' : 'yellow',
  }));

  const hasInteractiveBoxes = normalizedBoxEntries.some((boxEntry) => (
    typeof boxEntry?.onClick === 'function'
    || typeof boxEntry?.onPointerDown === 'function'
  ));
  const hasFilledBoxes = normalizedBoxEntries.some((boxEntry) => Boolean(boxEntry?.filled));

  return (
    <div
      className={`warehouse-harvest-slot-stack ${hasInteractiveBoxes ? 'has-interactive-boxes' : ''} ${hasFilledBoxes ? 'has-filled-boxes' : ''}`.trim()}
      aria-hidden={hasInteractiveBoxes ? undefined : true}
    >
      <div
        className={`warehouse-harvest-slot-layer-card warehouse-harvest-slot-layer-card--single is-active ${hasFilledBoxes ? 'has-filled-boxes' : ''} ${floorStored ? 'warehouse-harvest-slot-layer-card--floor' : ''} ${layerCardClassName}`.trim()}
      >
        {showLayerBadge ? (
          <span className="warehouse-harvest-slot-layer-card__badge">{layerLabel}</span>
        ) : null}
        <div className={`warehouse-harvest-slot-box-grid ${hasFilledBoxes ? 'has-filled-boxes' : ''}`.trim()}>
          {normalizedBoxEntries.map((boxEntry, boxIndex) => {
            const tooltip = boxEntry?.tooltip || null;
            const commonProps = {
              key: boxEntry?.key || `harvest-single-layer-box-${boxIndex + 1}`,
              className: `warehouse-harvest-slot-box ${typeof boxEntry?.onClick === 'function' || typeof boxEntry?.onPointerDown === 'function' ? 'warehouse-harvest-slot-box-button' : ''} ${boxEntry?.filled ? 'is-filled' : ''} ${boxEntry?.tone === 'green' ? 'is-green' : 'is-yellow'} ${boxEntry?.pickable ? 'is-box-pickable' : ''} ${boxEntry?.fillAnimMeta ? 'is-individual-fill-drop' : ''}`.trim(),
              style: boxEntry?.fillAnimMeta
                ? {
                    ...(boxEntry?.style || {}),
                    '--harvest-fill-drop-delay-ms': `${Math.max(0, Number(boxEntry.fillAnimMeta?.order) || 0) * 64}ms`,
                  }
                : boxEntry?.style,
              'aria-label': boxEntry?.filled ? String(tooltip?.text || '') : '',
              title: boxEntry?.filled ? String(tooltip?.text || '') : '',
              'data-harvest-move-source-id': boxEntry?.dataSourceId,
            };

            if (typeof boxEntry?.onClick === 'function' || typeof boxEntry?.onPointerDown === 'function') {
              return (
                <button
                  {...commonProps}
                  type="button"
                  tabIndex={-1}
                  onPointerDown={boxEntry?.onPointerDown}
                  onClick={boxEntry?.onClick}
                />
              );
            }

            return <span {...commonProps} />;
          })}
        </div>
      </div>
      {loadLabel ? (
        <span className="warehouse-harvest-slot-card__load-label">
          {String(loadLabel || '').split(' + ')[0] || loadLabel}
        </span>
      ) : null}
    </div>
  );
}
