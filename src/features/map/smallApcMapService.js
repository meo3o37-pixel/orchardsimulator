export const createSmallApcMapLocationModal = () => ({
  open: true,
  key: 'smallApc',
  tab: 'service',
  view: 'menu',
  parkingReturnKey: 'smallApc'
});

export const openSmallApcMapModal = (setMapLocationModal) => {
  if (typeof setMapLocationModal !== 'function') return;
  setMapLocationModal(createSmallApcMapLocationModal());
};

export const enterSmallApcMapReceivingView = (setMapLocationModal) => {
  if (typeof setMapLocationModal !== 'function') return;
  setMapLocationModal((prev) => ({ ...prev, view: 'receiving' }));
};

export const enterSmallApcMapSortingView = (setMapLocationModal, sortingSection = 'loading') => {
  if (typeof setMapLocationModal !== 'function') return;
  const nextSection = String(sortingSection || 'loading') === 'sorting' ? 'sorting' : 'loading';
  setMapLocationModal((prev) => ({ ...prev, view: 'sorting', sortingSection: nextSection }));
};
