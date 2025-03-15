import React, { useState } from "react";
import "./Login.css";

interface LoginViewProps {
  onLoginSuccess: () => void;
  onToggleToRegistration: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onToggleToRegistration }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        onLoginSuccess();
      } else {
        alert("Login failed. Server responded with an error.");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      alert("Login request failed. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="avatar-container">
          <img src="avatar.png" alt="Avatar" className="avatar" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="userEmail">Email or Nickname</label>
          <input
            type="text"
            id="userEmail"
            name="userEmail"
            placeholder="Enter email or nickname"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="userPassword">Password</label>
          <input
            type="password"
            id="userPassword"
            name="userPassword"
            placeholder="Enter password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="button-group">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Logging in..." : "Log In"}
            </button>
            <button 
              type="button" 
              className="secondary-btn" 
              onClick={onToggleToRegistration}
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginView;
