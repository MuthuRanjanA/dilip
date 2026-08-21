import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaUserShield,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

import api from "../api/axiosInstance";
import BrandPanel from "../components/layout/BrandPanel";

import "../style/Auth.css";

function Register() {
  const navigate = useNavigate();

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setRegisterData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
  };

  const registerUser = async (event) => {
    event.preventDefault();

    if (
      !registerData.name.trim() ||
      !registerData.email.trim() ||
      !registerData.password.trim()
    ) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage("Password must contain at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      await api.post("/api/auth/register", registerData);

      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to create your account."
      );
    } finally {
      setIsLoading(false);
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
              <p className="auth-eyebrow">GET STARTED</p>

              <h2>Create your ERP account</h2>

              <p>
                Register to access the JAM Enterprises management system.
              </p>
            </div>

            {errorMessage && (
              <div className="auth-error-message">
                {errorMessage}
              </div>
            )}

            <form className="auth-form" onSubmit={registerUser}>
              <div className="auth-input-group">
                <label htmlFor="name">Full Name</label>

                <div className="auth-input-wrapper">
                  <FaUser className="auth-input-icon" />

                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={registerData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="email">Email Address</label>

                <div className="auth-input-wrapper">
                  <FaEnvelope className="auth-input-icon" />

                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={registerData.email}
                    onChange={handleChange}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label htmlFor="password">Password</label>

                <div className="auth-input-wrapper">
                  <FaLock className="auth-input-icon" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={registerData.password}
                    onChange={handleChange}
                    placeholder="Create a secure password"
                    autoComplete="new-password"
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

              <div className="auth-input-group">
                <label htmlFor="role">Account Role</label>

                <div className="auth-input-wrapper">
                  <FaUserShield className="auth-input-icon" />

                  <select
                    id="role"
                    name="role"
                    value={registerData.role}
                    onChange={handleChange}
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="auth-submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="auth-switch-text">
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
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

export default Register;