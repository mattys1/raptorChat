import React from "react";
import "./Start.css";
import { useMainHook } from "../hooks/views/useStartHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

const MainView: React.FC = () => {
	const props = useMainHook()
	const navigate = useNavigate()
	// const users = props.users

	// return (
	// 	<div>
	// 		{users.map((user) => {
	// 			return(
	// 				<li key={user.id}>
	// 					{user.username}
	// 					{user.email}
	// 					{user.created_at.toString()}
	// 				</li>
	// 			)
	// 		})}
	// 		<h1>Welcome to raptorChat!</h1>
	// 		<button className="add-friend-btn">
	// 			<span className="icon">+</span> Add Friend
	// 		</button>
	// 	</div>
	// );

	return <>
		test <br/>
		<button onClick={() => navigate(`${ROUTES.MAIN}/invites`)}>See invites</button>
	</>
};

export default MainView;
