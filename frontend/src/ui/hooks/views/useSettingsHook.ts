import { NavigateFunction } from "react-router-dom";
import { SERVER_URL } from "../../../api/routes";
import { useSendResource } from "../useSendResource";

export const useSettingsHook = (navigate: NavigateFunction) => {
	const handleChangeUsername = async () => {

	};

	const handleChangePassword = async () => {
		console.log("Change password clicked");
		console.warn("This feature is not implemented yet.");
	};

	return {
		handleChangeUsername,
	}
}
