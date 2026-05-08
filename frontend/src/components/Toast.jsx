import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext();

const icons = {
  success: <CheckCircle className="text-emerald-500" size={20} />, 
  error: <XCircle className="text-red-500" size={20} />, 
  warning: <AlertTriangle className="text-amber-500" size={20} />, 
  info: <Info className="text-blue-500" size={20} />
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg bg-white border-l-4 transition-transform duration-300 animate-toast-in border-${toast.type === 'success' ? 'emerald' : toast.type === 'error' ? 'red' : toast.type === 'warning' ? 'amber' : 'blue'}-500`}
          >
            {icons[toast.type]}
            <span className="text-gray-800 font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
