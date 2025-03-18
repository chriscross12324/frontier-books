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

    const getValidAccessToken = () => {
        const access_token = localStorage.getItem("access_token");

        if (!access_token) {
            if (confirm("This action requires you to log in.")) {
                location.href = "/#/login";
            }
            setUser(false);
            return null;
        }

        try {
            const { exp } = JSON.parse(atob(access_token.split(".")[1]));

            if (Date.now() >= exp * 1000) {
                localStorage.removeItem("access_token");
                alert("Your session has expired. Please log in again.");
                setUser(false);
                return null;
            }

            return access_token;
        } catch (err) {
            console.error("Invalid token: ", err);
            localStorage.removeItem("access_token");
            alert("This action requires you to log in.");
            setUser(false);
            return null;
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, getValidAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}