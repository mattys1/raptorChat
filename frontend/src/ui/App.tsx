import React from "react";
import LoginView from "./views/LoginView";
import RegistrationView from "./views/RegistrationView";
// import Layout from "./Layout";
import MainView from "./views/MainView";
// import SettingsMain from "./views/SettingsMain";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import SettingsMain from "./views/SettingsMain";
import { ROUTES } from "./routes";

const App: React.FC = () => {
	const navigate = useNavigate()

	return (
		<Routes>
			<Route path={ROUTES.ROOT} element={<LoginView />}/>
			<Route path={ROUTES.LOGIN} element={<LoginView />}/>

			<Route path={ROUTES.REGISTER} element={<RegistrationView />}/>

			<Route path={ROUTES.APP} element={<Layout />}>
				<Route path={ROUTES.MAIN} element={<MainView />} />
				<Route path={ROUTES.SETTINGS} element={<SettingsMain />} />
			</Route>
		</Routes>
	);
};

export default App;
