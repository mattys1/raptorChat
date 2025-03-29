import React, { useState } from "react";
import styles from "./Login.module.css";

const RegistrationView = ({
	onRegistrationSuccess,
	onToggleToLogin,
}: {
		onRegistrationSuccess: () => void;
		onToggleToLogin: () => void;
	}) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password }),
      });

      if (response.ok) {
        alert("Registration successful!");
        onRegistrationSuccess();
      } else {
        alert("Registration failed. Server responded with an error.");
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      alert("Registration request failed. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.avatarContainer}>
          <img src="avatar.png" alt="Avatar" className={styles.avatar} />
        </div>
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <label htmlFor="userEmail">E-mail</label>
          <input
            type="email"
            id="userEmail"
            name="userEmail"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter your username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <label htmlFor="userPassword">Password</label>
          <input
            type="password"
            id="userPassword"
            name="userPassword"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="repeatPassword">Repeat Password</label>
          <input
            type="password"
            id="repeatPassword"
            name="repeatPassword"
            placeholder="Repeat your password"
            required
            value={repeatPassword}
            onChange={(e) => setRepeatPassword(e.target.value)}
          />
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={onToggleToLogin}>
              Already have an account? Log in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationView;
