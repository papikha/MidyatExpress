interface ConfirmBoxProps {
  confirmMessage: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

function ConfirmBox({ confirmMessage, onConfirm, onCancel }: ConfirmBoxProps) {
  if (!confirmMessage) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 pt-20 animate-fade-in">
      <div
        className="
          bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8
          flex flex-col gap-6
          transform transition-all duration-300
          animate-slide-down
        "
      >
        <div className="text-center text-lg font-semibold text-gray-800">
          {confirmMessage}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200 shadow-sm"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg transition-colors duration-200 shadow-sm"
          >
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmBox;
