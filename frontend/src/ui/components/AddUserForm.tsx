import { useState } from "react";
import { SERVER_URL } from "../../api/routes";

interface Props {
  onCreated: () => void;
}

const AddUserForm: React.FC<Props> = ({ onCreated }) => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${SERVER_URL}/api/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      alert("User created");
      setForm({ username: "", email: "", password: "" });
      onCreated();
    } else {
      alert("Failed to create user");
    }
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.6rem" }}>
      <input
        placeholder="username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />
      <input
        placeholder="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        placeholder="password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <button type="submit">create</button>
    </form>
  );
};

export default AddUserForm;