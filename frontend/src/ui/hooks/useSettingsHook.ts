import { NavigateFunction } from "react-router-dom";

export const useSettingsHook = (navigate: NavigateFunction) => {
	const handleChangeUsername = async () => {
		// try {
		//   const response = await fetch("http://localhost:8080/change-username", {
		//     method: "POST",
		//     headers: { "Content-Type": "application/json" },
		//     body: JSON.stringify({ newUsername: "dummy" }),
		//   });
		// } catch (error) {
		//   console.error("Error changing username", error);
		// }

		console.log("Change username clicked");
		console.warn("This feature is not implemented yet.");
	};

	const handleChangePassword = async () => {
		// try {
		//   const response = await fetch("http://localhost:8080/change-password", {
		//     method: "POST",
		//     headers: { "Content-Type": "application/json" },
		//     body: JSON.stringify({ newPassword: "dummy" }),
		//   });
		// } catch (error) {
		//   console.error("Error changing password", error);
		// }

		console.log("Change password clicked");
		console.warn("This feature is not implemented yet.");
	};

	return {
		handleChangeUsername,
		handleChangePassword,
	}
}
