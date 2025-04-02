import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { ROUTES } from "../routes";

export function useRegistrationHook(navigate: NavigateFunction) {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (password !== repeatPassword) {
			window.alert("Passwords do not match");
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
				navigate(ROUTES.MAIN);
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

	return {
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
	}

}
