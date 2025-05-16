import React from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../routes";
import { DeviceSelector } from "../components/MicrophoneSelector";

const SettingsMain: React.FC = () => {
	const navigate = useNavigate();
	const { permissions, logout } = useAuth();


	return (
		<div>
			<h1>Settings</h1>
			<ul style={{ listStyle: "none", padding: 0 }}>
				{permissions.includes("view_admin_panel") && (
					<li>
						<button onClick={() => navigate(ROUTES.ADMIN)}>
							Admin Panel
						</button>
					</li>
				)}
				<li>
					<button onClick={() => navigate(`${ROUTES.SETTINGS}/change-username`)}>Change Username</button>
				</li>
				<li>
					<button onClick={() => navigate(`${ROUTES.SETTINGS}/change-password`)}>Change Password</button>
				</li>
				<li>
					<DeviceSelector storageName="selectedMicrophone" displayName="Microphone "/>
				</li>	

				<li>
					<DeviceSelector storageName="selectedCamera" displayName="Camera "/>
				</li>	

				<li>
					<button onClick={() => navigate(ROUTES.LOGIN)}>Log Out</button>
				</li>
				<li>
					<button onClick={() => navigate(ROUTES.MAIN)}>
						Return to Start Screen
					</button>
				</li>
			</ul>
		</div>
	);
};

export default SettingsMain;
