import React from 'react';
import WarehouseStorageAuxModals from './WarehouseStorageAuxModals';
import WarehouseStorageCleanupPickers from './WarehouseStorageCleanupPickers';

export default function WarehouseStorageModalStack(props) {
  const {
    auxModalsProps,
    cleanupPickersProps,
  } = props;

  return (
    <>
      <WarehouseStorageAuxModals {...auxModalsProps} />
      <WarehouseStorageCleanupPickers {...cleanupPickersProps} />
    </>
  );
}
