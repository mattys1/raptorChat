import React, { useState } from "react";
import styles from "./Login.module.css";
import { useLoginHook } from "../hooks/useLoginHook";

interface FormProps {
	readValue: string
	setValue: (email: string) => void
	label: string
	placeholder: string
	id: string
}

const Form = ({
	readValue: readValue,
	setValue: setValue,
	label,
	placeholder,
	id
}: FormProps) => {
	return (
		<>
			<label htmlFor={id}>{label}</label>
			<input
				type="text"
				id={id}
				name={id}
				placeholder={placeholder}
				required
				value={readValue}
				onChange={(e) => setValue(e.target.value)}
			/>
		</>
	)
}

const LoginView  = ({ onLoginSuccess, onToggleToRegistration }: {
	onLoginSuccess: () => void;
	onToggleToRegistration: () => void;
}) => {
	const { 
		email, password, loading, setEmail, setPassword, handleSubmit 
	} = useLoginHook(onLoginSuccess)
	
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
						label="Email or Nickname"
						placeholder="Enter email or nickname"
						id="userEmail" />
					<Form 
						readValue={password}
						setValue={setPassword}
						label="Password"
						placeholder="Enter password"
						id="userPassword" />
					<div className={styles.buttonGroup}>
						<button type="submit" className={styles.primaryBtn} disabled={loading}>
							{loading ? "Logging in..." : "Log In"}
						</button>
						<button 
							type="button" 
							className={styles.secondaryBtn} 
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
