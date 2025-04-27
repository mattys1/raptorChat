import { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";
import { SERVER_URL } from "../../../api/routes";

export function useLoginHook(navigate: NavigateFunction) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		try {
			e.preventDefault();
			setLoading(true);

			console.log("Submitting login form...");

			const response = await fetch(SERVER_URL + "/login", {
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

				const idResponse = await fetch(SERVER_URL + "/api/user/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${data.token}`
					}
				})

				if(idResponse.ok) {
					const idData = await idResponse.json();
					console.log("User ID:", idData);
					localStorage.setItem('uID', idData);

					setLoading(false)	

					navigate(ROUTES.MAIN)

				} else {
					console.log("Login failed:", response.status);
					alert("Login failed. Server responded with an error.");
				}
			}
		} catch (error) {
			console.error("Error during login:", error);
		}
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
