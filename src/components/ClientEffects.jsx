'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export default function ClientEffects({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((title, message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, message, type, show: false }]);
    // trigger enter animation next frame
    requestAnimationFrame(() =>
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, show: true } : x)))
    );
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, show: false } : x)));
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 400);
    }, 4200);
  }, []);

  // Scroll-reveal animation has been removed. Content is always visible via CSS;
  // no Intersection Observer runs, so there's nothing that can leave the page blank.

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-wrap" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type} ${t.show ? 'show' : ''}`} role="status">
            <b>{t.title}</b>
            <small>{t.message}</small>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
