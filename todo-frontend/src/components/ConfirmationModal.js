// src/components/ConfirmationModal.js
import React from 'react';
import { AlertTriangle } from 'react-feather';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure? This action cannot be undone.",
  confirmText = "Confirm",
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm m-4">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="ml-4 text-left">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300">
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;