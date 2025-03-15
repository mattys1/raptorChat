// App.tsx
import React, { useState } from "react";
import LoginView from "./views/LoginView";
import Layout from "./Layout";
import StartMain from "./views/StartMain";
import SettingsMain from "./views/SettingsMain";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<"start" | "settings">("start");

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView("start");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView("start");
  };

  // This callback is passed to the Sidebar via Layout
  const handleSettingsClick = () => {
    setCurrentView("settings");
  };

  const renderMainContent = () => {
    if (currentView === "start") {
      return <StartMain />;
    } else if (currentView === "settings") {
      return (
        <SettingsMain
          onReturn={() => setCurrentView("start")}
          onLogout={handleLogout}
        />
      );
    }
  };

  return (
    <>
      {!isLoggedIn ? (
        <LoginView onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Layout onSettingsClick={handleSettingsClick}>
          {renderMainContent()}
        </Layout>
      )}
    </>
  );
};

export default App;
