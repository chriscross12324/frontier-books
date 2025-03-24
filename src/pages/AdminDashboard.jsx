import styles from '../css/PageAdminDashboard.module.css'
import { IoChevronBackOutline, IoReload, IoSaveOutline, IoTrashOutline } from "react-icons/io5";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from '../services/AuthContext';
import { useNotification } from '../components/Notification';
import { useDialog } from '../services/DialogContext';

export default function AdminDashboard() {
    const [selectedTable, setSelectedTable] = useState("books");
    const [tableData, setTableData] = useState({});

    const { showNotification } = useNotification();
    const { openDialogConfirm } = useDialog();
    const { getValidAccessToken } = useAuth();

    const tableColumnHeaders = {
        "books": [
            { name: "Book ID", editable: false }, 
            { name: "Author", editable: true }, 
            { name: "Title", editable: true }, 
            { name: "Description", editable: true }, 
            { name: "Price", editable: true }, 
            { name: "Cover Image URL", editable: true }
        ],
        "users": [
            { name: "User ID", editable: false },
            { name: "Email", editable: true },
            { name: "Username", editable: true },
            { name: "Role", editable: true }
        ],
        "orders": [
            { name: "Order ID", editable: false },
            { name: "User ID", editable: false },
            { name: "Items", editable: false },
            { name: "Cost", editable: false },
            { name: "Status", editable: true }
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
            const response = await fetch(`https://findthefrontier.ca/frontier_books/${section}`, {
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
                                    <tr key={row.user_id}>
                                        {tableColumnHeaders[selectedTable].map((col, colIndex) => {

                                            //const cellValue = row[col.name.toLowerCase().replace(/\s+/g, "_")];

                                            // Debugging log: Check what data is being accessed
                                            //console.log("Value for column", col.name, ":", cellValue);

                                            return (
                                                <td key={colIndex}>
                                                    <input 
                                                        className={styles.tableInput}
                                                        type="text"
                                                        value={row[col.name.toLowerCase().replace(/\s+/g, "_")] || ""}
                                                        disabled={!col.editable}/>
                                                    
                                                </td>
                                            );
                                        })}
                                        <td className={styles.rowActions}>
                                            <button className={styles.actionButton} onClick={() => {
                                                showNotification("Saving...");
                                            }}><IoSaveOutline className={styles.iconClose} /></button>
                                            <button className={styles.actionButton} onClick={() => {
                                                openDialogConfirm({
                                                    dialogTitle: "Permanently Delete Entry?", 
                                                    dialogMessage: "This action cannot be undone. Are you sure you want to delete this entry?", 
                                                    onConfirm: () => {
                                                        showNotification("Deleting...");
                                                    }
                                                });
                                            }}><IoTrashOutline className={styles.iconClose} /></button>
                                        </td>
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