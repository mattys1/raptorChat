import React from "react";
import LoginView from "./views/LoginView";
import RegistrationView from "./views/RegistrationView";
// import Layout from "./Layout";
import MainView from "./views/MainView";
// import SettingsMain from "./views/SettingsMain";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import SettingsMain from "./views/SettingsMain";

const App: React.FC = () => {
	const navigate = useNavigate()

	const handleLoginSuccess = () => {
		navigate("/main")
	};

	return (
		<Routes>
			<Route path="/" element={<LoginView onLoginSuccess={handleLoginSuccess} onToggleToRegistration={() => navigate("/register")} />}/>
			<Route path="/login" element={<LoginView onLoginSuccess={handleLoginSuccess} onToggleToRegistration={() => navigate("/register")} />}/>

			<Route path="/register" element={<RegistrationView onRegistrationSuccess={handleLoginSuccess} onToggleToLogin={() => navigate("/")} />}/>

			<Route path="/main" element={
				<Layout navigate={navigate}>
					<MainView />
				</Layout>
			} />

			<Route path="/settings" element={
				<Layout navigate={navigate}>
					<SettingsMain/>
				</Layout>
			} />
		</Routes>
	);
};

export default App;
