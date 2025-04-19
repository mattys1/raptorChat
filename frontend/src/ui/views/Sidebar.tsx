import React from "react";
import "./Start.css";
import { useSidebarHook } from "../hooks/useSidebarHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

interface SidebarProps {
	onSettingsClick: () => void;
	onCreateRoomClick: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick, onCreateRoomClick }) => {
	const navigate = useNavigate()

	const props = useSidebarHook()
	return (
		<>
			<div className="friends-section">
				<h2>Friends</h2>
				<ul>
					<li>Friend name</li>
					<li>Friend name</li>
					<li>Friend name</li>
				</ul>
			</div>
			<div className="groups-section">
				<h2>Group chat</h2>
				<ul>
					{
						props.chats.map((chat) => {
							console.log("Chat:", chat)
							console.log(typeof chat?.name)
							return (
								<li onClick={() => navigate(`${ROUTES.CHATROOM}/${chat.id}`)} key={chat.id}>
									{chat?.name}
								</li>
							)
						})
					}
				</ul>
			</div>
			<div
				className="styles-settings"
				onClick={onSettingsClick}
				style={{ cursor: "pointer" }}
			>
				<p>Settings</p>
			</div>
			<div
				className="styles-settings"
				onClick={onCreateRoomClick}
				style={{ cursor: "pointer" }}
			>
				<p>Create Room</p>
			</div>
		</>
	);
};

export default Sidebar;
