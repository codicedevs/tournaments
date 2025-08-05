import React from "react";

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
        <div className="text-xl font-bold mb-4">{title}</div>
        <div className="text-gray-600 mb-8">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-400 text-white px-4 py-2 rounded-lg"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
