import styles from '../css/PageLoginRegister.module.css'
import { useState } from "react";
import { useAuth } from "../services/AuthContext"
import { useNotification } from "../components/Notification"
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router';
import PasswordInput from '../components/PasswordInput';

export default function Register() {
    const { showNotification } = useNotification();
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        showNotification("Creating Account")

        fetch("https://findthefrontier.ca/frontier_books/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: 0, user_name: username, user_email: email, user_password: password, user_role: "user" }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.access_token) {
                    login(data.access_token);
                    navigate("/");
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
        <div className={styles.pageBackground}>
            <div className={styles.pageContainerHolder}>
                <div className={styles.container}>
                    <button className={styles.buttonClose} onClick={() => navigate("/")}>
                        <IoClose className={styles.iconClose} />
                    </button>
                    <h1 className={styles.pageTitle}>Create Account</h1>
                    <h2 className={styles.pageDescription}>Welcome to the bookclub!</h2>
                    <form onSubmit={handleLogin}>
                        <input className={styles.inputCredential} type="text" placeholder='Username' onChange={(e) => setUsername(e.target.value)}></input>
                        <input className={styles.inputCredential} type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
                        <PasswordInput password={password} setPassword={setPassword}/>
                        <button className={styles.buttonContinue}>Continue</button>
                    </form>

                    {error && <p className={styles.error}>{error}</p>}
                </div>
                <div className={styles.container}>
                    <h3 className={styles.noteTogglePage}>Already have an account?</h3>
                    <button className={styles.buttonTogglePage} onClick={() => {navigate("/login");}}>Sign In</button>
                </div>
            </div>
            
        </div>
        
    );
}