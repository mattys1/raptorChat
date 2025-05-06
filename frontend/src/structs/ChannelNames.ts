const ChannelNames = {
	ROOMS_OF_USER: "room:user:{id}",
	USER_PERSONAL: "user:{id}",
	ROOM_MESSAGES: "room:{roomId}:messages",
	ROOM_MEMBERS: "room:{roomId}:members"
} as const;
export type ChannelNames = keyof typeof ChannelNames


export class ChannelNameFormatter {
	static format(channelName: ChannelNames, params: Record<string, string | number>): string {
		let formattedName = typeof ChannelNames[channelName];
		
		Object.entries(params).forEach(([key, value]) => {
			formattedName = typeof formattedName.replace(`{${key}}`, String(value));
		});
		
		return formattedName;
	}
}

export default ChannelNames;
