import React from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

export default function ActionModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", type = "danger" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl transform transition-all animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-pelican-coral/10 text-pelican-coral'
          }`}>
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-2xl font-heading text-white mb-2">{title}</h3>
          <p className="text-slate-400 mb-8 leading-relaxed">
            {message}
          </p>

          <div className="flex w-full gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 py-3 px-4 text-[#020617] rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                type === 'danger' 
                  ? 'bg-red-500 hover:bg-red-400' 
                  : 'bg-pelican-coral hover:bg-white'
              }`}
            >
              {type === 'danger' ? <X size={18} /> : <Check size={18} />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}