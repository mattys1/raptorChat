import React from "react";
import Sidebar from "./views/Sidebar";
import "./views/Start.css";
import { NavigateFunction, Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "./routes";

const Layout: React.FC = () => {
	const navigate = useNavigate()
	return (
		<div className="container">
			<aside className="sidebar">
				<Sidebar onSettingsClick={() => {navigate(ROUTES.SETTINGS); console.log("Navigating to settings")}} />
			</aside>
			<main className="main-content">{<Outlet />}</main>
		</div>
	);
};

export default Layout;
