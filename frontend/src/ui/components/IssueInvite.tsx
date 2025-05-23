// frontend/src/ui/components/IssueInvite.tsx
import React from "react";
import { EventResource } from "../../structs/Message";
import { Invite, InvitesType, User } from "../../structs/models/Models";
import { useSendEventMessage } from "../hooks/useSendEventMessage";

interface IssueInviteProps {
  user: User;
  type: InvitesType;
  roomId?: number | null;
}

const IssueInvite: React.FC<IssueInviteProps> = ({ user, type, roomId = null }) => {
  const [_, err, sendInvite] = useSendEventMessage<Invite>("/api/invites");
  const ownId = Number(localStorage.getItem("uID"));

  return (
    <div className="odd:bg-[#1E2B3A] even:bg-[#2C3A47] p-3 rounded mb-2">
      <div className="flex items-center space-x-4">
        <span className="text-white font-medium">{user.username}</span>
        <button
          onClick={() => {
            sendInvite({
              channel: `user:${user.id}:invites`,
              method: "POST",
              event_name: "invite_sent",
              contents: {
                id: 0,
                type: type,
                state: "pending",
                room_id: roomId,
                issuer_id: ownId,
                receiver_id: user.id,
              },
            } as EventResource<Invite>);
          }}
          className="
            flex-shrink-0
            px-3 py-1
            bg-blue-600 text-white
            rounded hover:bg-blue-700
            transition-colors
          "
        >
          Invite
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-red-500">{err}</p>}
    </div>
  );
};

export default IssueInvite;