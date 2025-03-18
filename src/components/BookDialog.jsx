import React from "react";
import styles from "../css/BookDialog.module.css";
import { IoClose } from "react-icons/io5";

const BookDialog = ({ book, onClose }) => {
    if (!book) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.dialog}>
                <button className={styles.button_close} onClick={onClose}>
                    <IoClose className={styles.icon_close} />
                </button>
                <img src={book.cover_image_url} alt={book.title} className={styles.image_cover} />
                <div className={styles.container_details}>
                    <h2 className={styles.text_title}>{book.title}</h2>
                    <p className={styles.text_author}><strong>Author:</strong> {book.author}</p>
                    <p className={styles.text_price}><strong>Price:</strong> ${book.price.toFixed(2)}</p>
                    <p className={styles.text_description}>{book.description}</p>
                </div>
            </div>
        </div>
    );
};

export default BookDialog;