import React from "react";
import Sidebar from "./views/Sidebar";
import { Outlet, useNavigate } from "react-router-dom";
import { ROUTES } from "./routes";
import CallPopup from './components/CallPopup'

const Layout: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
    <CallPopup />
    <div className="flex h-screen w-full font-sans overflow-hidden">
      <aside className="w-64 bg-gray-800 text-gray-100 p-4 overflow-y-auto">
        <Sidebar
          onSettingsClick={() => {
            navigate(ROUTES.SETTINGS);
            console.log("Navigating to settings");
          }}
        />
      </aside>

      <main className="flex-1 bg-[#394A59] min-h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
    </>
  );
};

export default Layout;