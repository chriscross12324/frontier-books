import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router";
import { useDialog } from "./DialogContext";
import { useNotification } from "../components/Notification";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const { openDialogConfirm } = useDialog();
    const { showNotification } = useNotification();
    const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem("frontierBooks_access_token")));
    const navigate = useNavigate();

    // --- Store the Access Token in localStorage and Update the Authentication State ---
    const login = (token) => {
        localStorage.setItem("frontierBooks_access_token", token);
        setIsAuthenticated(true);
    };

    // --- Remove the Access Token from localStorage and Update the Authentication State ---
    const logout = () => {
        openDialogConfirm({
            dialogTitle: "Sign Out?",
            dialogMessage: "Signing out will end your session. Do you want to proceed?",
            onConfirm: () => {
                localStorage.removeItem("frontierBooks_access_token");
                setIsAuthenticated(false);
                showNotification("Signed Out");
            }
        });
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
            openDialogConfirm({
                dialogTitle: "Sign In Required",
                dialogMessage: "This action requires an account. Please log in or sign up to continue.",
                dialogPrimaryButtonText: "Sign In",
                onConfirm: () => {
                    redirectToLogin();
                }
            });
            setIsAuthenticated(false);
            return null;
        }

        // Retrieve the Access Token Expiration
        const tokenData = decodeAccessToken(accessToken);
        if (!tokenData) {
            console.error("Invalid Token");
            localStorage.removeItem("frontierBooks_access_token");
            openDialogConfirm({
                dialogTitle: "Sign In Required",
                dialogMessage: "This action requires an account. Please log in or sign up to continue.",
                dialogPrimaryButtonText: "Sign In",
                onConfirm: () => {
                    redirectToLogin();
                }
            });
            setIsAuthenticated(false);
            return null;
        }

        // Ensure Access Token is Still Valid
        if (Date.now() >= tokenData.exp * 1000) {
            localStorage.removeItem("frontierBooks_access_token");
            openDialogConfirm({
                dialogTitle: "Session Expired",
                dialogMessage: "For security reasons, your session has expired. Please sign in again to continue.",
                dialogPrimaryButtonText: "Sign In",
                onConfirm: () => {
                    redirectToLogin();
                }
            });
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