import { useEffect, useState } from "react";
import { SERVER_URL } from "../../api/routes";

export const useRoomRoles = (roomId: number) => {
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch(`${SERVER_URL}/api/rooms/${roomId}/myroles`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        setRoles(await res.json());
      }
    };
    run();
  }, [roomId]);

  return {
    isOwner:      roles.includes("owner"),
    isModerator:  roles.includes("moderator"),
  };
};