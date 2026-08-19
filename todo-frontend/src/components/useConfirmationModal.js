// src/hooks/useConfirmationModal.js
import React, { useState, useCallback } from 'react';
import ConfirmationModal from '../components/ConfirmationModal';

const useConfirmationModal = ({ onConfirm, title, message, confirmText }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [itemToProcess, setItemToProcess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const ask = useCallback((item) => {
    setItemToProcess(item);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setItemToProcess(null);
  }, []);

  const handleConfirm = async () => {
    if (!itemToProcess) return;
    setIsLoading(true);
    try {
      await onConfirm(itemToProcess);
    } catch (error) {
      console.error("Confirmation action failed:", error);
    } finally {
      setIsLoading(false);
      handleClose();
    }
  };

  const ModalComponent = () => (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      isLoading={isLoading}
      title={title}
      message={message}
      confirmText={confirmText}
    />
  );

  return [ask, ModalComponent];
};

export default useConfirmationModal;