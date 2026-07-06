import React, { useEffect } from 'react';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Toast({ error, successMessage, setError, setSuccessMessage }) {
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, setSuccessMessage]);

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] flex flex-col gap-3 max-w-full sm:max-w-md pointer-events-none">
      
      {error && (
        <div className="pointer-events-auto bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3.5 rounded-xl flex items-start justify-between gap-3 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex gap-2.5 items-start flex-1 min-w-0">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="text-sm font-medium leading-5 break-words w-full">{error}</span>
          </div>
          <button 
            onClick={() => setError('')}
            className="text-rose-400 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition-colors shrink-0 cursor-pointer focus:outline-none"
            aria-label="Dismiss Error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="pointer-events-auto bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3.5 rounded-xl flex items-start justify-between gap-3 shadow-lg backdrop-blur-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex gap-2.5 items-start flex-1 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="text-sm font-medium leading-5 break-words w-full">{successMessage}</span>
          </div>
          <button 
            onClick={() => setSuccessMessage('')}
            className="text-emerald-400 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-100 transition-colors shrink-0 cursor-pointer focus:outline-none"
            aria-label="Dismiss Success"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
    </div>
  );
}