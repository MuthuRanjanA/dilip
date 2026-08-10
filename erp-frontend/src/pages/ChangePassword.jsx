import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaKey, FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import api from "../api/axiosInstance";
import BrandPanel from "../components/layout/BrandPanel";
import { useToast } from "../components/common/ToastContext";
import "../style/auth.css";

function ChangePassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password criteria checks
  const criteria = {
    hasLength: passwordForm.newPassword.length >= 8,
    hasUpper: /[A-Z]/.test(passwordForm.newPassword),
    hasNumber: /[0-9]/.test(passwordForm.newPassword),
    hasSpecial: /[@$!%*?&]/.test(passwordForm.newPassword),
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("Please meet all password strength requirements");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const email = localStorage.getItem("email");

      await api.post(
        "/api/auth/change-temporary-password",
        {
          email: email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }
      );

      toast.success("Password changed successfully! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.log("Password change error:", error.response?.data);
      toast.error(
        error.response?.data?.message || 
        "Unable to change password. Please check your temporary password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell animate-fade-in">
        <BrandPanel />

        <section className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="mobile-brand">
              <div className="mobile-logo">JAM</div>
              <p>JAM ENTERPRISES</p>
            </div>

            <div className="auth-heading">
              <p className="auth-eyebrow">TEMPORARY PASSWORD DETECTED</p>
              <h2>Create New Password</h2>
              <p>
                To secure your account, please update your temporary password before proceeding to the dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {/* Temporary Password Input */}
              <div className="auth-input-group">
                <label htmlFor="currentPassword">Temporary Password</label>
                <div className="auth-input-wrapper">
                  <FaKey className="auth-input-icon" />
                  <input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    name="currentPassword"
                    placeholder="Enter temporary password"
                    value={passwordForm.currentPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrent(!showCurrent)}
                    aria-label="Toggle password visibility"
                  >
                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* New Password Input */}
              <div className="auth-input-group">
                <label htmlFor="newPassword">New Password</label>
                <div className="auth-input-wrapper">
                  <FaLock className="auth-input-icon" />
                  <input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    placeholder="Create a strong password"
                    value={passwordForm.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNew(!showNew)}
                    aria-label="Toggle password visibility"
                  >
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Criteria Checker Widget */}
              <div className="password-criteria-widget">
                <div className={`criteria-item ${criteria.hasLength ? "valid" : ""}`}>
                  <span className="criteria-check">
                    {criteria.hasLength ? <FaCheck /> : <FaTimes />}
                  </span>
                  <span>Min 8 characters</span>
                </div>
                <div className={`criteria-item ${criteria.hasUpper ? "valid" : ""}`}>
                  <span className="criteria-check">
                    {criteria.hasUpper ? <FaCheck /> : <FaTimes />}
                  </span>
                  <span>At least 1 uppercase letter</span>
                </div>
                <div className={`criteria-item ${criteria.hasNumber ? "valid" : ""}`}>
                  <span className="criteria-check">
                    {criteria.hasNumber ? <FaCheck /> : <FaTimes />}
                  </span>
                  <span>At least 1 number</span>
                </div>
                <div className={`criteria-item ${criteria.hasSpecial ? "valid" : ""}`}>
                  <span className="criteria-check">
                    {criteria.hasSpecial ? <FaCheck /> : <FaTimes />}
                  </span>
                  <span>At least 1 special char (@$!%*?&)</span>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div className="auth-input-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <FaLock className="auth-input-icon" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your new password"
                    value={passwordForm.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                    aria-label="Toggle password visibility"
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="auth-submit-button"
                disabled={isSubmitting || !isPasswordValid}
              >
                {isSubmitting ? "Updating Password..." : "Update Password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ChangePassword;