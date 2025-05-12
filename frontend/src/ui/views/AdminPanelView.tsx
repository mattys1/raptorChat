import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { SERVER_URL } from "../../api/routes";
import AddUserForm from "../components/AddUserForm";

interface User {
  id: number;
  username: string;
  email: string;
}

export const AdminPanelView: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState<"delete" | "add" | null>("delete");

  const fetchUsers = () =>
    fetch(`${SERVER_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
      })
      .then((data) => setUsers(data))
      .catch((err) => console.error(err));

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const deleteUser = (id: number) => {
    fetch(`${SERVER_URL}/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) setUsers((prev) => prev.filter((u) => u.id !== id));
        else console.error("Failed to delete user");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Admin Panel</h1>

      <details
        open={open === "delete"}
        onToggle={(e) => setOpen(e.currentTarget.open ? "delete" : null)}
      >
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          Delete users
        </summary>
        <ul>
          {users.map((u) => (
            <li key={u.id} style={{ marginBottom: ".4rem" }}>
              {u.username} ({u.email}){" "}
              <button onClick={() => deleteUser(u.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </details>

      <details
        open={open === "add"}
        onToggle={(e) => setOpen(e.currentTarget.open ? "add" : null)}
        style={{ marginTop: "1rem" }}
      >
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>
          Add user
        </summary>
        <AddUserForm onCreated={() => fetchUsers()} />
      </details>
    </div>
  );
};