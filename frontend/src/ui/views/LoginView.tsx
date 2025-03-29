import React, { useState } from "react";
import styles from "./Login.module.css";

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
	
			const ws = new WebSocket("ws://localhost:8080/ws");
			ws.onopen = () => {
				console.log("WebSocket connection established.");
	
				const subscription = {
					type: "subscribe",
					contents: "chat_messages"
				}
	
				ws.send(JSON.stringify(subscription));
			}
	
			ws.onmessage = (event) => {
				console.log("WebSocket message received:", event.data);
			}
	
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
