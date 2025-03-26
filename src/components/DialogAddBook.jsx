import { useState } from "react"
import { createPortal } from "react-dom"
import { IoClose } from "react-icons/io5";
import styles from "../css/DialogAddBook.module.css"
import { useAuth } from "../services/AuthContext";
import { useNotification } from "./Notification";

const DialogAddBook = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [formData, setFormData] = useState({ book_title: "", book_author: "", book_description: "", book_price: 0.0, book_cover_image_url: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { getValidAccessToken } = useAuth();
    const { showNotification } = useNotification();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async () => {
        showNotification("Adding...")
        setLoading(true);
        setError(null);

        try {
            const response = await fetch("https://findthefrontier.ca/frontier_books/create/book", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${getValidAccessToken()}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error("Failed to create book");

            showNotification("Added!")
            onClose();
        } catch (err) {
            setError(err.message);
            console.log("Error: ", err);
            showNotification("Error!")
        } finally {
            setLoading(false);
        }
    }

    return createPortal(
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <img src={formData.book_cover_image_url} alt="Title" className={styles.imageCover} />
                <div className={styles.containerDetails}>
                    <input type="name" name="book_title" placeholder="Title" value={formData.book_title} onChange={handleChange} />
                    <input type="name" name="book_author" placeholder="Author" value={formData.book_author} onChange={handleChange} />
                    <input type="number" name="book_price" placeholder="Price" value={formData.book_price} onChange={handleChange} />
                    <input type="url" name="book_cover_image_url" placeholder="Cover URL" value={formData.book_cover_image_url} onChange={handleChange} />
                    <textarea name="book_description" placeholder="Description" value={formData.book_description} onChange={handleChange} />
                    <h2 className={styles.textTitle}>{formData.book_title}</h2>
                    <p className={styles.textAuthor}><strong>Author:</strong> {formData.book_author}</p>
                    <p className={styles.textPrice}><strong>Price:</strong> ${formData.book_price}</p>
                    <p className={styles.textDescription}>{formData.book_description}</p>
                    <div className={styles.divActions}>
                        <button className={styles.button} onClick={() => onClose()}>Cancel</button>
                        <button className={styles.button} onClick={() => {handleSubmit(); console.log("Adding...");}}>{loading ? "Submitting..." : "Submit"}</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DialogAddBook;