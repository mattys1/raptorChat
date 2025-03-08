import React from "react";
import "./Start.css";

const StartView: React.FC = () => {
  return (
    <div className="container">
      <aside className="sidebar">
        <div className="friends-section">
          <h2>Friends</h2>
          <ul>
            <li>Friend name</li>
            <li>Friend name</li>
            <li>Friend name</li>
          </ul>
        </div>
        <div className="groups-section">
          <h2>Group chat</h2>
          <ul>
            <li>Group chat</li>
            <li>Group chat</li>
            <li>Group chat</li>
            <li>Group chat</li>
          </ul>
        </div>
        <div className="settings">
          <p>Settings</p>
        </div>
      </aside>
      <main className="main-content">
        <h1>Welcome to raptorChat!</h1>
        <button className="add-friend-btn">
          <span className="icon">+</span> Add Friend
        </button>
      </main>
    </div>
  );
};

export default StartView;
