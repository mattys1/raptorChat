import { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";
import { SERVER_URL } from "../../api/routes";
import { useAuth } from "../contexts/AuthContext";

export function useLoginHook(navigate: NavigateFunction) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();
  
	const handleSubmit = async (e: React.FormEvent) => {
	  e.preventDefault();
	  setLoading(true);
  
	  try {
		const response = await fetch(`${SERVER_URL}/login`, {
		  method: "POST",
		  headers: { "Content-Type": "application/json" },
		  body: JSON.stringify({ email, password }),
		});
  
		if (!response.ok) {
		  alert("Login failed");
		  setLoading(false);
		  return;
		}
  
		const data = await response.json();
		login(data.token);
		navigate(ROUTES.MAIN);
	  } catch (err) {
		console.error(err);
		alert("Login error");
	  } finally {
		setLoading(false);
	  }
	};
  
	return { email, password, loading, setEmail, setPassword, handleSubmit };
  }
