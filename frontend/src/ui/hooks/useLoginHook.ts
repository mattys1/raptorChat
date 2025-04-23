import { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

export function useLoginHook(navigate: NavigateFunction) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			setLoading(true);

			console.log("Submitting login form...");

			const response = await fetch("http://localhost:8080/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			console.log(response)

			if(response.ok) {
				// temporarily stroing the token in local storage
				const data = await response.json();
				console.log("Login successful:", data);
				localStorage.setItem("token", data.token);
				setLoading(false)	

				navigate(ROUTES.MAIN)

			} else {
				console.log("Login failed:", response.status);
				alert("Login failed. Server responded with an error.");
			}
		} catch (error) {
			console.error("Error during login:", error);
		}

		return {
			email,
			password,
			loading,
			setEmail,
			setPassword,
			handleSubmit
		}
	}
}
