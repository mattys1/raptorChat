// frontend/src/ui/views/ManageRoomView.tsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useManageRoomHook } from "../hooks/views/useManageRoomHook";
import { useRoomRoles } from "../hooks/useRoomRoles";
import { useResourceFetcher } from "../hooks/useResourceFetcher";
import { Room } from "../../structs/models/Models";

const ManageRoomView: React.FC = () => {
  const roomId = Number(useParams().chatId);
  const navigate = useNavigate();

  const { isOwner } = useRoomRoles(roomId);
  const [roomInfo] = useResourceFetcher<Room | null>(null ,`/api/rooms/${roomId}`)

  const { users, designateMod, deleteRoom } = useManageRoomHook(
    roomId,
    Number(localStorage.getItem("uID") ?? 0)
  );

  return (
    <div className="flex-1 bg-[#394A59] min-h-screen p-4">
      <div className="max-w-3xl mx-auto bg-[#1E2B3A] text-white rounded-lg shadow p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Manage room {roomInfo?.name}</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 bg-gray-600 rounded hover:bg-gray-500 transition"
          >
            ← Back
          </button>
        </div>

        <div>
          <h3 className="text-xl font-semibold mt-4">Members</h3>
          {users.length > 0 ? (
            <ul className="space-y-3 mt-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between bg-[#2C3A47] px-4 py-2 rounded"
                >
                  <div>
                    <span className="font-medium">{u.username}</span>{" "}
                    <span className="text-gray-300">({u.email})</span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => designateMod(u.id)}
                      className="px-2 py-1 bg-blue-600 rounded hover:bg-blue-700 transition text-sm"
                    >
                      Designate Mod
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-300 mt-2">No other users in this room.</p>
          )}
        </div>

        {isOwner && (
          <div className="mt-6 space-y-4">
            <hr className="border-gray-700" />
            <button
              onClick={deleteRoom}
              className="w-full px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition"
            >
              Delete groupchat / Unfriend user
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRoomView;