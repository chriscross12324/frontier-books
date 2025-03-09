import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(localStorage.getItem("access_token") ? true : false);

    const login = (token) => {
        localStorage.setItem("access_token", token);
        setUser(true);
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(false);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}