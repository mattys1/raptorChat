// frontend/src/ui/views/MainView.tsx
import React from "react";
import RecentActivity from "../components/RecentActivity";

const MainView: React.FC = () => {

	return (
		<div>
			<div
				className="
				flex flex-col items-center justify-center
				bg-[#394A59] text-white
				p-4
				"
			>
				<h1 className="text-3xl font-semibold mb-6">Welcome to raptorChat!</h1>

			</div>
			<RecentActivity />
		</div>
	);
};

export default MainView;
