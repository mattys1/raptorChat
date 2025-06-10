import React, { useCallback } from "react";
import { Invite, InvitesState, Room } from "../../structs/models/Models";
import { useSendEventMessage } from "../hooks/useSendEventMessage";
import { useUserInfo } from "../hooks/useUserInfo";
import { useResourceFetcher } from "../hooks/useResourceFetcher";

export const InviteReceived: React.FC<Invite> = (invite) => {
	const [acceptState, acceptError, acceptInvite] = useSendEventMessage(
		`/api/invites/${invite.id}`
	);
	const [rejectState, rejectError, rejectInvite] = useSendEventMessage(
		`/api/invites/${invite.id}`
	);

	const [sender] = useUserInfo(invite.issuer_id)
	const [room] = useResourceFetcher<Room | null>(null, `/api/rooms/${invite.room_id}`);

	const handleAccept = useCallback(() => {
		acceptInvite({
			channel: `user:${invite.receiver_id}:invites`,
			method: "PUT",
			event_name: "invite_accepted",
			contents: {
				id: invite.id,
				type: invite.type,
				state: InvitesState.Accepted,
				room_id: invite.room_id,
				issuer_id: invite.issuer_id,
				receiver_id: invite.receiver_id,
			},
		});
	}, [invite, acceptInvite]);

	const handleReject = useCallback(() => {
		rejectInvite({
			channel: `user:${invite.receiver_id}:invites`,
			method: "PUT",
			event_name: "invite_declined",
			contents: {
				id: invite.id,
				type: invite.type,
				state: InvitesState.Declined,
				room_id: invite.room_id,
				issuer_id: invite.issuer_id,
				receiver_id: invite.receiver_id,
			},
		});
	}, [invite, rejectInvite]);

	if (acceptState === "SUCCESS" || rejectState === "SUCCESS") {
		return null;
	}

	return (
		<div
			className="
			flex items-center justify-between
			w-full
			bg-[#2F3C4C] hover:bg-[#3F4E5C]
			text-white
			rounded-md shadow
			px-4 py-3
			"
		>
			<div className="flex flex-col">
				<span className="font-medium">
					{`Invite from ${sender.username}`}
				</span>
				{invite.type == "group" ? (
					<span className="text-sm text-gray-300">
						{`for room '${room ? room.name : "Loading..."}'`}
					</span>
				) : (
					<span className="text-sm text-gray-300">
						{`Become friends with ${sender.username}`}
					</span>
				)}
			</div>
			<div className="flex space-x-2">
				<button
					onClick={handleAccept}
					className="
					px-3 py-1
					bg-green-600 hover:bg-green-700
					text-white rounded
					transition-colors duration-200
					"
				>
					Accept
				</button>
				<button
					onClick={handleReject}
					className="
					px-3 py-1
					bg-red-600 hover:bg-red-700
					text-white rounded
					transition-colors duration-200
					"
				>
					Reject
				</button>
			</div>
			{(acceptError || rejectError) && (
				<p className="absolute right-4 bottom-1 text-xs text-red-400">
					{acceptError || rejectError}
				</p>
			)}
		</div>
	);
};
