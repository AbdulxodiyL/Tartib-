import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import './toast.css';

const ToastCtx = createContext(null);

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => remove(id), 3800);
    return id;
  }, [remove]);

  toast.success = (msg) => toast(msg, 'success');
  toast.error   = (msg) => toast(msg, 'error');
  toast.info    = (msg) => toast(msg, 'info');

  const ICON = { success: CheckCircle, error: XCircle, info: AlertCircle };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map(t => {
          const Icon = ICON[t.type] || CheckCircle;
          return (
            <div key={t.id} className={`toast toast-${t.type}`}>
              <Icon size={16} className="toast-icon" />
              <span>{t.msg}</span>
              <button className="toast-close" onClick={() => remove(t.id)}>
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
