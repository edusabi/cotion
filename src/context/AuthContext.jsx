import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 verifica se já está logado ao iniciar
  useEffect(() => {
    axios.get("https://cotion.discloud.app/me", {
      withCredentials: true
    })
    .then(res => setUser(res.data))
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
  }, []);

  // 🔐 login
  async function login(email, password) {
    const res = await axios.post(
      "https://cotion.discloud.app/auth/login",
      { email, password },
      { withCredentials: true }
    );

    // depois do login, pega o usuário
    const me = await axios.get("/api/me", {
      withCredentials: true
    });

    setUser(me.data);
  }

  // 🚪 logout
  async function logout() {
    await axios.post("/api/auth/logout", {}, {
      withCredentials: true
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// hook pra usar fácil
export function useAuth() {
  return useContext(AuthContext);
}