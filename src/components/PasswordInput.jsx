import styles from '../css/PageLoginRegister.module.css'

import { useState } from "react"
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

const PasswordInput = ({ password, setPassword }) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className={styles.divPasswordInput}>
            <input className={styles.inputCredential} 
                type={showPassword ? "text" : "password"} 
                placeholder='Password' 
                value={password}
                onChange={(e) => setPassword(e.target.value)} />

            <button className={styles.buttonTogglePassword}
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            >{showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}</button>
        </div>
        
    )
}

export default PasswordInput;