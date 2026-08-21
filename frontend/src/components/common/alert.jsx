import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaKey,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";

import "../../style/AlertPopup.css";

function AlertPopup({
  show,
  type = "success",
  title,
  message,
  password,
  onClose,
  onConfirm,
  confirmText = "Confirm",
  children,
}) {

  if (!show) {
    return null;
  }

  const getIcon = () => {

    if (type === "success") {
      return <FaCheckCircle />;
    }

    if (type === "error") {
      return <FaExclamationCircle />;
    }
    if (type === "confirm") {
  return <FaExclamationTriangle />;
}

    if (type === "password") {
      return <FaKey />;
    }

    return <FaInfoCircle />;
  };

  return (
    <div className="popup-overlay">

      <div className={`alert-popup ${type}`}>

        <button
          type="button"
          className="popup-close"
          onClick={onClose}
        >
          <FaTimes />
        </button>

        <div className="popup-icon">
          {getIcon()}
        </div>

        <h3>{title}</h3>

        <p>{message}</p>

        {password && (
          <div className="temporary-password-box">

            <span>
              Temporary Password
            </span>

            <strong>
              {password}
            </strong>

          </div>
        )}

        {children}

      

        {type === "confirm" ? (

  <div className="popup-buttons">

    <button
      type="button"
      className="popup-cancel"
      onClick={onClose}
    >
      Cancel
    </button>

    <button
      type="button"
      className="popup-confirm"
      onClick={onConfirm}
    >
      {confirmText}
    </button>

  </div>

) : (

  <button
    type="button"
    className="popup-action"
    onClick={onClose}
  >
    OK
  </button>

)}

      </div>

    </div>
  );
}

export default AlertPopup;