import React from 'react';
import { AlertCircle, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'primary' | 'success' | 'warning'
}) {
  if (!isOpen) return null;

  const headerColor = 
    type === 'danger' ? 'text-rose-600 bg-rose-50' : 
    type === 'success' ? 'text-emerald-600 bg-emerald-50' :
    type === 'warning' ? 'text-amber-600 bg-amber-50' :
    'text-indigo-600 bg-indigo-50';

  const btnColor = 
    type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/20' :
    type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20' :
    type === 'warning' ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/20' :
    'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20'; // Matching our main emerald color theme

  const Icon = 
    type === 'danger' ? AlertCircle :
    type === 'success' ? CheckCircle :
    type === 'warning' ? AlertTriangle :
    HelpCircle;

  return (
    <div className="fixed inset-0 bg-slate-950/40 z-[100] flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4 transform transition-all duration-300 scale-100">
        <div className="flex gap-4 items-start">
          <div className={`p-3 rounded-xl shrink-0 ${headerColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-base leading-snug">{title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors focus:outline-none"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer transition-colors focus:outline-none focus:ring-2 ${btnColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
