import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

import api from "../api/axiosInstance";
import BrandPanel from "../components/layout/BrandPanel";
import { useToast } from "../components/common/ToastContext";

import "../style/Auth.css";

function Login() {
  const navigate = useNavigate();
  const toast = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setLoginData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
  };
const loginUser = async (e) => {
  e.preventDefault();

  try {
    const response =
      await api.post(
        "/api/auth/login",
        loginData
      );

    const {
      token,
      role,
      employeeId,
      employeeName,
      temporaryPassword,
    } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role?.trim()?.toUpperCase() || "EMPLOYEE");
    localStorage.setItem(
      "email",
      loginData.email
    );

    if (employeeId !== null) {
      localStorage.setItem(
        "employeeId",
        employeeId
      );
    }

    if (employeeName) {
      localStorage.setItem(
        "employeeName",
        employeeName
      );
    }

    if (temporaryPassword) {
      navigate("/change-password");
      return;
    }

    navigate("/dashboard");

  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("employeeName");
    toast.error("Invalid email or password");
    navigate("/login", { replace: true });
  }
};

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <BrandPanel />

        <section className="auth-form-section">
          <div className="auth-form-wrapper">
            <div className="mobile-brand">
              <div className="mobile-logo">JAM</div>
              <p>JAM ENTERPRISES</p>
            </div>

            <div className="auth-heading">
              <p className="auth-eyebrow">WELCOME BACK</p>

              <h2>Sign in to your account</h2>

              <p>
                Enter your credentials to access the ERP dashboard.
              </p>
            </div>

            {errorMessage && (
              <div className="auth-error-message">
                {errorMessage}
              </div>
            )}

            <form className="auth-form" onSubmit={loginUser}>
              <div className="auth-input-group">
                <label htmlFor="email">Email Address</label>

                <div className="auth-input-wrapper">
                  <FaEnvelope className="auth-input-icon" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <div className="password-label-row">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="forgot-password-link"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="auth-input-wrapper">
                  <FaLock className="auth-input-icon" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((currentValue) => !currentValue)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="login-help-text">
  Contact HR if you do not have an ERP account.
</p>

            <p className="auth-copyright">
              © 2026 JAM Enterprises. ERP Management System.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;