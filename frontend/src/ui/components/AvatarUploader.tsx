import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const API_URL = "http://localhost:8080";

export const AvatarUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const { token, userId } = useAuth();

  useEffect(() => {
    if (!userId || !token) return;

    const abort = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abort.signal,
        });
        if (res.ok) {
          const user = await res.json() as { avatar_url?: string };
          if (user.avatar_url) setPreview(user.avatar_url);
        } else {
          console.error("Couldn’t fetch current user:", res.status);
        }
      } catch (err: unknown) {
        if ((err as any).name !== "AbortError") console.error(err);
      }
    })();

    return () => abort.abort();
  }, [userId, token]);

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

    const res = await fetch(`${API_URL}/api/user/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Avatar upload failed:", res.status, text);
      alert(`Upload failed (${res.status}): ${text}`);
      return;
    }

    const { avatar_url } = (await res.json()) as { avatar_url: string };
    setPreview(avatar_url);
    setFile(null);
    alert("Uploaded! New URL: " + avatar_url);
  };

  const handleDelete = async () => {
    const res = await fetch(`${API_URL}/api/user/me/avatar`, {
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
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            objectFit: "cover",
          }}
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