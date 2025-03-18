import React from "react";
import styles from "../css/BookDialog.module.css";

const BookDialog = ({ book, onClose }) => {
    if (!book) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <button className={styles.closeButton} onClick={onClose}>
                    X
                </button>
                <h2>{book.title}</h2>
                <p>{book.description}</p>
                <img src={book.cover_image_url} alt={book.title} className={styles.coverImage} />
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Price:</strong> ${book.price.toFixed(2)}</p>
            </div>
        </div>
    );
};

export default BookDialog;