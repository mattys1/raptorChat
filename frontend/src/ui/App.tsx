import React, { useState } from "react";
import LoginView from "./views/LoginView";
import RegistrationView from "./views/RegistratiovView";
import Layout from "./Layout";
import StartMain from "./views/StartMain";
import SettingsMain from "./views/SettingsMain";

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [currentView, setCurrentView] = useState<"start" | "settings">("start");

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setCurrentView("start");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
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
        showRegistration ? (
          <RegistrationView
            onRegistrationSuccess={() => setShowRegistration(false)}
            onToggleToLogin={() => setShowRegistration(false)}
          />
        ) : (
          <LoginView onLoginSuccess={handleLoginSuccess} onToggleToRegistration={() => setShowRegistration(true)} />
        )
      ) : (
        <Layout onSettingsClick={() => setCurrentView("settings")}>
          {renderMainContent()}
        </Layout>
      )}
    </>
  );
};

export default App;
