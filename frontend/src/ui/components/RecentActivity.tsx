import { useEffect, useState } from "react";
import { Call, Message } from "../../structs/models/Models";
import { useResourceFetcher } from "../hooks/useResourceFetcher"

interface Activity {
	messages: Message[]
	calls: Call[]
}

type ActivityItem = {
	type: "message" | "call"
	created_at: Date
	contents: Call | Message
}

const RecentActivity = () => {
	const [activity] = useResourceFetcher<Activity>({messages: [], calls: []} , "/api/user/me/activity");
	const [items, setItems] = useState<ActivityItem[]>([])

	useEffect(() => {
		setItems([])
		setItems((prev) => [
			...prev,
			...activity.messages.map(m => {
				return {
					type: "message",
					created_at: new Date(m.created_at),
					contents: m
				} as ActivityItem
			}),
		])

		setItems((prev) => [
			...prev,
			...activity.calls.map(c => {
				return {
					type: "call",
					created_at: new Date(c.created_at),
					contents: c
				} as ActivityItem
			}),
		])

		setItems((prev) => prev.sort((a, b) => a.created_at.getTime() - b.created_at.getTime()))

		console.log("RecentActivity activity:", activity)
	}, [activity])

	return (
		<div>
			Recent Activity:
			<div className="flex flex-col gap-2">
				{items.map((item, index) => (
					<div key={index} className="py-2 my-2 text-white text-center border-t border-b border-gray-600 rounded px-3 bg-gray-800 bg-opacity-30">
						{item.type === "message" ? (
							<>
								Message at <span className="text-gray-300">{item.created_at.toLocaleString()}</span>, <span className="text-gray-400">{(item.contents as Message).contents}</span>
							</>
						) : (
								<>
									Call at <span className="text-gray-300">{item.created_at.toLocaleString()}</span>
								</>
							)}
					</div>
				))}
			</div>
		</div>
	)
}

export default RecentActivity
