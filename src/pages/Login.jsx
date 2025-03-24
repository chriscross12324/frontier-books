import styles from '../css/PageLogin.module.css'
import { useState } from "react";
import { useAuth } from "../services/AuthContext"
import { useNotification } from "../components/Notification"
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router';
import PasswordInput from '../components/PasswordInput';

export default function Login() {
    const { showNotification } = useNotification();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    async function handleLogin(e) {
        e.preventDefault();

        showNotification("Logging In")

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
        <div className={styles.login_page_background}>
            <div className={styles.login_container}>
                <button className={styles.button_close} onClick={() => location.href = '/'}>
                    <IoClose className={styles.icon_close} />
                </button>
                <h1 className={styles.login_title}>Sign-In</h1>
                <h2 className={styles.login_description}>Continue browsing the best book selection available.</h2>
                <form onSubmit={handleLogin}>
                    <input className={styles.credential_input} type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
                    <PasswordInput password={password} setPassword={setPassword}/>
                    <button className={styles.button}>Continue</button>
                </form>

                <Link to="/register" className={styles.button_create_account}>Create Account</Link>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        </div>
        
    );
}