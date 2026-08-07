import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function Register() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/auth/register", user);
      alert("Registration successful");
      navigate("/");
    } catch (error) {
  console.log("Register error:", error.response?.data);

  alert(
    error.response?.data?.message ||
    error.response?.data ||
    "Registration failed"
  );
}
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={registerUser}>
        <h2>ERP Register</h2>

        <input
          type="text"
          name="name"
          placeholder="Enter name"
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter password"
          onChange={handleChange}
        />

        <select name="role" value={user.role} onChange={handleChange}>
          <option value="EMPLOYEE">EMPLOYEE</option>
          <option value="ADMIN">ADMIN</option>
          <option value="HR">HR </option>
        </select>

        <button type="submit">Register</button>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;