import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";


function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/api/auth/login", loginData);
       console.log("Login response:", response.data);

      const token = response.data.token || response.data.jwt || response.data;
      const role = response.data.role;
      

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);


      alert("Login successful");
      navigate("/dashboard");
    } catch (error) {
      alert("Invalid email or password");
      console.log(error);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={loginUser}>
        <h2>ERP Login</h2>

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

        <button type="submit">Login</button>

        <p>
          New user? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;