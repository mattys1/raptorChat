// frontend/src/ui/views/MainView.tsx
import React from "react";
import { useMainHook } from "../hooks/views/useStartHook";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../routes";

const MainView: React.FC = () => {
  const props = useMainHook();
  const navigate = useNavigate();

  return (
    <div
      className="
        flex flex-col items-center justify-center
        min-h-screen
        bg-[#394A59] text-white
        p-4
      "
    >
      <h1 className="text-3xl font-semibold mb-6">Welcome to raptorChat!</h1>

      <button
        className="
          mb-4
          inline-flex items-center
          bg-[#2F3C4C] hover:bg-[#3f4e5c]
          text-white
          px-4 py-2
          rounded-md
          transition-colors duration-200
        "
        onClick={() => {
        }}
      >
        <span className="mr-2 text-xl font-bold">+</span> Add Friend
      </button>

      <button
        className="
          px-4 py-2
          bg-blue-600 hover:bg-blue-700
          text-white rounded
          transition-colors duration-200
        "
        onClick={() => navigate(`${ROUTES.MAIN}/invites`)}
      >
        See invites
      </button>
    </div>
  );
};

export default MainView;