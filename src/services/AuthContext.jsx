import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("frontierBooks_access_token")));
    const navigate = useNavigate();

    // --- Store the Access Token in localStorage and Update the Authentication State ---
    const login = (token) => {
        localStorage.setItem("frontierBooks_access_token", token);
        setIsAuthenticated(true);
    };

    // --- Remove the Access Token from localStorage and Update the Authentication State ---
    const logout = () => {
        localStorage.removeItem("frontierBooks_access_token");
        setIsAuthenticated(false);
    };

    // --- Redirect the User to the Login Page ---
    const redirectToLogin = () => navigate("/login");

    // --- Decode the Access Token ---
    const decodeAccessToken = (accessToken) => {
        try {
            const payload = JSON.parse(atob(accessToken.split(".")[1]));
            return payload && payload.exp ? payload : null;
        } catch {
            return null;
        }
    }

    // --- Retrieve the Access Token from localStorage ---
    const getValidAccessToken = () => {
        const accessToken = localStorage.getItem("frontierBooks_access_token");

        // Ensure the Access Token Exists
        if (!accessToken) {
            if (confirm("This action requires you to log in.")) {
                redirectToLogin();
            }
            setIsAuthenticated(false);
            return null;
        }

        // Retrieve the Access Token Expiration
        const tokenData = decodeAccessToken(accessToken);
        if (!tokenData) {
            console.error("Invalid Token");
            localStorage.removeItem("frontierBooks_access_token");
            if (confirm("This action requires you to log in.")) {
                redirectToLogin();
            }
            setIsAuthenticated(false);
            return null;
        }

        // Ensure Access Token is Still Valid
        if (Date.now() >= tokenData.exp * 1000) {
            localStorage.removeItem("frontierBooks_access_token");
            if (confirm("Your session has expired. Please log in again")) {
                redirectToLogin();
            }
            setIsAuthenticated(false);
            return null;
        }

        return accessToken;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout, getValidAccessToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    return useContext(AuthContext);
};