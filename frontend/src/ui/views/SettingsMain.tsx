// frontend/src/ui/views/SettingsMain.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ROUTES } from "../routes";
import { DeviceSelector } from "../components/MicrophoneSelector";
import { AvatarUploader } from "../components/AvatarUploader";

const SettingsMain: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, logout } = useAuth();

  return (
    <div className="flex-1 p-8 min-h-screen bg-[#394A59]">
      <div className="max-w-3xl mx-auto bg-[#1E2B3A] text-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <ul className="space-y-6 list-none p-0 m-0">
          {permissions.includes("view_admin_panel") && (
            <li>
              <button
                className="w-full text-left px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                onClick={() => navigate(ROUTES.ADMIN)}
              >
                Admin Panel
              </button>
            </li>
          )}

          <li className="space-y-2">
            <button
              className="w-full text-left px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              onClick={() => navigate(`${ROUTES.SETTINGS}/change-username`)}
            >
              Change Username
            </button>

            <span className="block text-gray-300 font-medium">Avatar:</span>
            <AvatarUploader />
          </li>

          <li>
            <button
              className="w-full text-left px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              onClick={() => navigate(`${ROUTES.SETTINGS}/change-password`)}
            >
              Change Password
            </button>
          </li>

          <li>
            <DeviceSelector
              storageName="selectedMicrophone"
              displayName="Microphone"
            />
          </li>
          <li>
            <DeviceSelector storageName="selectedCamera" displayName="Camera" />
          </li>

          <li>
            <button
              className="w-full text-left px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={() => {
                logout();
                navigate(ROUTES.LOGIN);
              }}
            >
              Log Out
            </button>
          </li>

          <li>
            <button
              className="w-full text-left px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              onClick={() => navigate(ROUTES.MAIN)}
            >
              Return to Start Screen
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsMain;