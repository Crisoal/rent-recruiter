import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { Toast } from '../lib/types';

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    if (type !== 'pending') {
      setTimeout(() => removeToast(id), 4000);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const icons = {
    success: <CheckCircle size={16} className="text-[#00C853]" />,
    error: <XCircle size={16} className="text-red-500" />,
    pending: <Loader2 size={16} className="text-[#00897B] animate-spin" />,
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl shadow-lg px-4 py-3 min-w-[280px] animate-slide-up">
      {icons[toast.type]}
      <span className="text-sm text-gray-700 flex-1">{toast.message}</span>
      <button onClick={onRemove} className="text-gray-400 hover:text-gray-600 transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

export const useToast = () => useContext(ToastContext);
