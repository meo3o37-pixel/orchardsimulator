export function runShopTerminalPayment({
  cardId,
  installmentMonths = 1,
  shopTerminalSessionRef,
  shopPayMode,
  issuedCardProducts,
  CARD_PRODUCT_BY_ID,
  isCreditCardProduct,
  unifiedPayFinalAmount,
  fuelKioskPaymentSnapshotRef,
  setShopTerminalCardId,
  setShopTerminalInstallmentMonths,
  setShopTerminalAmount,
  setShopTerminalDone,
  setShopPayCardModalOpen,
  setShopTerminalModalOpen,
  shopTerminalDoneTimerRef,
  shopTerminalTimerRef,
  playShopCardPaymentSound,
  playShopCardReceiptSound,
  confirmRejectedCrewRentPayment,
  shopPayRentId,
  confirmApprovedCrewRentPayment,
  confirmMachineRentPayment,
  confirmFacilityInstallPayment,
  confirmColdStorageOneMcpPayment,
  confirmLandPurchasePayment,
  confirmFuelKioskPayment,
  checkoutShopCart,
  startMapShopPaymentDocking,
  setFuelKioskLastReceipt,
  fuelKioskKey,
  fuelKioskItem,
  game,
  setFuelKioskStep,
  setShopPayMode,
  setShopPayRentId,
  setShopPayInstallmentMonths
}) {
  const sessionId = shopTerminalSessionRef.current + 1;
  shopTerminalSessionRef.current = sessionId;
  const payModeAtStart = shopPayMode;
  const safeCardId = String(cardId || '');
  const resolvedCard = safeCardId
    ? (
      issuedCardProducts.find((card) => String(card?.id || '') === safeCardId)
      || CARD_PRODUCT_BY_ID[safeCardId]
      || null
    )
    : null;
  const effectiveCardId = resolvedCard ? String(resolvedCard?.id || '') : '';
  const isCardTerminalPayment = Boolean(effectiveCardId);
  const doneDelayMs = isCardTerminalPayment ? 2550 : 1250;
  const closeDelayMs = isCardTerminalPayment ? 3650 : 2050;
  const safeInstallmentMonths = Math.max(1, Math.min(12, Math.floor(Number(installmentMonths) || 1)));
  const effectiveInstallmentMonths = isCreditCardProduct(resolvedCard) ? safeInstallmentMonths : 1;
  const amount = unifiedPayFinalAmount;
  const fuelKioskPaymentSnapshotAtStart = payModeAtStart === 'fuel-kiosk'
    ? fuelKioskPaymentSnapshotRef.current
    : null;
  setShopTerminalCardId(effectiveCardId);
  setShopTerminalInstallmentMonths(effectiveInstallmentMonths);
  setShopTerminalAmount(amount);
  setShopTerminalDone(false);
  setShopPayCardModalOpen(false);
  setShopTerminalModalOpen(true);
  if (isCardTerminalPayment) {
    playShopCardPaymentSound?.();
  }
  if (shopTerminalDoneTimerRef.current) clearTimeout(shopTerminalDoneTimerRef.current);
  if (shopTerminalTimerRef.current) clearTimeout(shopTerminalTimerRef.current);
  shopTerminalDoneTimerRef.current = setTimeout(() => {
    if (shopTerminalSessionRef.current !== sessionId) return;
    setShopTerminalDone(true);
    if (isCardTerminalPayment) {
      playShopCardReceiptSound?.();
    }
    shopTerminalDoneTimerRef.current = null;
  }, doneDelayMs);
  shopTerminalTimerRef.current = setTimeout(() => {
    if (shopTerminalSessionRef.current !== sessionId) return;
    let fuelKioskPaid = false;
    try {
      if (payModeAtStart === 'crew-extra') {
        confirmRejectedCrewRentPayment(shopPayRentId, effectiveCardId, effectiveInstallmentMonths);
      } else if (payModeAtStart === 'crew-approved') {
        confirmApprovedCrewRentPayment(shopPayRentId, effectiveCardId, effectiveInstallmentMonths);
      } else if (
        ['machine-rent-register', 'machine-used-register', 'machine-dealer-register', 'machine-rent-delivery', 'machine-used-delivery', 'machine-new-delivery', 'machine-return-delivery'].includes(String(payModeAtStart || ''))
      ) {
        confirmMachineRentPayment(effectiveCardId, effectiveInstallmentMonths);
      } else if (payModeAtStart === 'facility-install') {
        confirmFacilityInstallPayment(effectiveCardId, effectiveInstallmentMonths);
      } else if (payModeAtStart === 'cold-storage-one-mcp') {
        confirmColdStorageOneMcpPayment(effectiveCardId, effectiveInstallmentMonths);
      } else if (payModeAtStart === 'land-bank') {
        confirmLandPurchasePayment(effectiveCardId, effectiveInstallmentMonths);
      } else if (payModeAtStart === 'fuel-kiosk') {
        fuelKioskPaid = confirmFuelKioskPayment(
          effectiveCardId,
          effectiveInstallmentMonths,
          fuelKioskPaymentSnapshotAtStart,
          resolvedCard
        );
        if (fuelKioskPaid && fuelKioskPaymentSnapshotAtStart) {
          const fallbackSnapshot = fuelKioskPaymentSnapshotAtStart;
          setFuelKioskLastReceipt((prev) => {
            if (prev && Math.max(0, Math.floor(Number(prev?.liters) || 0)) > 0) return prev;
            const fallbackLiters = Math.max(0, Math.floor(Number(fallbackSnapshot?.liters) || 0));
            const fallbackAmount = Math.max(0, Math.floor(Number(fallbackSnapshot?.amount) || 0));
            return {
              fuelKey: String(fallbackSnapshot?.fuelKey || fuelKioskKey || ''),
              fuelName: String(fallbackSnapshot?.fuelName || fuelKioskItem?.name || '연료'),
              liters: fallbackLiters,
              remainingLiters: fallbackLiters,
              amount: fallbackAmount,
              sourceText: String(fallbackSnapshot?.sourceLabel || '선택'),
              unitPrice: Math.max(0, Math.floor(Number(fallbackSnapshot?.unitPrice) || 0)),
              paymentType: effectiveCardId ? 'credit' : 'cash',
              cardId: effectiveCardId || '',
              installmentMonths: effectiveCardId ? effectiveInstallmentMonths : 1,
              createdDay: Math.max(1, Math.floor(Number(game?.day) || 1)),
              billIds: [],
              billedTotalAmount: fallbackAmount
            };
          });
        }
      } else {
        const checkoutResult = checkoutShopCart(effectiveCardId, effectiveInstallmentMonths);
        if (checkoutResult?.mapDeferredPaid) {
          startMapShopPaymentDocking();
        }
      }
    } catch (error) {
      window.alert(`결제 처리 중 오류가 발생했습니다. ${String(error?.message || error || '')}`);
    } finally {
      setShopTerminalModalOpen(false);
      if (payModeAtStart === 'fuel-kiosk') {
        setFuelKioskStep(fuelKioskPaid ? 'settle' : 'amount');
      }
      fuelKioskPaymentSnapshotRef.current = null;
      setShopTerminalCardId('');
      setShopTerminalInstallmentMonths(1);
      setShopTerminalDone(false);
      setShopPayMode('shop-cart');
      setShopPayRentId('');
      setShopPayInstallmentMonths(1);
      shopTerminalTimerRef.current = null;
    }
  }, closeDelayMs);
}
