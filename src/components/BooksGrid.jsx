import { useContext, useEffect, useState } from "react";
import styles from '../css/PageHome.module.css'
import { CartContext } from "../services/CartContext"
import { useNotification } from "../components/Notification"

const BooksGrid = () => {
    const [books, setBooks] = useState([]);
    const { cart, addToCart } = useContext(CartContext);

    useEffect(() => {
        fetch("https://findthefrontier.ca/frontier_books/books")
            .then(response => response.json())
            .then(data => {
                console.log("API Response: ", data);
                setBooks(data.books || []);
            })
            .catch(error => console.error("Failed to fetch books: ", error));
    }, []);

    return (
        <section className={styles.product_list}>
            {books.map((book, index) => (
                <article key={index} className={styles.product_item}>
                    <img className={styles.product_image} src={book.cover_image_url} alt={book.title}></img>
                    <p className={styles.book_title}>{book.title}</p>
                    <p className={styles.book_author}>by: {book.author}</p>
                    <div>
                        <button className={styles.button_add} onClick={() => {addToCart(book);}}>Add to Cart</button>
                        <div className={styles.book_price_container}>
                            <p className={styles.book_price_text}>${book.price.toFixed(2)}</p>
                        </div>
                    </div>
                </article>
            ))}
        </section>
    );
};

export default BooksGrid;