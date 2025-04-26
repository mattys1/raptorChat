import React from "react";
// import Layout from "./Layout";
// import SettingsMain from "./views/SettingsMain";
import { Routes, Route, useParams, } from "react-router-dom";
import Layout from "./Layout";

import LoginView from "./views/LoginView";
import RegistrationView from "./views/RegistrationView";
import SettingsMain from "./views/SettingsMain";
import MainView from "./views/MainView";
import ChatRoomView from "./views/ChatRoomView"

import { ROUTES } from "./routes";
import InviteToChatroomView from "./views/InviteToChatroomview";
import UserInvitesView from "./views/UserInvitesView";

const App: React.FC = () => {
	// const navigate = useNavigate()

	return (
		<Routes>
			<Route path={ROUTES.ROOT} element={<LoginView />}/>
			<Route path={ROUTES.LOGIN} element={<LoginView />}/>

			<Route path={ROUTES.REGISTER} element={<RegistrationView />}/>

			<Route path={ROUTES.APP} element={<Layout />}>
				<Route path={ROUTES.MAIN} element={<MainView />} />
				<Route path={ROUTES.SETTINGS} element={<SettingsMain />} />
				<Route path={`${ROUTES.CHATROOM}/:chatId`} element={<ChatRoomView />} />
				<Route path={`${ROUTES.CHATROOM}/:chatId/invite`} element=<InviteToChatroomView />/>
				<Route path={`${ROUTES.MAIN}/invites`} element={<UserInvitesView />} />
			</Route>
		</Routes>
	);
};

export default App;
