import { useCallback } from "react";
import { useResourceFetcher } from "../useResourceFetcher";
import { SERVER_URL } from "../../../api/routes";
import { User } from "../../../structs/models/Models";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

export const useManageRoomHook = (roomId: number, ownerId: number) => {
  const navigate = useNavigate();

  const [users, setUsers] = useResourceFetcher<User[]>(
    [],
    `/api/rooms/${roomId}/user`
  );

  const designateMod = useCallback(
    async (userId: number) => {
      const res = await fetch(
        `${SERVER_URL}/api/rooms/${roomId}/moderators/${userId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.ok) {
        alert("User promoted to moderator");
        setUsers((prev) => [...prev]);
      } else {
        alert("Operation failed");
      }
    },
    [roomId, setUsers]
  );

  const deleteRoom = useCallback(async () => {
    const eventResource = {
      channel:   `room:${roomId}`,
      method:    "DELETE",
      event_name:"room_deleted",
      contents:  { id: roomId },
    };

    const res = await fetch(`${SERVER_URL}/api/rooms/${roomId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventResource),
    });

    if (res.ok || res.status === 204) {
      navigate(ROUTES.MAIN);
    } else {
      alert("Failed to delete the room");
    }
  }, [roomId, navigate]);

  return {
    users: users.filter((u) => u.id !== ownerId),
    designateMod,
    deleteRoom,
  };
};