import React, { createContext, useContext, useState } from 'react';
import ConfirmModal from '../components/ConfirmModal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: null,
    confirmText: 'Confirm',
    type: 'danger',
  });

  const showConfirm = (title, message, onConfirm, type = 'danger', onCancel = null, confirmText = 'Confirm') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        closeConfirm();
      },
      onCancel: onCancel ? () => {
        onCancel();
        closeConfirm();
      } : () => closeConfirm(),
      confirmText,
      type,
    });
  };

  const showAlert = (title, message, type = 'warning') => {
    setModal({
      isOpen: true,
      title,
      message,
      onConfirm: closeConfirm,
      onCancel: null,
      confirmText: 'OK',
      type,
    });
  };

  const closeConfirm = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm, showAlert }}>
      {children}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm}
        onCancel={modal.onCancel}
        confirmText={modal.confirmText}
        type={modal.type}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
