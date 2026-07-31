import React from 'react';
import WarehouseTransportPanelForklift from './WarehouseTransportPanelForklift';
import WarehouseTransportPanelPalletJack from './WarehouseTransportPanelPalletJack';
import WarehouseTransportPanelIndividual from './WarehouseTransportPanelIndividual';

const INDIVIDUAL_TRANSPORT_ONLY_TOOL_KEYS = new Set([
  'manualCarry',
  'handCart2Wheel',
  'platformCart4Wheel',
  'wheelbarrow1slot',
  'wheelbarrow2slot',
  'wheelbarrow4slot',
  'wheelbarrowBucketType',
]);

export default function WarehouseTransportPanel(props) {
  const toolKey = String(props?.selectedTransportRow?.toolKey || '').trim();

  if (toolKey === 'palletJack') {
    return <WarehouseTransportPanelPalletJack {...props} />;
  }

  if (INDIVIDUAL_TRANSPORT_ONLY_TOOL_KEYS.has(toolKey)) {
    return <WarehouseTransportPanelIndividual {...props} />;
  }

  return <WarehouseTransportPanelForklift {...props} />;
}
