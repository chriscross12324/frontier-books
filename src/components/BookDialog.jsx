import React from "react";
import styles from "../css/BookDialog.module.css";
import { IoClose } from "react-icons/io5";

const BookDialog = ({ book, onClose }) => {
    if (!book) return null;

    return (
        <div className={styles.overlay} onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.dialog}>
                <button className={styles.buttonClose} onClick={onClose}>
                    <IoClose className={styles.iconClose} />
                </button>
                <img src={book.cover_image_url} alt={book.title} className={styles.imageCover} />
                <div className={styles.containerDetails}>
                    <h2 className={styles.textTitle}>{book.title}</h2>
                    <p className={styles.textAuthor}><strong>Author:</strong> {book.author}</p>
                    <p className={styles.textPrice}><strong>Price:</strong> ${book.price.toFixed(2)}</p>
                    <p className={styles.textDescription}>{book.description}</p>
                </div>
            </div>
        </div>
    );
};

export default BookDialog;