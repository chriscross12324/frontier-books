import styles from '../css/PageLoginRegister.module.css'
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../services/AuthContext"
import { useNotification } from "../components/Notification"
import { IoClose } from "react-icons/io5";
import PasswordInput from '../components/PasswordInput';

export default function Login() {
    const { showNotification } = useNotification();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();

        showNotification("Logging In")

        fetch("https://findthefrontier.ca/frontier_books/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: 0, user_name: "test", user_email: email, user_password: password, user_role: "user" }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.access_token) {
                    login(data.access_token);
                    navigate("/");
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
        <div className={styles.pageBackground}>
            <div className={styles.pageContainerHolder}>
                <div className={styles.container}>
                    <button className={styles.buttonClose} onClick={() => navigate("/")}>
                        <IoClose className={styles.iconClose} />
                    </button>
                    <h1 className={styles.pageTitle}>Sign-In</h1>
                    <h2 className={styles.pageDescription}>Continue browsing the best book selection available.</h2>
                    <form onSubmit={handleLogin}>
                        <input className={styles.inputCredential} type="email" placeholder='Email' onChange={(e) => setEmail(e.target.value)}></input>
                        <PasswordInput password={password} setPassword={setPassword}/>
                        <button className={styles.buttonContinue}>Continue</button>
                    </form>

                    {/* <Link to="/register" className={styles.button_create_account}>Create Account</Link> */}
                    {error && <p className={styles.error}>{error}</p>}
                </div>
                <div className={styles.container}>
                    <h3 className={styles.noteTogglePage}>Don't have an account yet?</h3>
                    <button className={styles.buttonTogglePage} onClick={() => {navigate("/register");}}>Create Account</button>
                </div>
            </div>
            
        </div>


        
        
    );
}