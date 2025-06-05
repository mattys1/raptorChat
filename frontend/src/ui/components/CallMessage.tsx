import { Call, CallStatus } from "../../structs/models/Models";

const CallMessage = ({call}: {call: Call}) => {
	console.log("CallMessage call:", call);

	const formatDate = (dateString: string): string => {
		const date = new Date(dateString);
		const day = date.getDate();
		const month = date.toLocaleString('default', { month: 'long' });
		const year = date.getFullYear();
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		
		const ordinalSuffix = ['th', 'st', 'nd', 'rd'][(day % 100 > 3 && day % 100 < 21) ? 0 : Math.min(day % 10, 3)];
		
		return `${day}${ordinalSuffix} of ${month} ${year}, ${hours}:${minutes}`;
	};

	const formatDuration = (milliseconds: number) => {
		const seconds = Math.floor(milliseconds / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		
		const formattedHours = hours.toString().padStart(2, '0');
		const formattedMinutes = (minutes % 60).toString().padStart(2, '0');
		const formattedSeconds = (seconds % 60).toString().padStart(2, '0');
		
		return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
	};

	const getMessageContent = () => {
		if (call.status === CallStatus.Active) {
			return "There is an active call in the room.";
		} else {
			return (
				<>
					There was a call in this room on <span className="font-bold">{formatDate(call.created_at)}</span>, 
					lasting <span className="text-gray-300">{formatDuration(new Date(call.ended_at!).getTime() - new Date(call.created_at!).getTime())}</span>.
				</>
			);
		}
	};

	return (
		<div className="py-2 my-2 text-white text-center border-t border-b border-gray-600 rounded px-3 bg-gray-800 bg-opacity-30">
			{getMessageContent()}
		</div>
	)
}

export default CallMessage
