import React from "react";
import styles from "./Start.module.css";

interface SidebarProps {
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick }) => {
  return (
    <>
      <div className={styles.friendsSection}>
        <h2>Friends</h2>
        <ul>
          <li>Friend name</li>
          <li>Friend name</li>
          <li>Friend name</li>
        </ul>
      </div>
      <div className={styles.groupsSection}>
        <h2>Group chat</h2>
        <ul>
          <li>Group chat</li>
          <li>Group chat</li>
          <li>Group chat</li>
          <li>Group chat</li>
        </ul>
      </div>
      <div
        className={styles.settings}
        onClick={onSettingsClick}
        style={{ cursor: "pointer" }}
      >
        <p>Settings</p>
      </div>
    </>
  );
};

export default Sidebar;
