import { useParams, useNavigate } from "react-router-dom";
import { useManageRoomHook } from "../hooks/views/useManageRoomHook";
import { ROUTES } from "../routes";
import { useRoomRoles } from "../hooks/useRoomRoles";

const ManageRoomView: React.FC = () => {
  const roomId   = Number(useParams().chatId);
  const navigate = useNavigate();

  const { isOwner } = useRoomRoles(roomId);

  const { users, designateMod, deleteRoom } = useManageRoomHook(
    roomId,
    Number(localStorage.getItem("uID") ?? 0)
  );

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Manage room #{roomId}</h2>

      <button onClick={() => navigate(-1)}>← back</button>

      <h3 style={{ marginTop: "1.5rem" }}>Members</h3>
      <ul>
        {users.map((u) => (
          <li key={u.id} style={{ marginBottom: ".5rem" }}>
            {u.username} ({u.email}){" "}
            {isOwner && (
              <button onClick={() => designateMod(u.id)}>designate mod</button>
            )}
          </li>
        ))}
      </ul>
      {users.length === 0 && <p>No other users in this room.</p>}

      {isOwner && (
        <>
          <hr style={{ margin: "2rem 0" }} />
          <button style={{ color: "red" }} onClick={deleteRoom}>
            Delete groupchat / Unfriend user
          </button>
        </>
      )}
    </div>
  );
};

export default ManageRoomView;