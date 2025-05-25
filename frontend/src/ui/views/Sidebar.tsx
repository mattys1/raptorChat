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
          className="w-full text-left px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
          onClick={() => navigate(ROUTES.MAIN)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9.75L12 3l9 6.75V20a.75.75 0 01-.75.75H3.75A.75.75 0 013 20V9.75z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 22V12h6v10"
          />
          </svg>
          Return to Start Screen
        </button>
        <button
          className="w-full text-left px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center"
          onClick={() => navigate(`${ROUTES.MAIN}/invites`)}
        >
          <span className="mr-2 text-xl font-bold"></span>
          See Invites
        </button>
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