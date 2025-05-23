import React from "react";
import { useSidebarHook } from "../hooks/views/useSidebarHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

interface SidebarProps {
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const props = useSidebarHook();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Friends</h2>
        <button
          className="mb-2 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => navigate(ROUTES.INVITE_FRIENDS)}
        >
          Invite Friends
        </button>
        <ul className="space-y-1">
          {props.rooms?.map((room) =>
            room?.type === "direct" ? (
              <li
                key={room.id}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700"
                onClick={() =>
                  navigate(`${ROUTES.CHATROOM}/${room.id}`)
                }
              >
                {room.name}
              </li>
            ) : null
          )}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Group Chat</h2>
        <ul className="space-y-1">
          {props.rooms?.map((room) =>
            room?.type === "group" ? (
              <li
                key={room.id}
                className="cursor-pointer px-2 py-1 rounded hover:bg-gray-700"
                onClick={() =>
                  navigate(`${ROUTES.CHATROOM}/${room.id}`)
                }
              >
                {room.name}
              </li>
            ) : null
          )}
        </ul>
      </div>

      <div className="mt-auto space-y-2">
        <button
          className="w-full text-left px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
          onClick={onSettingsClick}
        >
          Settings
        </button>
        <button
          className="w-full text-left px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={() => navigate(`${ROUTES.CHATROOM}/create`)}
        >
          Create room
        </button>
      </div>
    </div>
  );
};

export default Sidebar;