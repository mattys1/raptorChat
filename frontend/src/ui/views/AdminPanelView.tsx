import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { SERVER_URL } from '../../api/routes';

export const AdminPanelView: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => setUsers(data))
      .catch(err => console.error(err));
  }, [token]);

  const deleteUser = (id: number) => {
    fetch(`${SERVER_URL}/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          setUsers(prev => prev.filter(u => u.id !== id));
        } else {
          console.error('Failed to delete user');
        }
      })
      .catch(err => console.error(err));
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id}>
            {u.username} ({u.email})
            <button onClick={() => deleteUser(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};