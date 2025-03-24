import styles from '../css/PageAdminDashboard.module.css'
import { IoChevronBackOutline, IoReload, IoSaveOutline } from "react-icons/io5";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from '../services/AuthContext';
import { useNotification } from '../components/Notification';

export default function AdminDashboard() {
    const [selectedTable, setSelectedTable] = useState("inventory");
    const [tableData, setTableData] = useState({});

    const { showNotification } = useNotification();
    const { getValidAccessToken } = useAuth();

    const tableColumnHeaders = ({
        "inventory": ["Item ID", "Authour", "Title", "Description", "Price"],
        "users": ["User ID", "Email", "Username", "Role"],
        "orders": ["Order ID", " User ID", "Items", "Cost", "Status"],
    });

    const navigate = useNavigate();

    useEffect(() => {
        if (!tableData[selectedTable]) {
            fetchData(selectedTable);
        }
    }, [selectedTable]);

    const fetchData = async (section) => {
        try {
            const response = await fetch("https://findthefrontier.ca/frontier_books/users", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getValidAccessToken()}`
                },
            });
            if (!response.ok) throw new Error("Error Getting Users");
            const result = await response.json();

            setTableData((prevData) => ({
                ...prevData,
                [selectedTable]: result.users
            }));
            console.log(tableData);
            showNotification("Loaded Data");
        } catch (err) {
            console.log("Err: ", err.message);
            showNotification("Error");
        }
    };

    return (
        <div className={styles.pageRootLayout}>
            <div className={styles.rowLayout}>
                <div className={styles.navigationLayout}>
                    <div className={styles.navigationHeader}>
                        <button className={styles.actionButton} onClick={() => {navigate('/')}}>
                            <IoChevronBackOutline className={styles.iconClose} />
                        </button>
                        <h2 className={styles.navigationText}>Back</h2>
                    </div>
                    <ul>
                        <li><button className={styles.buttonNavigation} onClick={() => {setSelectedTable("inventory")}}>Inventory</button></li>
                        <li><button className={styles.buttonNavigation} onClick={() => {setSelectedTable("users")}}>Users</button></li>
                        <li><button className={styles.buttonNavigation} onClick={() => {setSelectedTable("orders")}}>Orders</button></li>
                    </ul>
                </div>
                <div className={styles.paymentLayout}>
                    <div className={styles.paymentHeader}>
                        <h1 className={styles.sectionTitle}>{selectedTable}</h1>
                        <div className={styles.tableHeaderActions}>
                            <button className={styles.actionButton} onClick={() => {showNotification("Saving...");}}>
                                <IoSaveOutline className={styles.iconClose} />
                            </button>
                            <button className={styles.actionButton} onClick={() => {fetchData(selectedTable); showNotification("Loading...");}}>
                                <IoReload className={styles.iconClose} />
                            </button>
                        </div>
                    </div>
                    
                    <table className={styles.editableTable}>
                        <thead>
                            <tr>
                                {tableColumnHeaders[selectedTable].map((title, index) => (
                                    <th key={index}>{title}</th>
                                ))}
                            </tr>
                            
                        </thead>
                        <tbody>
                            {tableData[selectedTable] ? tableData[selectedTable].map((row) => (
                                <tr key={row.user_id}>
                                    {tableColumnHeaders[selectedTable].map((col, index) => (
                                        <td key={index}>
                                            <input 
                                            type="text"
                                            value={row[col.toLowerCase().replace(/\s+/g, "_")] || ""}/>
                                        </td>
                                    ))}
                                </tr>
                            )) : (<p>No data available</p>)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}