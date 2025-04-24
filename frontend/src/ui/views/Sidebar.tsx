import React from "react";
import "./Start.css";
import { useSidebarHook } from "../hooks/useSidebarHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

interface SidebarProps {
	onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
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
						props.rooms?.map((room) => {
							return (
								<li onClick={() => navigate(`${ROUTES.roomROOM}/${room.id}`)} key={room.id}>
									{room?.name}
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
		</>
	);
};

export default Sidebar;
