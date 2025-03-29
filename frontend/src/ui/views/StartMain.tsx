import React from "react";
import styles from "./Start.module.css";

const StartMain: React.FC = () => {
  return (
    <div>
      <h1>Welcome to raptorChat!</h1>
      <button className={styles.addFriendBtn}>
        <span className={styles.icon}>+</span> Add Friend
      </button>
    </div>
  );
};

export default StartMain;
