import styles from '../css/PageAdminDashboard.module.css'
import { IoChevronBackOutline } from "react-icons/io5";
import CheckoutItem from "../components/CheckoutItem";

import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { CartContext } from "../services/CartContext";

export default function AdminDashboard() {
    const [selectedSection, setSelectedSection] = useState("inventory");

    const navigate = useNavigate();

    return (
        <div className={styles.pageRootLayout}>
            <div className={styles.rowLayout}>
                <div className={styles.navigationLayout}>
                    <div className={styles.navigationHeader}>
                        <button className={styles.buttonClose} onClick={() => {navigate('/')}}>
                            <IoChevronBackOutline className={styles.iconClose} />
                        </button>
                        <h2 className={styles.navigationText}>Back</h2>
                    </div>
                    <ul>
                        <li>
                            <button className={styles.buttonNavigation} onClick={() => {setSelectedSection("inventory")}}>Inventory</button>
                        </li>
                        <li>
                            <button className={styles.buttonNavigation} onClick={() => {setSelectedSection("users")}}>Users</button>
                        </li>
                        <li>
                            <button className={styles.buttonNavigation} onClick={() => {setSelectedSection("orders")}}>Orders</button>
                        </li>
                    </ul>
                </div>
                <div className={styles.paymentLayout}>
                    <div className={styles.paymentHeader}>
                        <h1 className={styles.sectionTitle}>{selectedSection}</h1>
                    </div>
                    
                    <input type='name' placeholder='Cardholder Name'></input>
                    <input type='number' placeholder='Credit Card Number'></input>
                    <input type='month' ></input>
                    <input type='number' placeholder='CSV' maxLength={3}></input>
                </div>
            </div>
        </div>
    );
}