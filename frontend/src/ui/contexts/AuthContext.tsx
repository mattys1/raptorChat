import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { CentrifugoService } from "../../logic/CentrifugoService";

interface AuthState {
  userId: number;
  permissions: string[];
  token: string;
}

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

const defaultContext: AuthContextType = {
  userId: 0,
  permissions: [],
  token: "",
  login: () => {},
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [auth, setAuth] = useState<AuthState>({
    userId: 0,
    permissions: [],
    token: token || "",
  });

  // Decode token on change
  useEffect(() => {
    if (!token) {
      setAuth({ userId: 0, permissions: [], token: "" });
      return;
    }
    try {
      const decoded: any = jwtDecode(token);
      setAuth({
        userId: decoded.user_id,
        permissions: decoded.permissions || [],
        token,
      });
    } catch {
      setAuth({ userId: 0, permissions: [], token: "" });
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("uID");
		localStorage.removeItem("centrifugoToken");
		CentrifugoService.disconnect();
		setToken(null);
	};

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
