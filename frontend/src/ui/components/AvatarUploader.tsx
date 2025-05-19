import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export const AvatarUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const { token } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch("http://localhost:8080/api/user/me/avatar", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Avatar upload failed:", res.status, text);
      alert(`Upload failed (${res.status}): ${text}`);
      return;
    }

    const { avatar_url } = (await res.json()) as { avatar_url: string };
    alert("Uploaded! New URL: " + avatar_url);
    window.location.reload();
  };

  const handleDelete = async () => {
    const res = await fetch("http://localhost:8080/api/user/me/avatar", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Avatar delete failed:", res.status, text);
      alert(`Delete failed (${res.status}): ${text}`);
      return;
    }
    setPreview("");
    setFile(null);
    alert("Avatar deleted!");
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {preview && (
        <img
          src={preview}
          alt="Avatar preview"
          style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }}
        />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button disabled={!file} onClick={handleUpload}>
        Upload Avatar
      </button>
      <button disabled={!preview} onClick={handleDelete}>
        Delete Avatar
      </button>
    </div>
  );
};