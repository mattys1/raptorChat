import { useEffect, useRef } from "react";
import { Call, Message } from "../../structs/models/Models";
import CallMessage from "./CallMessage";
import ChatMessage from "./ChatMessage";

type TimelineItem = {
	type: "message" | "call"
	created_at: Date
	contents: Call | Message
}

interface MessageTimelineProps {
	messages: Message[];
	calls: Call[];
	myId: number;
	nameMap: Record<number, string>;
	avatarMap: Record<number, string>;
	isOwner?: boolean;
	isModerator?: boolean;
	deleteMessage: (message: Message) => void;
}

const MessageTimeline = ({messages, calls, myId, nameMap, avatarMap, isOwner, isModerator, deleteMessage}: MessageTimelineProps) => {
	const items: TimelineItem[] = [];

	items.push(...messages.map(m => {
		return {
			type: "message",
			created_at: new Date(m.created_at),
			contents: m
		} as TimelineItem;
	}))

	items.push(...calls.map(c => {
		return {
			type: "call",
			created_at: new Date(c.created_at),
			contents: c
		} as TimelineItem;
	}))

	items.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

	console.log("MessageTimeline items:", items);

	const itemsEndRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		itemsEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [items])

	return (
		<>
			{items.map((item, index) => (
				<div key={index}>
					{item.type === "message" ? 
						<ChatMessage 
							message={item.contents as Message} 
							myId={myId}
							nameMap={nameMap} 
							avatarMap={avatarMap}
							isOwner={isOwner}
							isModerator={isModerator}
							deleteMessage={deleteMessage}
						/> : 
						<CallMessage 
							call={item.contents as Call}
						/>
					}
				</div>
			))}
			<div ref={itemsEndRef} />
		</>
	)
}

export default MessageTimeline
