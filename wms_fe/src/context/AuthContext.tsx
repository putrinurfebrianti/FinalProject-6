import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  role: "superadmin" | "admin" | "supervisor" | "user";
  branch_id: number | null;
}
import axios from 'axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  // remember = true -> save to localStorage (persistent); false -> sessionStorage
  login: (token: string, user: User, remember?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user") ?? localStorage.getItem("user");
    const storedToken = sessionStorage.getItem("token") ?? localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        // set axios default header before verify
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.debug("Auth restored from storage", { user: parsedUser, token: storedToken });

        // verify token with backend
        (async () => {
          try {
            const res = await axios.get('/user');
            if (!res || res.status !== 200) {
              // token invalid -> logout
              logout();
            } else {
              // set user from server response
              setUser(res.data);
            }
          } catch (e) {
            console.warn('Token verification failed', e);
            logout();
          }
        })();
      } catch (err) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (newToken: string, newUser: User, remember = false) => {
    setToken(newToken);
    setUser(newUser);
    // write to storage based on remember flag
    if (remember) {
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", newToken);
    } else {
      sessionStorage.setItem("user", JSON.stringify(newUser));
      sessionStorage.setItem("token", newToken);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    console.debug("Auth login — token saved", { user: newUser, token: newToken, remember });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.replace("/signin");
    console.debug("Auth logout — cleared user/token");
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
