import React from "react";
import { useParams } from "react-router-dom";
import IssueInvite from "../components/IssueInvite";
import { useInviteFriendsHook } from "../hooks/views/useInviteFriendsHook";

const InviteFriendsView: React.FC = () => {
  const roomId = Number(useParams<{ chatId: string }>().chatId);
  const props = useInviteFriendsHook(roomId);

  return (
    <div className="flex-1 bg-[#394A59] min-h-screen flex justify-start p-8">
      <div className="w-full max-w-lg bg-[#1E2B3A] text-white rounded-lg shadow p-6 space-y-4">
        <h1 className="text-2xl font-bold">Invite Friend</h1>
        <div className="space-y-2">
          {props.nonFriends.map((user) => (
            <IssueInvite
              key={user.id}
              user={user}
              type="direct"
              roomId={roomId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default InviteFriendsView;