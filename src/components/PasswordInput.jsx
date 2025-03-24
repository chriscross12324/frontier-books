import styles from '../css/PageLogin.module.css'

import { useState } from "react"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const PasswordInput = ({ password, setPassword }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={{ position: "relative", width: "100%", alignItems: "center" }}>
            <input className={styles.credential_input} 
                type={showPassword ? "text" : "password"} 
                placeholder='Password' 
                value={password}
                onChange={(e) => setPassword(e.target.value)} />

            <button 
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            style={{
                    height: "100%",
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-49%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                }}>{showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}</button>
        </div>
        
    )
}

export default PasswordInput;