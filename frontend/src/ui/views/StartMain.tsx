import React from "react";
import "./Start.css";
import { useStartHook } from "../hooks/useStartHook";

const StartMain: React.FC = () => {
	const socket = useStartHook()

	return (
		<div>
			<h1>Welcome to raptorChat!</h1>
			<button className="add-friend-btn">
				<span className="icon">+</span> Add Friend
			</button>
		</div>
	);
};

export default StartMain;
