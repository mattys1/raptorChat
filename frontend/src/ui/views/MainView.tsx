import React from "react";
import "./Start.css";
import { useMainHook } from "../hooks/useStartHook";

const MainView: React.FC = () => {
	const props = useMainHook()
	const socket = props.socket
	const users = props.users

	return (
		<div>
			{users.map((user) => {
				return(
					<li key={user.id}>
						{user.username}
						{user.email}
						{user.created_at.toString()}
					</li>
				)
			})}
			<h1>Welcome to raptorChat!</h1>
			<button className="add-friend-btn">
				<span className="icon">+</span> Add Friend
			</button>
		</div>
	);
};

export default MainView;
