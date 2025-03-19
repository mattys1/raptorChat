import React from "react";
import Sidebar from "./views/Sidebar";
import "./views/Start.css";

interface LayoutProps {
  children: React.ReactNode;
  onSettingsClick: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onSettingsClick }) => {
  return (
    <div className="container">
      <aside className="sidebar">
        <Sidebar onSettingsClick={onSettingsClick} />
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
