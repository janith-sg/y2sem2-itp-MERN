// src/components/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // use custom hook
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check for admin credentials first
    if (email === "admin@gmail.com" && password === "admin@123") {
      // Store admin login in localStorage for tracking
      const adminUser = {
        id: "ADMIN001",
        firstName: "Admin",
        lastName: "User",
        email: email,
        phone: "0000000000",
        role: "admin",
        profileImage: null,
        loginTime: new Date().toLocaleString()
      };
      
      // Get existing users and add/update admin
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const otherUsers = existingUsers.filter(u => u.id !== "ADMIN001");
      localStorage.setItem('registeredUsers', JSON.stringify([...otherUsers, adminUser]));
      
      login({ 
        id: "ADMIN001",
        email: email, 
        firstName: "Admin",
        lastName: "User",
        phone: "0000000000",
        role: "admin" 
      });
      
      alert("Welcome Admin!");
      navigate("/"); // Redirect to home page
      return;
    }

    // Get registered users from localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if no users are registered
    if (registeredUsers.length === 0) {
      alert("No users registered yet! Please sign up first.");
      navigate("/signup");
      return;
    }

    // Find user with matching email and password
    const user = registeredUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Update login time in localStorage
      const updatedUsers = registeredUsers.map(u => 
        u.id === user.id 
          ? { ...u, loginTime: new Date().toLocaleString() }
          : u
      );
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
      
      // Successful login - redirect to home page
      login({ 
        id: user.id,
        email: user.email, 
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: "user" 
      });
      
      alert(`Welcome back, ${user.firstName}!`);
      navigate("/"); // Always redirect to home page
      return;
    }

    // Invalid credentials
    alert("Invalid email or password! Please check your credentials or sign up if you don't have an account.");
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
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />

        <button className="login-btn" type="submit">Log in</button>

        <div className="login-footer">
          <p>Don't have an account? <Link to="/signup" className="signup-link">Sign Up</Link></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
