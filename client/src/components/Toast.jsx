import React, { useState } from 'react';

let toastId = 0;

function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="status">
          <span className="toast__icon">{icons[t.type] || '✅'}</span>
          <span className="toast__message">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

export { useToast, ToastContainer };
