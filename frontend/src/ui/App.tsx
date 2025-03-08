import React, { useState } from "react";
import LoginView from "./views/LoginView";
import StartView from "./views/StartView";

const App: React.FC = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
  
	const handleLoginSuccess = () => {
	  setIsLoggedIn(true);
	};
  
	return (
	  <>
		{isLoggedIn ? <StartView /> : <LoginView onLoginSuccess={handleLoginSuccess} />}
	  </>
	);
};

export default App;
