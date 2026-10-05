import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmModal({ isOpen, title, message, confirmText, confirmColor = 'rose', onConfirm, onClose }) {
  if (!isOpen) return null;

  const isRose = confirmColor === 'rose';

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[#FAF7F2] p-8 rounded-4xl border border-stone-200 shadow-2xl flex flex-col items-center max-w-sm w-full relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition cursor-pointer">
          <FiX className="text-lg" />
        </button>

        <div className={`p-3 rounded-full mb-4 ${isRose ? 'bg-rose-100/60 text-rose-600' : 'bg-amber-100/60 text-amber-600'}`}>
          <FiAlertTriangle className="text-2xl" />
        </div>

        <h3 className="text-xl font-light text-stone-800 mb-2 text-center">{title}</h3>
        <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">{message}</p>

        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-stone-200/70 hover:bg-stone-200 text-stone-700 text-xs font-medium transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl text-white text-xs font-medium transition cursor-pointer shadow-sm ${isRose ? 'bg-rose-600 hover:bg-rose-700' : 'bg-stone-800 hover:bg-stone-900'}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}