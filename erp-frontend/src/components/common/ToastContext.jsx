import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

import "../../style/Toast.css";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used within a ToastProvider"
    );
  }

  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.filter((toast) => toast.id !== id)
    );
  }, []);

  const addToast = useCallback(
    (
      message,
      type = "info",
      duration = 4000
    ) => {

      const id =
        Date.now() +
        Math.random()
          .toString(36)
          .substring(2, 9);

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          duration,
        },
      ]);

      setTimeout(() => {
        removeToast(id);
      }, duration);

    },
    [removeToast]
  );

  const success = useCallback(
    (message, duration) =>
      addToast(
        message,
        "success",
        duration
      ),
    [addToast]
  );

  const error = useCallback(
    (message, duration) =>
      addToast(
        message,
        "error",
        duration
      ),
    [addToast]
  );

  const info = useCallback(
    (message, duration) =>
      addToast(
        message,
        "info",
        duration
      ),
    [addToast]
  );

  const warning = useCallback(
    (message, duration) =>
      addToast(
        message,
        "warning",
        duration
      ),
    [addToast]
  );

  const value = {
    success,
    error,
    info,
    warning,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>

      {children}

      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
      />

    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  removeToast,
}) {

  return (
    <div className="toast-container">

      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() =>
            removeToast(toast.id)
          }
        />
      ))}

    </div>
  );
}

function ToastItem({
  toast,
  onClose,
}) {

  const {
    message,
    type,
    duration,
  } = toast;

  const getIcon = () => {

    switch (type) {

      case "success":
        return <FaCheckCircle />;

      case "error":
        return <FaExclamationCircle />;

      case "warning":
        return <FaExclamationTriangle />;

      default:
        return <FaInfoCircle />;
    }
  };

  return (
    <div
      className={`toast-item-card ${type}`}
    >

      <div className="toast-content">

        <div className="toast-icon">
          {getIcon()}
        </div>

        <div className="toast-message">
          {message}
        </div>

        <button
          type="button"
          className="toast-close"
          onClick={onClose}
        >
          <FaTimes />
        </button>

      </div>

      <div
        className="toast-progress-bar"
        style={{
          animationDuration:
            `${duration}ms`,
        }}
      />

    </div>
  );
}