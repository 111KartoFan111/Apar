import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type AuthContextValue = {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  token: null,
  setToken: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("token"));

  const setToken = (val: string | null) => {
    setTokenState(val);
    if (val) {
      localStorage.setItem("token", val);
    } else {
      localStorage.removeItem("token");
    }
  };

  const logout = () => setToken(null);

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      setTokenState(saved);
    }
  }, []);

  return <AuthContext.Provider value={{ token, setToken, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
