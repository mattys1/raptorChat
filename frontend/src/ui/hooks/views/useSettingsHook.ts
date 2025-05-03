import { NavigateFunction } from "react-router-dom";
import { useAudioInputs } from "../useAudioInputs";

export const useSettingsHook = (navigate: NavigateFunction) => {
	const handleChangeUsername = async () => {
		console.log("Change username clicked");
		console.warn("This feature is not implemented yet.");
	};

	const handleChangePassword = async () => {
		console.log("Change password clicked");
		console.warn("This feature is not implemented yet.");
	};

	return {
		handleChangeUsername,
		handleChangePassword,
	}
}
