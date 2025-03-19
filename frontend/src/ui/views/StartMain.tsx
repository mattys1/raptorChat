import React from "react";
import "./Start.css";

const StartMain: React.FC = () => {
  return (
    <div>
      <h1>Welcome to raptorChat!</h1>
      <button className="add-friend-btn">
        <span className="icon">+</span> Add Friend
      </button>
    </div>
  );
};

export default StartMain;
