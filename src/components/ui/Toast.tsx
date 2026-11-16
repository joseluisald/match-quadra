import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, clearToast } = useApp();

  if (!toastMessage) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-start gap-3 bg-zinc-900 border border-zinc-700/80 text-zinc-100 px-4 py-3 rounded-xl shadow-xl max-w-md animate-in slide-in-from-bottom duration-200">
      {icons[toastMessage.type]}
      <div className="flex-1 text-sm">
        <p className="font-semibold text-zinc-100">{toastMessage.title}</p>
        <p className="text-xs text-zinc-400 mt-0.5">{toastMessage.message}</p>
      </div>
      <button
        onClick={clearToast}
        className="text-zinc-500 hover:text-zinc-300 p-0.5 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
