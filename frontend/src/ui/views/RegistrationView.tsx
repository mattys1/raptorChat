import React, { useState } from "react";
import styles from "./Login.module.css";

import { useRegistrationHook } from "../hooks/useRegistrationHook";
import { Form } from "../components/Form"
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

const RegistrationView = () => {
	const navigate = useNavigate()

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
	} = useRegistrationHook(navigate)

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

						<button type="button" className={styles.secondaryBtn} onClick={() => navigate(ROUTES.ROOT)}>
							Already have an account? Log in
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RegistrationView;
