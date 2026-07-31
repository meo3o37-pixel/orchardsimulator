export function buildMachineRentDeliveryPaymentModalDraft({
  game,
  machineRentTransportModal,
  deliveryFee,
  clamp
}) {
  if (!machineRentTransportModal?.open) return { ok: false };
  if (!game || (Number(game.money) || 0) < deliveryFee) {
    return { ok: false, reason: '운반요청 결제 금액이 부족합니다.' };
  }
  const isUsed = machineRentTransportModal.mode === 'used';
  const isNew = machineRentTransportModal.mode === 'new';
  return {
    ok: true,
    shopPayMode: isUsed ? 'machine-used-delivery' : (isNew ? 'machine-new-delivery' : 'machine-rent-delivery'),
    modal: {
      open: true,
      kind: isUsed ? 'used-delivery' : (isNew ? 'new-delivery' : 'rent-delivery'),
      amount: deliveryFee,
      itemKey: String(machineRentTransportModal.itemKey || ''),
      displayName: String(machineRentTransportModal.displayName || ''),
      purchaseOptionKey: String(machineRentTransportModal.purchaseOptionKey || ''),
      offerId: String(machineRentTransportModal.offerId || ''),
      durability: clamp(Number(machineRentTransportModal.durability) || 60, 1, 100),
      vehiclePlateOverride: machineRentTransportModal.vehiclePlateOverride || null,
      rentId: '',
      days: (isUsed || isNew)
        ? 1
        : Math.max(1, Math.floor(Number(machineRentTransportModal.days) || 1))
    }
  };
}

export function buildMachineRentReturnDeliveryPaymentModalDraft({
  game,
  rentId,
  deliveryFee
}) {
  if (!rentId) return { ok: false };
  if (!game || (Number(game.money) || 0) < deliveryFee) {
    return { ok: false, reason: '운반요청 결제 금액이 부족합니다.' };
  }
  return {
    ok: true,
    shopPayMode: 'machine-return-delivery',
    modal: {
      open: true,
      kind: 'return-delivery',
      amount: deliveryFee,
      itemKey: '',
      displayName: '',
      purchaseOptionKey: '',
      offerId: '',
      durability: 100,
      vehiclePlateOverride: null,
      rentId: String(rentId || ''),
      days: 1
    }
  };
}

export function createEmptyMachineRentTransportModal() {
  return {
    open: false,
    mode: '',
    itemKey: '',
    displayName: '',
    purchaseOptionKey: '',
    offerId: '',
    durability: 100,
    vehiclePlateOverride: null,
    days: 1,
    dailyFee: 0,
    totalFee: 0
  };
}

export function createEmptyMachineRentDeliveryModal() {
  return {
    open: false,
    mode: '',
    itemKey: '',
    displayName: '',
    purchaseOptionKey: '',
    offerId: '',
    durability: 100,
    vehiclePlateOverride: null,
    days: 1,
    dailyFee: 0,
    totalFee: 0,
    rentId: '',
    targetFieldIndex: -1,
    parkingSlotNo: 0,
    cargoParkingSlotNo: 0
  };
}

export function buildMachineRentTransportModalAfterRegister({
  kind,
  machineRentPaymentModal,
  itemName = '',
  dailyFee = 0,
  totalFee = 0
}) {
  const itemKey = String(machineRentPaymentModal?.itemKey || '');
  const displayName = String(machineRentPaymentModal?.displayName || itemName || itemKey);
  const purchaseOptionKey = String(machineRentPaymentModal?.purchaseOptionKey || '');
  const offerId = String(machineRentPaymentModal?.offerId || '');
  const safeDurability = Math.max(1, Math.min(100, Number(machineRentPaymentModal?.durability) || 100));
  const safeDays = Math.max(1, Math.floor(Number(machineRentPaymentModal?.days) || 1));
  if (kind === 'rent-register') {
    return {
      open: true,
      mode: 'rent',
      itemKey,
      displayName: itemName || displayName,
      purchaseOptionKey: '',
      offerId: '',
      durability: 100,
      vehiclePlateOverride: machineRentPaymentModal?.vehiclePlateOverride || null,
      days: safeDays,
      dailyFee: Math.max(0, Number(dailyFee) || 0),
      totalFee: Math.max(0, Number(totalFee) || 0)
    };
  }
  if (kind === 'dealer-register') {
    return {
      open: true,
      mode: 'new',
      itemKey,
      displayName,
      purchaseOptionKey,
      offerId: '',
      durability: 100,
      vehiclePlateOverride: machineRentPaymentModal?.vehiclePlateOverride || null,
      days: 1,
      dailyFee: 0,
      totalFee: Math.max(0, Math.floor(Number(machineRentPaymentModal?.amount) || 0))
    };
  }
  if (kind === 'used-register') {
    return {
      open: true,
      mode: 'used',
      itemKey,
      displayName,
      purchaseOptionKey,
      offerId,
      durability: safeDurability,
      vehiclePlateOverride: machineRentPaymentModal?.vehiclePlateOverride || null,
      days: 1,
      dailyFee: 0,
      totalFee: Math.max(10000, Math.floor(Number(machineRentPaymentModal?.amount) || 0))
    };
  }
  return null;
}

export function buildMachineRentDeliveryModalAfterPayment({
  kind,
  machineRentPaymentModal,
  machineRentTransportModal,
  itemName = ''
}) {
  const itemKey = String(machineRentPaymentModal?.itemKey || '');
  const displayName = String(machineRentPaymentModal?.displayName || itemName || itemKey);
  const purchaseOptionKey = String(machineRentPaymentModal?.purchaseOptionKey || '');
  const offerId = String(machineRentPaymentModal?.offerId || '');
  const safeDurability = Math.max(1, Math.min(100, Number(machineRentPaymentModal?.durability) || 100));
  const safeDays = Math.max(1, Math.floor(Number(machineRentPaymentModal?.days) || 1));
  if (kind === 'rent-delivery') {
    return {
      open: true,
      mode: 'rent',
      itemKey,
      displayName: itemName || displayName,
      purchaseOptionKey: '',
      offerId: '',
      durability: 100,
      vehiclePlateOverride: machineRentTransportModal?.vehiclePlateOverride || null,
      days: safeDays,
      dailyFee: Math.max(0, Number(machineRentTransportModal?.dailyFee) || 0),
      totalFee: Math.max(0, Number(machineRentTransportModal?.totalFee) || 0),
      rentId: '',
      targetFieldIndex: -1,
      parkingSlotNo: 0,
      cargoParkingSlotNo: 0
    };
  }
  if (kind === 'used-delivery') {
    return {
      open: true,
      mode: 'used',
      itemKey,
      displayName,
      purchaseOptionKey,
      offerId,
      durability: safeDurability,
      vehiclePlateOverride: machineRentTransportModal?.vehiclePlateOverride || null,
      days: 1,
      dailyFee: 0,
      totalFee: Math.max(10000, Math.floor(Number(machineRentTransportModal?.totalFee) || 0)),
      rentId: '',
      targetFieldIndex: -1,
      parkingSlotNo: 0,
      cargoParkingSlotNo: 0
    };
  }
  if (kind === 'new-delivery') {
    return {
      open: true,
      mode: 'new',
      itemKey,
      displayName,
      purchaseOptionKey,
      offerId: '',
      durability: 100,
      vehiclePlateOverride: machineRentTransportModal?.vehiclePlateOverride || null,
      days: 1,
      dailyFee: 0,
      totalFee: Math.max(0, Math.floor(Number(machineRentTransportModal?.totalFee) || 0)),
      rentId: '',
      targetFieldIndex: -1,
      parkingSlotNo: 0,
      cargoParkingSlotNo: 0
    };
  }
  return null;
}

export function buildMachineRentDeliveryPlacementRequest({
  game,
  machineRentDeliveryModal,
  machinePurchaseBundleMetaOfOptionKey,
  parkingMaxSlots,
  fieldTotalParkingCapacity,
  parkedMachineInstanceIdAtFieldSlot
}) {
  if (!machineRentDeliveryModal?.open || !['rent', 'used', 'new'].includes(String(machineRentDeliveryModal.mode || ''))) {
    return { ok: false };
  }
  const targetFieldIndex = Math.max(0, Math.floor(Number(machineRentDeliveryModal.targetFieldIndex) || 0));
  const parkingSlotNo = Math.max(0, Math.floor(Number(machineRentDeliveryModal.parkingSlotNo) || 0));
  const cargoParkingSlotNo = Math.max(0, Math.floor(Number(machineRentDeliveryModal.cargoParkingSlotNo) || 0));
  const purchaseBundleMeta = machinePurchaseBundleMetaOfOptionKey(machineRentDeliveryModal.purchaseOptionKey);
  const field = game?.fields?.[targetFieldIndex];
  const totalCap = Math.max(0, Math.min(parkingMaxSlots, fieldTotalParkingCapacity(field)));
  if (!field?.owned || totalCap <= 0 || parkingSlotNo <= 0 || parkingSlotNo > totalCap) {
    return { ok: false, reason: '운반 받을 토지와 주차칸을 먼저 선택해 주세요.' };
  }
  if (parkedMachineInstanceIdAtFieldSlot(game, targetFieldIndex, parkingSlotNo)) {
    return { ok: false, reason: '선택한 주차칸은 이미 사용중입니다.' };
  }
  if (purchaseBundleMeta) {
    if (cargoParkingSlotNo <= 0 || cargoParkingSlotNo > totalCap) {
      return { ok: false, reason: '적재함을 놓을 주차칸도 선택해 주세요.' };
    }
    if (cargoParkingSlotNo === parkingSlotNo) {
      return { ok: false, reason: 'SS기 본체와 적재함은 서로 다른 주차칸을 선택해 주세요.' };
    }
    if (parkedMachineInstanceIdAtFieldSlot(game, targetFieldIndex, cargoParkingSlotNo)) {
      return { ok: false, reason: '선택한 적재함 주차칸은 이미 사용중입니다.' };
    }
  }
  return {
    ok: true,
    targetFieldIndex,
    parkingSlotNo,
    cargoParkingSlotNo,
    purchaseBundleMeta,
    field,
    viaLabel: `운반요청(${field?.name || '토지'} P${parkingSlotNo})`
  };
}
