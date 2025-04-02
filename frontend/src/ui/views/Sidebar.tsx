import React from "react";
import "./Start.css";
import { useSidebarHook } from "../hooks/useSidebarHook";

interface SidebarProps {
  onSettingsClick: () => void;
}


const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
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
							return (<li key={chat.id}>
								<div> {chat?.name}</div>
							</li>)
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
		</>
	);
};

export default Sidebar;
