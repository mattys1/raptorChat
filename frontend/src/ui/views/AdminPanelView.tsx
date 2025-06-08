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

  const assignAdmin = (id: number) => {
    fetch(`${SERVER_URL}/api/admin/users/${id}/admin`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) setUsers((prev) => prev.map(u => u.id === id ? { ...u } : u));
        else console.error("Failed to assign admin");
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="flex-1 p-8 min-h-screen bg-[#394A59]">
      <div className="max-w-3xl mx-auto bg-[#1E2B3A] text-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>

        <details
          open={open === "delete"}
          onToggle={(e) => setOpen(e.currentTarget.open ? "delete" : null)}
          className="border border-gray-700 rounded-md"
        >
          <summary className="cursor-pointer font-semibold text-lg p-4 bg-gray-700 rounded-t-md">
            Delete users
          </summary>
          <ul className="p-4 space-y-2">
            {users.map((u) => (
              <li key={u.id} className="flex justify-between items-center">
                <span>
                  {u.username} ({u.email})
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => deleteUser(u.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => assignAdmin(u.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  >
                    Make Admin
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </details>

        <details
          open={open === "add"}
          onToggle={(e) => setOpen(e.currentTarget.open ? "add" : null)}
          className="border border-gray-700 rounded-md"
        >
          <summary className="cursor-pointer font-semibold text-lg p-4 bg-gray-700 rounded-t-md">
            Add user
          </summary>
          <div className="p-4">
            <AddUserForm onCreated={() => fetchUsers()} />
          </div>
        </details>
      </div>
    </div>
  );
};

export default AdminPanelView;