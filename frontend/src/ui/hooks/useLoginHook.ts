import { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

export function useLoginHook(navigate: NavigateFunction) {
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
				// temporarily stroing the token in local storage
				const data = await response.json();
				console.log("Login successful:", data);
				localStorage.setItem("token", data.token);
				navigate(ROUTES.MAIN)
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

	return {
		email,
		password,
		loading,
		setEmail,
		setPassword,
		handleSubmit
	}
}
