import React from "react";
import { useNavigate } from "react-router-dom";
import { useSettingsHook } from "../hooks/useSettingsHook";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../routes";

const SettingsMain: React.FC = () => {
  const navigate = useNavigate();
  const { handleChangeUsername, handleChangePassword } = useSettingsHook(navigate);
  const { permissions, logout } = useAuth();


  return (
    <div>
      <h1>Settings</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {permissions.includes("view_admin_panel") && (
          <li>
            <button onClick={() => navigate(ROUTES.ADMIN)}>
              Admin Panel
            </button>
          </li>
        )}
        <li>
          <button onClick={handleChangeUsername}>Change Username</button>
        </li>
        <li>
          <button onClick={handleChangePassword}>Change Password</button>
        </li>
        <li>
          <button onClick={() => navigate(ROUTES.LOGIN)}>Log Out</button>
        </li>
        <li>
          <button onClick={() => navigate(ROUTES.MAIN)}>
            Return to Start Screen
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SettingsMain;
