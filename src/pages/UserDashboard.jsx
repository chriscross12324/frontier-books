import styles from '../css/PageUserDashboard.module.css'
import { IoChevronBackOutline, IoReload, IoSaveOutline, IoTrashOutline, IoAdd } from "react-icons/io5";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from '../services/AuthContext';
import { useNotification } from '../components/Notification';
import { useDialog } from '../services/DialogContext';
import DialogAddBook from '../components/DialogAddBook';

export default function UserDashboard() {
    const [selectedTable, setSelectedTable] = useState("orders");
    const [tableData, setTableData] = useState({});

    const { showNotification } = useNotification();
    const { openDialogConfirm } = useDialog();
    const { getValidAccessToken, logout } = useAuth();

    const tableColumnHeaders = {
        "orders": [
            { name: "Order ID", editable: false },
            { name: "Items", editable: false },
            { name: "Total Amount", editable: false },
            { name: "Delivery Address", editable: true },
            { name: "Payment Info", editable: false },
            { name: "Order Status", editable: false },
            { name: "Created At", editable: false }
        ],
    };

    const navigate = useNavigate();

    useEffect(() => {
        if (!tableData[selectedTable]) {
            fetchData(selectedTable);
        }
    }, [selectedTable]);

    const fetchData = async (section) => {
        try {
            console.debug("Fetching for: ", section)
            const response = await fetch(`https://findthefrontier.ca/frontier_books/user_orders`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getValidAccessToken()}`
                },
            });
            if (!response.ok) throw new Error("Error Getting: ", section);
            const result = await response.json();
            console.log("Result: ", result);

            setTableData((prevData) => ({
                ...prevData,
                [section]: result[section]
            }));
            console.log("Table Data: ", tableData);
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
                        {Object.keys(tableColumnHeaders).map(key => (
                            <li key={key}><button className={styles.buttonNavigation} onClick={() => {setSelectedTable(key)}}>{key.charAt(0).toUpperCase() + key.slice(1)}</button></li>
                        ))}
                        <li key='sign-out'><button className={styles.buttonNavigation} onClick={() => {logout();}}>Sign Out</button></li>
                    </ul>
                </div>
                <div className={styles.tableLayout}>
                    <div className={styles.tableHeader}>
                        <h1 className={styles.sectionTitle}>{selectedTable}</h1>
                        <div className={styles.tableHeaderActions}>
                            <button className={styles.actionButton} onClick={() => {fetchData(selectedTable); showNotification("Loading...");}}>
                                <IoReload className={styles.iconClose} />
                            </button>
                        </div>
                    </div>
                    <div className={styles.editableTableWrapper}>
                        <table className={styles.editableTable}>
                            <thead>
                                <tr>
                                    {tableColumnHeaders[selectedTable].map((title, index) => (
                                        <th key={index}>{title.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData[selectedTable] ? tableData[selectedTable].map((row, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {tableColumnHeaders[selectedTable].map((col, colIndex) => {
                                            const key = col.name.toLowerCase().replace(/\s+/g, "_");
                                            let displayValue = row[key] || "";

                                            if (key === "created_at" && displayValue) {
                                                displayValue = new Date(displayValue).toLocaleString("en-us", {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: false,
                                                });
                                            }

                                            return (
                                                <td key={colIndex}>
                                                    <input 
                                                        className={styles.tableInput}
                                                        type="text"
                                                        value={displayValue}
                                                        disabled={!col.editable}
                                                        readOnly
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                )) : (<p>No data available</p>)}
                            </tbody>
                        </table>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}