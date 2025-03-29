import React from "react";
import "./Start.css";
import { useMainHook } from "../hooks/useStartHook";

const MainView: React.FC = () => {
	const socket = useMainHook()

	return (
		<div>
			<h1>Welcome to raptorChat!</h1>
			<button className="add-friend-btn">
				<span className="icon">+</span> Add Friend
			</button>
		</div>
	);
};

export default MainView;
