import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

import styles from '../css/Dialog.module.css'

const DialogContext = createContext();

export const DialogProvider = ({ children }) => {
    const [dialog, setDialog] = useState(null);

    // --- Spawn an Alert Dialog ---
    const openDialogAlert = ({ dialogTitle, dialogMessage, dialogButtonText = "OK", onConfirm }) => {
        setDialog({ type: "alert", dialogTitle, dialogMessage, dialogButtonText, onConfirm });
    };

    // --- Spawn a Confirm Dialog ---
    const openDialogConfirm = ({ dialogTitle, dialogMessage, dialogPrimaryButtonText = "Yes", dialogSecondaryButtonText = "Cancel", onConfirm }) => {
        setDialog({ type: "confirm", dialogTitle, dialogMessage, dialogPrimaryButtonText, dialogSecondaryButtonText, onConfirm });
    };

    const closeDialog = () => {
        if (dialog?.onClose) dialog.onClose();
        setDialog(null);
    };

    return (
        <DialogContext.Provider value={{ openDialogAlert, openDialogConfirm }}>
            {children}
            {dialog &&
                createPortal(
                    <div className={styles.overlay}>
                        <div className={styles.dialog_container}>
                            <h1 className={styles.dialog_title}>{dialog.dialogTitle}</h1>
                            <h2 className={styles.dialog_message}>{dialog.dialogMessage}</h2>
                            <div className={styles.buttonDiv}>
                                {dialog.type === "confirm" && (
                                    <button className={styles.button_cancel} onClick={() => closeDialog()}>{dialog.dialogSecondaryButtonText}</button>
                                )}
                                <button className={styles.button} onClick={() => {
                                    if (dialog.onConfirm) dialog.onConfirm();
                                    closeDialog();
                                }}>{dialog.dialogPrimaryButtonText}</button>
                            </div>
                            
                        </div>
                    </div>,
                    document.body
                )
            }
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    return useContext(DialogContext);
}