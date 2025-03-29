import React, { useState } from "react";
import styles from "./Login.module.css";

import { useRegistrationHook } from "../hooks/useRegistrationHook";
import { Form } from "../components/Form"

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
					<Form 
						readValue={email}
						setValue={setEmail}
						label="E-mail"
						placeholder="Enter your email"
						id="userEmail"
					/>

					<Form 
						readValue={username}
						setValue={setUsername}
						label="Username"
						placeholder="Enter your username"
						id="username"
					/>

					<Form 
						readValue={password}
						setValue={setPassword}
						label="Password"
						placeholder="Enter your password"
						id="userPassword"
						hidden={true}
					/>

					<Form 
						readValue={repeatPassword}
						setValue={setRepeatPassword}
						label="Repeat Password"
						placeholder="Repeat your password"
						id="repeatPassword"
						hidden={true}
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
