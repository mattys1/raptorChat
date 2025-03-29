import "./Start.css";
import { NavigateFunction } from "react-router-dom";

const SettingsMain = ({navigate}: {navigate: NavigateFunction} ) => {
  const handleChangeUsername = async () => {
    // try {
    //   const response = await fetch("http://localhost:8080/change-username", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ newUsername: "dummy" }),
    //   });
    // } catch (error) {
    //   console.error("Error changing username", error);
    // }
  };

  const handleChangePassword = async () => {
    // try {
    //   const response = await fetch("http://localhost:8080/change-password", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ newPassword: "dummy" }),
    //   });
    // } catch (error) {
    //   console.error("Error changing password", error);
    // }
  };

  return (
    <div>
      <h1>Settings</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <button onClick={handleChangeUsername}>Change Username</button>
        </li>
        <li>
          <button onClick={handleChangePassword}>Change Password</button>
        </li>
        <li>
          <button onClick={() => navigate("/login")}>Log Out</button>
        </li>
        <li>
          <button onClick={() => navigate("/main")}>Return to Start Screen</button>
        </li>
      </ul>
    </div>
  );
};

export default SettingsMain;
