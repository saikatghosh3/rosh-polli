"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export function Toast({ message, type = "info", duration = 4000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle aria-hidden="true" />,
    error: <XCircle aria-hidden="true" />,
    warning: <AlertTriangle aria-hidden="true" />,
    info: <CheckCircle aria-hidden="true" />,
  };

  return (
    <div className={`toast toast--${type} ${visible ? "toast--visible" : "toast--hidden"}`} role="alert" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">{icons[type] || icons.info}</span>
      <span className="toast__message">{message}</span>
      <button type="button" className="toast__close" aria-label="বার্তা বন্ধ করুন" onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }}>
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}