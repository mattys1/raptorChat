import { useState } from "react";

export function useLoginHook(onLoginSuccess: () => void) {
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

			setupWebSocket();

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

	const setupWebSocket = () => {
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
