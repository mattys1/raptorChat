import React, { useState } from "react";
import styles from "./Login.module.css";
import { useRegistrationHook } from "../hooks/useRegistrationHook";

const RegistrationView = ({
	onRegistrationSuccess,
	onToggleToLogin,
}: {
		onRegistrationSuccess: () => void;
		onToggleToLogin: () => void;
	}) => {

	const {
		email,
		username,
		password,
		repeatPassword,
		loading,
		setEmail,
		setUsername,
		setPassword,
		setRepeatPassword,
		handleSubmit
	} = useRegistrationHook(onRegistrationSuccess)

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
