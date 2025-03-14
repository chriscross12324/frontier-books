import '../css/page-login.css'
import { useState } from "react";
import { useAuth } from "../services/AuthContext"
import { useNotification } from "../components/Notification"

export default function Login() {
    const { showNotification } = useNotification();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    async function handleLogin(e) {
        e.preventDefault();

        fetch("https://findthefrontier.ca/frontier_books/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: 0, user_name: "test", user_email: email, user_password: password }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.access_token) {
                    login(data.access_token);
                    location.href = '/';
                    setError(null);
                    showNotification("Login Successful!")
                } else {
                    setError("Login Failed: Invalid Credentials");
                    showNotification("Login Failed: Invalid Credentials")
                }
            })
            .catch((error) => {
                setError("Login Failed: " + error.message);
                console.error("Login Failed: " + error.message);
                showNotification("An unknown error occured.")
            });
    }

    return (
        <div className="login-container">
            <h1>Sign in with email</h1>
            <h2>Continue browsing the best books available.</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
                <input type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)}></input>
                <h3>Forgot password?</h3>
                <button>Continue</button>
            </form>
            {error && <p>{error}</p>}
        </div>
    );
}