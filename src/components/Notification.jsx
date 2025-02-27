import { createContext, useContext, useState } from "react"
import styles from "../css/notification.module.css"

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = (message) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message }]);

        setTimeout(() => {
            setNotifications((prev) => prev.filter((notif) => notif.id !== id));
        }, 3000);
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
          {children}
          <div className={styles.notification_container}>
            {notifications.map((notif) => (
              <div key={notif.id} className={styles.notification}>
                {notif.message}
              </div>
            ))}
          </div>
        </NotificationContext.Provider>
      );
};

export const useNotification = () => useContext(NotificationContext);