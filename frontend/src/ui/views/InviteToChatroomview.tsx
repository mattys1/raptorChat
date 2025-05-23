// frontend/src/ui/views/InviteToChatroomView.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useInviteToChatroomHook } from "../hooks/views/useInviteToChatroomHook";
import IssueInvite from "../components/IssueInvite";

const InviteToChatroomView: React.FC = () => {
  const roomId = Number(useParams<{ chatId: string }>().chatId);
  const props = useInviteToChatroomHook(roomId);

  return (
    <div className="flex-1 bg-[#394A59] min-h-screen flex justify-start p-8">
      <div className="w-full max-w-lg bg-[#1E2B3A] text-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Chatroom Invite</h1>
        <div className="space-y-2">
          {props.usersNotInRoom?.map((user) => (
            <IssueInvite
              key={user.id}
              user={user}
              type="group"
              roomId={roomId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteToChatroomView;