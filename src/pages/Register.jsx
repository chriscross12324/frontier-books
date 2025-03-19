import styles from '../css/PageLogin.module.css'
import { useState } from "react";
import { useAuth } from "../services/AuthContext"
import { useNotification } from "../components/Notification"
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router';

export default function Register() {
    const { showNotification } = useNotification();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    async function handleLogin(e) {
        e.preventDefault();

        showNotification("Creating Account")

        fetch("https://findthefrontier.ca/frontier_books/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: 0, user_name: username, user_email: email, user_password: password }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.access_token) {
                    login(data.access_token);
                    location.href = '/';
                    setError(null);
                    showNotification("Account Created Successfully!");
                } else {
                    setError("Account Creation Failed: Unknown");
                    showNotification("Account Creation Failed: Unknown");
                }
            })
            .catch((error) => {
                setError("Account Creation Failed: " + error.message);
                console.error("Account Creation Failed: " + error.message);
                showNotification("An unknown error occured.");
            });
    }

    return (
        <div className={styles.login_page_background}>
            <div className={styles.login_container}>
                <button className={styles.button_close} onClick={() => location.href = '/'}>
                    <IoClose className={styles.icon_close} />
                </button>
                <h1 className={styles.login_title}>Create Account</h1>
                <h2 className={styles.login_description}>Welcome to the bookclub!</h2>
                <form onSubmit={handleLogin}>
                    <input className={styles.credential_input} type="text" placeholder='Username' onChange={(e) => setUsername(e.target.value)}></input>
                    <input className={styles.credential_input} type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
                    <input className={styles.credential_input} type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)}></input>
                    <button className={styles.button}>Continue</button>
                </form>

                <Link to="/login" className={styles.button_create_account}>Sign In</Link>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
        
    );
}