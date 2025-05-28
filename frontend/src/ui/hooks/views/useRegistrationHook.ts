import { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { SERVER_URL } from "../../../api/routes";
import { useLoginHook } from "./useLoginHook";

export function useRegistrationHook(navigate: NavigateFunction) {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const loginData = useLoginHook(navigate)

	const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (password !== repeatPassword) {
			window.alert("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch(SERVER_URL + "/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email , username, password }),
			});

			if (response.ok) {
				// navigate(ROUTES.MAIN);
				if(email === "" || username === "" || password === "") {
					console.log("Email, username or password is empty. Registration aborted.");
					return
				}
				loginData.setEmail(email)
				loginData.setPassword(password)

				await loginData.handleSubmit(email, password, e)
				alert("Registration successful!");
			} else {
				setLoading(false);
				alert("Registration failed. Server responded with an error.");
			}

		} catch (error) {
			setLoading(false);
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
		handleSubmit: handleRegister
	}

}
