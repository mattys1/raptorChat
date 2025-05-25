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
    </div>
  );
};

export default MainView;