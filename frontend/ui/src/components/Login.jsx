// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // use custom hook
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded credentials
    if (email === "user@gmail.com" && password === "user123") {
      login({ email, role: "user" });
      navigate("/"); // redirect to HomePage
      return;
    }

    if (email === "admin@gmail.com" && password === "admin123") {
      login({ email, role: "admin" });
      navigate("/admindashboard"); // redirect to AdminDashboard
      return;
    }

    alert("Invalid credentials! Use:\nUser: user@gmail.com / user123\nAdmin: admin@gmail.com / admin123");
  };

  return (
    <div className="login-wrap">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@gmail.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button className="login-btn" type="submit">Log in</button>

        <p className="hint">
          User: user@gmail.com / user123 <br />
          Admin: admin@gmail.com / admin123
        </p>
      </form>
    </div>
  );
};

export default Login;
