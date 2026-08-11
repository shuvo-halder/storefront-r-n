import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStorefront();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white border border-slate-200/90 shadow-xl rounded-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          {toast.image ? (
            <img 
              src={toast.image} 
              alt="" 
              className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0" 
            />
          ) : (
            <div className="mt-0.5 flex-shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {(!toast.type || toast.type === 'info') && <Info className="w-5 h-5 text-rose-600" />}
            </div>
          )}

          <div className="flex-1 min-w-0 pr-1">
            <h4 className="text-sm font-semibold text-slate-900 leading-tight">
              {toast.title}
            </h4>
            {toast.description && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {toast.description}
              </p>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
