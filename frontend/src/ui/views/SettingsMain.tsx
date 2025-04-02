import { NavigateFunction, useNavigate } from "react-router-dom";

import { useSettingsHook } from "../hooks/useSettingsHook";
import { ROUTES } from "../routes";

const SettingsView = () => {
	const navigate = useNavigate()
	const { handleChangeUsername, handleChangePassword } = useSettingsHook(navigate);

	return (
		<div>
			<h1>Settings</h1>
			<ul style={{ listStyle: "none", padding: 0 }}>
				<li>
					<button onClick={handleChangeUsername}>Change Username</button>
				</li>
				<li>
					<button onClick={handleChangePassword}>Change Password</button>
				</li>
				<li>
					<button onClick={() => navigate(ROUTES.LOGIN)}>Log Out</button>
				</li>
				<li>
					<button onClick={() => navigate(ROUTES.MAIN)}>Return to Start Screen</button>
				</li>
			</ul>
		</div>
	);
};

export default SettingsView;
