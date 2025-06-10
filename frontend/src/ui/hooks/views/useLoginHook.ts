import React, { useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { ROUTES } from "../../routes";
import { SERVER_URL } from "../../../api/routes";
import { useAuth } from "../../contexts/AuthContext";
import { CentrifugoService } from "../../../logic/CentrifugoService";

export function useLoginHook(navigate: NavigateFunction) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();

	const handleSubmit = async (email: string, password: string, e: React.FormEvent<HTMLFormElement>) => {
		try {
			e.preventDefault();
			setLoading(true);

			console.log("Submitting login form, email: ", email, "password:", password);

			if (email === "" || password === "") {
				throw("Email or password is empty. Login aborted.");
			}

			const response = await fetch(SERVER_URL + "/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			if(response.ok) {
				// temporarily stroing the token in local storage
				const data = await response.json();
				console.log("Login successful:", data);
				// localStorage.setItem("token", data.token);

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
					const myId = typeof idData === "number" ? idData : idData.id;
					localStorage.setItem("uID", String(myId));

					setLoading(false)
					login(data.token);

					const centrifugoTokenResponse = await fetch(SERVER_URL + "/centrifugo/token", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"Authorization": `Bearer ${data.token}`
						},
						body: localStorage.getItem("uID")
					})
					if(!centrifugoTokenResponse.ok) {
						throw new Error("Failed to fetch Centrifugo token");
					}

					const centrifugoToken = await centrifugoTokenResponse.json();
					console.log("Centrifugo token:", centrifugoToken);
					localStorage.setItem("centrifugoToken", centrifugoToken);
					CentrifugoService.disconnect()

					navigate(ROUTES.MAIN)

				} else {
					console.log("Login failed:", response.status);
					alert("Login failed. Server responded with an error.");
				}
			} else {
				console.log("Login failed:", response.status);

				switch(response.status) {
					case 401:
						alert("Login failed. Invalid email or password.");
						break;
				}
			}
		} catch (error) {
			if (error instanceof TypeError && error.message === "Failed to fetch") {
				alert("Cannot connect to the server. Please check your internet connection or try again later.");
			} else {
				alert("Unknown Login error");
			}
		} finally {
			setLoading(false);
		}
	};

	return { email, password, loading, setEmail, setPassword, handleSubmit };
}
