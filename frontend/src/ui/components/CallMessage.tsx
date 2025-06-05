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

	const message = {
		[CallStatus.Active]: "There is an active call in the room.",
		[CallStatus.Completed]: `There was a call in this room on ${formatDate(call.created_at)}, lasting ${formatDuration(new Date(call.ended_at!).getTime() - new Date(call.created_at!).getTime())}.`,
	}	

	return (
		<div>
			{
				message[call.status]
			}
		</div>
	)
}

export default CallMessage
