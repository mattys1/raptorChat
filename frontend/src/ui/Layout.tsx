import React from "react";
import Sidebar from "./views/Sidebar";
import "./views/Start.css";
import { NavigateFunction } from "react-router-dom";

interface LayoutProps {
	children: React.ReactNode
	navigate: NavigateFunction
}

const Layout: React.FC<LayoutProps> = ({ children, navigate }) => {
  return (
    <div className="container">
      <aside className="sidebar">
        <Sidebar onSettingsClick={() => {navigate("/settings"); console.log("Navigating to settings")}} />
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
