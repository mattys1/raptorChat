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
import { AdminPanelView } from './views/AdminPanelView';
import { AdminRoute } from './components/AdminRoute';

import { ROUTES } from "./routes";
import InviteToChatroomView from "./views/InviteToChatroomview";
import UserInvitesView from "./views/UserInvitesView";
import CreateRoomView from "./views/CreateRoomView";
import InviteFriendsView from "./views/InviteFriendsView";
import VideoChat from "./views/VideoChatView";

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
				<Route path={`${ROUTES.CHATROOM}/create`} element={<CreateRoomView />} />
				<Route path={`${ROUTES.CHATROOM}/:chatId/invite`} element=<InviteToChatroomView />/>
				<Route path={`${ROUTES.MAIN}/invites`} element={<UserInvitesView />} />
				<Route path={ROUTES.ADMIN} element={<AdminRoute><AdminPanelView/></AdminRoute>} />
				<Route path={ROUTES.INVITE_FRIENDS} element={<InviteFriendsView />}></Route>
				<Route path={`${ROUTES.CHATROOM}/:chatId/call`} element={<VideoChat />}></Route>
			</Route>
		</Routes>
	);
};

export default App;
